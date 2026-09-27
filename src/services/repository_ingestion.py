"""
CodePilot — Repository Ingestion Service
Handles ZIP upload extraction, Git cloning, path traversal sanitization, and tree building.
"""

import os
import shutil
import subprocess
import uuid
import zipfile
from pathlib import Path
from typing import Any, Dict, List, Optional

STORAGE_ROOT = Path("./storage/repositories").resolve()
STORAGE_ROOT.mkdir(parents=True, exist_ok=True)

IGNORED_DIRS = {
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "env",
    "__pycache__",
    ".pytest_cache",
    ".idea",
    ".vscode",
    "dist",
    "build",
    ".coverage",
}

IGNORED_FILES = {
    ".DS_Store",
    "Thumbs.db",
    ".env",
    ".env.local",
}

MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  # 2MB limit per file


class RepositoryIngestionService:
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = storage_dir or STORAGE_ROOT
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def extract_zip(self, zip_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Safely extracts an uploaded repository ZIP file into an isolated directory."""
        repo_id = f"repo-{uuid.uuid4().hex[:8]}"
        target_dir = (self.storage_dir / repo_id).resolve()
        target_dir.mkdir(parents=True, exist_ok=True)

        temp_zip = target_dir / "archive.zip"
        with open(temp_zip, "wb") as f:
            f.write(zip_bytes)

        with zipfile.ZipFile(temp_zip, "r") as zf:
            for member in zf.infolist():
                # Security: prevent zip-slip directory traversal
                member_path = (target_dir / member.filename).resolve()
                if not str(member_path).startswith(str(target_dir)):
                    raise ValueError(f"Illegal zip member path: {member.filename}")
                zf.extract(member, target_dir)

        if temp_zip.exists():
            temp_zip.unlink()

        # If extracted has a single root directory (e.g. repo-main/), flatten if needed
        entries = [e for e in target_dir.iterdir() if e.name not in IGNORED_DIRS and e.name not in IGNORED_FILES]
        actual_root = target_dir
        if len(entries) == 1 and entries[0].is_dir():
            actual_root = entries[0]

        repo_name = Path(filename).stem or "uploaded-repo"
        tree, total_files = self.build_tree(actual_root)

        return {
            "id": repo_id,
            "name": repo_name,
            "root_path": str(actual_root),
            "total_files": total_files,
            "tree": tree,
        }

    def clone_git_repo(self, git_url: str, branch: str = "main") -> Dict[str, Any]:
        """Clones a remote git repository shallowly into an isolated directory."""
        repo_id = f"repo-{uuid.uuid4().hex[:8]}"
        target_dir = (self.storage_dir / repo_id).resolve()
        target_dir.mkdir(parents=True, exist_ok=True)

        cmd = [
            "git",
            "clone",
            "--depth",
            "1",
            "--branch",
            branch,
            git_url,
            str(target_dir),
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            # Fallback to cloning default branch without --branch
            cmd_fallback = ["git", "clone", "--depth", "1", git_url, str(target_dir)]
            res_fallback = subprocess.run(cmd_fallback, capture_output=True, text=True, timeout=60)
            if res_fallback.returncode != 0:
                raise RuntimeError(f"Git clone failed: {result.stderr or res_fallback.stderr}")

        repo_name = git_url.rstrip("/").split("/")[-1].replace(".git", "")
        tree, total_files = self.build_tree(target_dir)

        return {
            "id": repo_id,
            "name": repo_name,
            "root_path": str(target_dir),
            "branch": branch,
            "total_files": total_files,
            "tree": tree,
        }

    def build_tree(self, root_path: Path, current_path: Optional[Path] = None) -> tuple[List[Dict[str, Any]], int]:
        """Recursively constructs a structured file tree while respecting size and ignore rules."""
        base = current_path or root_path
        nodes = []
        total_files = 0

        try:
            items = sorted(list(base.iterdir()), key=lambda x: (not x.is_dir(), x.name.lower()))
        except Exception:
            return [], 0

        for item in items:
            if item.name in IGNORED_DIRS or item.name in IGNORED_FILES or item.name.startswith("."):
                continue

            rel_path = str(item.relative_to(root_path))

            if item.is_dir():
                children, sub_count = self.build_tree(root_path, item)
                total_files += sub_count
                nodes.append({
                    "id": rel_path,
                    "name": item.name,
                    "path": rel_path,
                    "type": "directory",
                    "children": children,
                })
            else:
                total_files += 1
                size = item.stat().st_size if item.exists() else 0
                ext = item.suffix.lower()
                lang = "python" if ext == ".py" else "typescript" if ext in [".ts", ".tsx"] else "javascript" if ext in [".js", ".jsx"] else "json" if ext == ".json" else "markdown" if ext == ".md" else "plaintext"
                nodes.append({
                    "id": rel_path,
                    "name": item.name,
                    "path": rel_path,
                    "type": "file",
                    "size": size,
                    "language": lang,
                })

        return nodes, total_files

    def read_file_content(self, root_path_str: str, relative_file_path: str) -> str:
        """Safely reads content of a file within the repository."""
        root = Path(root_path_str).resolve()
        target = (root / relative_file_path).resolve()

        if not str(target).startswith(str(root)):
            raise PermissionError("Access outside repository root is prohibited")

        if not target.exists() or not target.is_file():
            raise FileNotFoundError(f"File {relative_file_path} not found")

        if target.stat().st_size > MAX_FILE_SIZE_BYTES:
            return f"# [File exceeds 2MB limit: {target.stat().st_size} bytes]"

        try:
            with open(target, "r", encoding="utf-8", errors="replace") as f:
                return f.read()
        except Exception as e:
            return f"# [Error reading file: {e}]"
