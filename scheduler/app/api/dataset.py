
from fastapi import APIRouter, HTTPException

from app.data.dataset_loader import (
    load_dataset,
    get_dataset_summary
)

router = APIRouter(
    prefix="/api/dataset",
    tags=["Dataset"]
)


@router.get("/summary")
def dataset_summary():
    try:
        data = load_dataset()
        return {
            "success": True,
            "summary": get_dataset_summary(data)
        }

    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/sessions")
def get_sessions():
    try:
        data = load_dataset()

        return {
            "success": True,
            "total": len(data["sessions"]),
            "sessions": data["sessions"]
        }

    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
