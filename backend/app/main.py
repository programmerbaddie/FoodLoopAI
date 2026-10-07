"""FoodLoop AI - FastAPI Application Entry Point.

Problem Statement: SIH26234
AI-Powered Smart Food Waste Reduction and Sustainable Redistribution Ecosystem
for Institutional Kitchens and Food Processing Units
Ministry of Food Processing Industries (MoFPI) | Team: IMPACT INNOVATOR
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.health import router as health_router
from app.api import api_router

app = FastAPI(
    title="FoodLoop AI Backend API",
    description=(
        "Core API services for FoodLoop AI — An AI-powered food waste reduction, "
        "verification, and sustainable redistribution ecosystem for institutional kitchens "
        "and food processing units (SIH26234, Ministry of Food Processing Industries)."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include root health endpoint for direct /health queries
app.include_router(health_router)

# Include versioned API routes
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    """Root entrypoint returning basic API identity and documentation links."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "health_check": "/health",
        "environment": settings.ENVIRONMENT,
        "loop_stages": [
            "PREDICT",
            "PREVENT",
            "VERIFY",
            "MATCH",
            "REDISTRIBUTE",
            "TRACK",
            "LEARN",
        ],
    }


if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=port,
        reload=settings.ENVIRONMENT == "development",
    )
