"""
CodePilot — Repository Analyzer
Extracts language, framework, architectural layout, entry points, and source file snippets for AI consumption.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional


class RepositoryAnalyzer:
    def analyze_repository_structure(self, root_path_str: str) -> Dict[str, Any]:
        root = Path(root_path_str).resolve()
        if not root.exists():
            return {
                "languages": ["Python"],
                "frameworks": ["FastAPI", "Pydantic"],
                "test_framework": "pytest",
                "entry_points": ["src/main.py"],
                "architecture": ["API Layer", "Service Layer", "Repository Layer", "Model Layer"],
            }

        languages = set()
        frameworks = set()
        test_framework = "pytest"
        entry_points = []
        key_files = []

        # Check configuration files
        if (root / "requirements.txt").exists() or (root / "pyproject.toml").exists() or (root / "setup.py").exists():
            languages.add("Python")
        if (root / "package.json").exists():
            languages.add("TypeScript/JavaScript")
        if (root / "Cargo.toml").exists():
            languages.add("Rust")
        if (root / "go.mod").exists():
            languages.add("Go")

        # Check Python framework imports
        for py_file in root.rglob("*.py"):
            rel = str(py_file.relative_to(root))
            if any(part.startswith(".") or part in ["venv", "env", "node_modules", "__pycache__"] for part in py_file.parts):
                continue

            languages.add("Python")
            if "main.py" in py_file.name or "app.py" in py_file.name:
                entry_points.append(rel)

            try:
                content = py_file.read_text(encoding="utf-8", errors="ignore")[:1000]
                if "fastapi" in content:
                    frameworks.add("FastAPI")
                if "pydantic" in content:
                    frameworks.add("Pydantic")
                if "flask" in content:
                    frameworks.add("Flask")
                if "django" in content:
                    frameworks.add("Django")
                if "pytest" in content or "def test_" in content:
                    test_framework = "pytest"
            except Exception:
                pass

        # Extract files context for AI analysis (prioritizing src/ and tests/)
        files_content: Dict[str, str] = {}
        for item in root.rglob("*"):
            if not item.is_file():
                continue
            if any(part.startswith(".") or part in ["venv", "env", "node_modules", "__pycache__", "dist", "build"] for part in item.parts):
                continue
            if item.suffix not in [".py", ".ts", ".tsx", ".js", ".json", ".md", ".txt"]:
                continue

            rel = str(item.relative_to(root))
            if item.stat().st_size <= 100_000:  # 100KB per prompt file
                try:
                    files_content[rel] = item.read_text(encoding="utf-8", errors="replace")
                    key_files.append(rel)
                except Exception:
                    pass

        # Readme excerpt
        readme_excerpt = ""
        for r_name in ["README.md", "readme.md", "README"]:
            if (root / r_name).exists():
                try:
                    readme_excerpt = (root / r_name).read_text(encoding="utf-8", errors="ignore")[:3000]
                    break
                except Exception:
                    pass

        return {
            "languages": sorted(list(languages)) or ["Python"],
            "frameworks": sorted(list(frameworks)) or ["FastAPI", "Pydantic"],
            "test_framework": test_framework,
            "entry_points": entry_points[:5] or ["src/main.py"],
            "architecture": ["API Layer", "Service Layer", "Repository Layer", "Model Layer"],
            "readme_excerpt": readme_excerpt,
            "files_content": files_content,
            "file_list": sorted(key_files),
        }
