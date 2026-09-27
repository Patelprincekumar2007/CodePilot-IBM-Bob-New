"""
CodePilot — Repositories Router
Exposes ZIP upload, Git clone, file tree browsing, and file reading endpoints.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel

from src.services.repository_ingestion import RepositoryIngestionService
from src.analysis.repository_analyzer import RepositoryAnalyzer

router = APIRouter(prefix="/api/repositories", tags=["repositories"])

ingestion_service = RepositoryIngestionService()
analyzer = RepositoryAnalyzer()

# In-memory repository registry (seeded with local repo)
REPO_REGISTRY: Dict[str, Dict[str, Any]] = {}

# Seed current local workspace as default taskflow-api
LOCAL_ROOT = Path(".").resolve()
_local_tree, _local_count = ingestion_service.build_tree(LOCAL_ROOT)
REPO_REGISTRY["taskflow-api"] = {
    "id": "taskflow-api",
    "name": "taskflow-api",
    "fullName": "Patelprincekumar2007/CodePilot-IBM-Bob",
    "defaultBranch": "main",
    "branches": ["main", "feature/frontend-react-ui"],
    "root_path": str(LOCAL_ROOT),
    "totalFiles": _local_count,
    "language": "Python",
    "status": "healthy",
    "tree": _local_tree,
    "analysis": analyzer.analyze_repository_structure(str(LOCAL_ROOT)),
}


class GitRepoRequest(BaseModel):
    url: str
    branch: str = "main"


@router.get("", response_model=List[Dict[str, Any]])
def list_repositories():
    """Returns list of connected and uploaded repositories."""
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "fullName": r.get("fullName", r["name"]),
            "defaultBranch": r.get("defaultBranch", "main"),
            "branches": r.get("branches", ["main"]),
            "totalFiles": r.get("totalFiles", 0),
            "language": r.get("language", "Python"),
            "status": r.get("status", "healthy"),
        }
        for r in REPO_REGISTRY.values()
    ]


@router.post("/upload")
async def upload_repository_zip(file: UploadFile = File(...)):
    """Uploads and extracts a repository ZIP archive."""
    if not file.filename or not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are supported.")

    content = await file.read()
    try:
        extracted = ingestion_service.extract_zip(content, file.filename)
        analysis = analyzer.analyze_repository_structure(extracted["root_path"])

        repo_obj = {
            "id": extracted["id"],
            "name": extracted["name"],
            "fullName": f"upload/{extracted['name']}",
            "defaultBranch": "main",
            "branches": ["main"],
            "root_path": extracted["root_path"],
            "totalFiles": extracted["total_files"],
            "language": analysis.get("languages", ["Python"])[0] if analysis.get("languages") else "Python",
            "status": "healthy",
            "tree": extracted["tree"],
            "analysis": analysis,
        }
        REPO_REGISTRY[extracted["id"]] = repo_obj
        return repo_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process ZIP archive: {e}")


@router.post("/git")
def connect_git_repository(req: GitRepoRequest):
    """Clones and indexes a remote git repository."""
    try:
        cloned = ingestion_service.clone_git_repo(req.url, req.branch)
        analysis = analyzer.analyze_repository_structure(cloned["root_path"])

        repo_obj = {
            "id": cloned["id"],
            "name": cloned["name"],
            "fullName": req.url.replace(".git", ""),
            "defaultBranch": req.branch,
            "branches": [req.branch],
            "root_path": cloned["root_path"],
            "totalFiles": cloned["total_files"],
            "language": analysis.get("languages", ["Python"])[0] if analysis.get("languages") else "Python",
            "status": "healthy",
            "tree": cloned["tree"],
            "analysis": analysis,
        }
        REPO_REGISTRY[cloned["id"]] = repo_obj
        return repo_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clone Git repository: {e}")


@router.get("/{repo_id}")
def get_repository(repo_id: str):
    """Retrieves repository metadata and analysis."""
    repo = REPO_REGISTRY.get(repo_id)
    if not repo:
        repo = REPO_REGISTRY.get("taskflow-api")
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo


@router.get("/{repo_id}/tree")
def get_repository_tree(repo_id: str):
    """Retrieves structured file tree for repository navigation."""
    repo = REPO_REGISTRY.get(repo_id) or REPO_REGISTRY.get("taskflow-api")
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo.get("tree", [])


@router.get("/{repo_id}/files")
def read_repository_file(repo_id: str, path: str = Query(...)):
    """Reads content of a file within the repository for Monaco editor."""
    repo = REPO_REGISTRY.get(repo_id) or REPO_REGISTRY.get("taskflow-api")
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    try:
        content = ingestion_service.read_file_content(repo["root_path"], path)
        return {"path": path, "content": content}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
