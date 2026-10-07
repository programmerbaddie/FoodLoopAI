"""V1 API router bundle for FoodLoop AI."""
from fastapi import APIRouter
from app.api.v1.overview import router as overview_router
from app.api.v1.demand import router as demand_router
from app.api.v1.surplus import router as surplus_router
from app.api.v1.safety import router as safety_router
from app.api.v1.matching import router as matching_router
from app.api.v1.redistribution import router as redistribution_router
from app.api.v1.impact import router as impact_router
from app.api.v1.learning import router as learning_router

v1_router = APIRouter()

v1_router.include_router(overview_router)
v1_router.include_router(demand_router)
v1_router.include_router(surplus_router)
v1_router.include_router(safety_router)
v1_router.include_router(matching_router)
v1_router.include_router(redistribution_router)
v1_router.include_router(impact_router)
v1_router.include_router(learning_router)

__all__ = ["v1_router"]
