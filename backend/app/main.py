import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.routes import router
from app.database.database import Base, engine
from app.database import models


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AIVOA AI-First HCP CRM API",
    description="FastAPI backend for AI-driven HCP interaction management",
    version="1.0.0",
)

# CORS is only needed for local development (separate dev servers).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "configured"}


# ── Serve the React frontend ──────────────────────────────────────────────────
# Render runs uvicorn from the repo root via  `cd backend && uvicorn ...`
# so the working directory when the process starts is <repo>/backend.
# frontend/dist is therefore one level up.
_HERE = Path(__file__).resolve().parent          # backend/app
_REPO_ROOT = _HERE.parents[1]                    # repo root
_FRONTEND_DIST = _REPO_ROOT / "frontend" / "dist"

if _FRONTEND_DIST.is_dir():
    _ASSETS = _FRONTEND_DIST / "assets"
    if _ASSETS.is_dir():
        app.mount("/assets", StaticFiles(directory=str(_ASSETS)), name="assets")

    @app.get("/favicon.svg", include_in_schema=False)
    def favicon():
        return FileResponse(str(_FRONTEND_DIST / "favicon.svg"))

    # Catch-all: serve index.html for any path not matched above so that
    # React client-side routing works correctly.
    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        return FileResponse(str(_FRONTEND_DIST / "index.html"))
