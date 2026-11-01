
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models.schedule import SchedulingRequest
from app.solvers.timetable_solver import generate_timetable
from app.solvers.exam_solver import generate_exam_timetable
from app.data.dataset_loader import load_dataset
from app.data.dataset_mapper import map_dataset_to_request
from app.exporters.schedule_exporter import export_schedule


router = APIRouter(
    prefix="/api/scheduling",
    tags=["Scheduling"]
)

PROJECT_ROOT = Path(__file__).resolve().parents[3]
EXPORT_PATH = PROJECT_ROOT / "exports" / "schedule.json"


# Existing endpoint: manually supplied scheduling data
@router.post("/preview")
def preview_schedule(request: SchedulingRequest):
    try:
        result = generate_timetable(request)

        if result.get("success"):
            result["export"] = export_schedule(
                result,
                output_path=str(EXPORT_PATH)
            )

        return result

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        print("Scheduling error:", error)
        raise HTTPException(
            status_code=500,
            detail="Internal scheduling error"
        )


# Generate timetable using the official CIT dataset
@router.post("/generate")
def generate_from_dataset():
    try:
        # 1. Load official dataset
        data = load_dataset()

        # 2. Map dataset for the regular timetable solver
        request = map_dataset_to_request(data)

        # 3. Generate regular timetable
        result = generate_timetable(request)

        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get(
                    "message",
                    "Timetable generation failed"
                )
            )

        # 4. Generate examination timetable
        exam_result = generate_exam_timetable(
            exams=data["exams"],
            rooms=data["rooms"],
            exam_week=data["calendar"]["exam_week"]
        )

        if not exam_result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=exam_result.get(
                    "message",
                    "Exam timetable generation failed"
                )
            )

        # 5. Attach exam assignments for the exporter
        result["exams"] = exam_result["exams"]

        # 6. Export official validator-compatible JSON
        export_result = export_schedule(
            result,
            output_path=str(EXPORT_PATH),
            dataset_id=data["dataset_id"],
            team="Campus Scheduler"
        )

        return {
            "success": True,
            "dataset_id": data["dataset_id"],
            "total_sessions": len(result["scheduled_sessions"]),
            "total_exams": exam_result["total_exams"],
            "solver_status": result["solver_status"],
            "exam_status": exam_result["message"],
            "export": export_result
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        print("Scheduling error:", error)
        raise HTTPException(
            status_code=500,
            detail="Internal scheduling error"
        )
