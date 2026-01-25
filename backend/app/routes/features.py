from fastapi import APIRouter, Query

from app.services.online_features import get_latest_features

router = APIRouter()


@router.get("/features/online")
def get_online_features(entity: str = Query(..., min_length=3, max_length=256)):
    return get_latest_features(entity)
