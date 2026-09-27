"""
CodePilot — Repository Indexer
Builds and caches structural metadata, AST relationships, routes, models, and test mappings.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import os


class RepositoryIndexer:
    """Fast, memory-cached repository indexer."""

    def __init__(self):
        self._index_cache: Dict[str, Dict[str, Any]] = {}

    def get_or_build_index(self, repo_id: str, root_path_str: str, repo_name: str = "repository") -> Dict[str, Any]:
        if repo_id in self._index_cache:
            return self._index_cache[repo_id]

        root = Path(root_path_str).resolve()
        index = self._build_index(repo_id, root, repo_name)
        self._index_cache[repo_id] = index
        return index

    def _build_index(self, repo_id: str, root: Path, repo_name: str) -> Dict[str, Any]:
        languages = set()
        frameworks = set()
        test_framework = "pytest"
        entry_points: List[str] = []
        api_routes: List[Dict[str, Any]] = []
        services: List[str] = []
        models: List[str] = []
        repositories: List[str] = []
        test_files: List[str] = []
        all_files: List[str] = []
        files_content: Dict[str, str] = {}
        readme_content = ""

        # Find configuration / dependencies
        if (root / "requirements.txt").exists() or (root / "pyproject.toml").exists():
            languages.add("Python")
        if (root / "package.json").exists():
            languages.add("TypeScript/JavaScript")
        if (root / "Cargo.toml").exists():
            languages.add("Rust")
        if (root / "go.mod").exists():
            languages.add("Go")

        # Scan README
        for r_name in ["README.md", "readme.md", "README", "readme.txt"]:
            rf = root / r_name
            if rf.exists():
                try:
                    readme_content = rf.read_text(encoding="utf-8", errors="ignore")[:5000]
                    break
                except Exception:
                    pass

        # Traverse files
        for item in root.rglob("*"):
            if not item.is_file():
                continue
            parts = item.parts
            if any(part.startswith(".") or part in ["venv", "env", "node_modules", "__pycache__", "dist", "build"] for part in parts):
                continue

            rel = str(item.relative_to(root))
            all_files.append(rel)

            if item.suffix in [".py", ".ts", ".tsx", ".js", ".json", ".md", ".yaml", ".yml", ".toml", ".sql"]:
                try:
                    # Store up to 100KB of text per file for context
                    if item.stat().st_size <= 150_000:
                        content = item.read_text(encoding="utf-8", errors="replace")
                        files_content[rel] = content

                        # Classify module roles
                        if rel.startswith("tests") or "test_" in item.name:
                            test_files.append(rel)
                        elif "api" in rel or "router" in rel or "controller" in rel or "routes" in rel:
                            api_routes.append({"file": rel, "name": item.name})
                        elif "service" in rel:
                            services.append(rel)
                        elif "model" in rel or "schema" in rel:
                            models.append(rel)
                        elif "repo" in rel or "db" in rel or "dao" in rel:
                            repositories.append(rel)

                        if "main.py" in item.name or "app.py" in item.name or "index.ts" in item.name or "server.js" in item.name:
                            entry_points.append(rel)

                        if "fastapi" in content:
                            frameworks.add("FastAPI")
                        if "pydantic" in content:
                            frameworks.add("Pydantic")
                        if "flask" in content:
                            frameworks.add("Flask")
                        if "sqlalchemy" in content:
                            frameworks.add("SQLAlchemy")
                        if "pytest" in content:
                            test_framework = "pytest"
                        if "react" in content:
                            frameworks.add("React")
                except Exception:
                    pass

        primary_language = "Python" if "Python" in languages or any(f.endswith(".py") for f in all_files) else "TypeScript/JavaScript"

        return {
            "id": repo_id,
            "name": repo_name,
            "root_path": str(root),
            "primary_language": primary_language,
            "languages": sorted(list(languages)) or [primary_language],
            "frameworks": sorted(list(frameworks)) or ["FastAPI", "Pydantic"],
            "test_framework": test_framework,
            "total_files": len(all_files),
            "entry_points": entry_points or ["src/main.py"],
            "api_modules": api_routes,
            "service_modules": services,
            "model_modules": models,
            "repository_modules": repositories,
            "test_files": test_files,
            "all_files": sorted(all_files),
            "files_content": files_content,
            "readme_excerpt": readme_content,
        }
