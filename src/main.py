import os
from pathlib import Path
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from src.api import users, projects, tasks, repositories_router, investigations_router

app = FastAPI(
    title="CodePilot TaskFlow API",
    description="CodePilot AI-Assisted Debugging Backend & TaskFlow API",
    version="2.0.0",
)

# Enable CORS for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core TaskFlow routers
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)

# CodePilot AI & Repository Ingestion routers
app.include_router(repositories_router.router)
app.include_router(investigations_router.router)

# Also mount /api-backend alias router for compatibility
api_backend_router = APIRouter(prefix="/api-backend")
api_backend_router.include_router(users.router)
api_backend_router.include_router(projects.router)
api_backend_router.include_router(tasks.router)
api_backend_router.include_router(repositories_router.router)
api_backend_router.include_router(investigations_router.router)
app.include_router(api_backend_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "app": "CodePilot API"}


# Mount static assets if built frontend dist directory exists
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("api-backend") or full_path in ("docs", "redoc", "openapi.json", "health"):
            return None
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/", include_in_schema=False)
    def root():
        return RedirectResponse(url="/docs")



