import os
from pathlib import Path

from fastapi import FastAPI, Request
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

# API routes — registered first so they are never shadowed by the catch-all.
app.include_router(router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "configured"}


# ── Serve the React frontend ──────────────────────────────────────────────────
_HERE = Path(__file__).resolve().parent   # backend/app
_REPO_ROOT = _HERE.parents[1]             # repo root
_FRONTEND_DIST = _REPO_ROOT / "frontend" / "dist"

if _FRONTEND_DIST.is_dir():
    _ASSETS = _FRONTEND_DIST / "assets"
    if _ASSETS.is_dir():
        app.mount("/assets", StaticFiles(directory=str(_ASSETS)), name="assets")

    # Serve other static files that Vite emits at the root (icons, manifest …)
    _PUBLIC = StaticFiles(directory=str(_FRONTEND_DIST))

    @app.get("/favicon.svg", include_in_schema=False)
    def favicon():
        return FileResponse(str(_FRONTEND_DIST / "favicon.svg"))

    @app.get("/icons.svg", include_in_schema=False)
    def icons():
        return FileResponse(str(_FRONTEND_DIST / "icons.svg"))

    # Catch-all: anything that is NOT an /api/* or /health route gets
    # index.html so React Router handles client-side navigation.
    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str, request: Request):
        # Never intercept API calls — return 404 JSON instead of index.html.
        if full_path.startswith("api/"):
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        index = _FRONTEND_DIST / "index.html"
        return FileResponse(str(index))
