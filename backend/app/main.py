import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.database.database import Base, engine
from app.database import models

                                
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AIVOA AI-First HCP CRM API",
    description="FastAPI backend for AI-driven HCP interaction management",
    version="1.0.0",
)

# Allow the frontend origin. FRONTEND_URL must be set to the Render static
# site URL in production (e.g. https://aivoa-frontend.onrender.com).
# Falls back to localhost for local development.
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
_allow_origins = [_frontend_url]

# Also accept localhost variants so local dev keeps working when FRONTEND_URL
# is set to the production URL.
if "localhost" not in _frontend_url:
    _allow_origins += [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "AIVOA HCP CRM API is running",
        "status": "healthy",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "configured",
    }