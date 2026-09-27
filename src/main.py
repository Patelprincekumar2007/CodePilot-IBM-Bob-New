from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


