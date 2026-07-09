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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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