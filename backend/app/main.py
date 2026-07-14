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
# In production the frontend is served by FastAPI itself, so same origin.
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
    return {
        "status": "healthy",
        "database": "configured",
    }


# ── Serve the React frontend ──────────────────────────────────────────────────
# The built frontend lives at  <repo-root>/frontend/dist  which, relative to
# this file (backend/app/main.py), is two levels up then into frontend/dist.
_FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

if _FRONTEND_DIST.is_dir():
    # Serve static assets (JS, CSS, images …)
    app.mount(
        "/assets",
        StaticFiles(directory=_FRONTEND_DIST / "assets"),
        name="assets",
    )

    @app.get("/favicon.svg", include_in_schema=False)
    def favicon():
        return FileResponse(_FRONTEND_DIST / "favicon.svg")

    # Catch-all: return index.html for any route not matched above so that
    # React Router (client-side routing) works correctly.
    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        index = _FRONTEND_DIST / "index.html"
        return FileResponse(index)
