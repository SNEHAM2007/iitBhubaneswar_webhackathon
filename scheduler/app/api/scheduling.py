from pathlib import Path
import json

from fastapi import APIRouter, HTTPException

from app.models.schedule import SchedulingRequest
from app.solvers.timetable_solver import generate_timetable
from app.solvers.exam_solver import generate_exam_timetable
from app.solvers.reschedule_solver import reschedule_timetable
from app.data.dataset_loader import load_dataset
from app.data.dataset_mapper import map_dataset_to_request
from app.exporters.schedule_exporter import export_schedule


router = APIRouter(
    prefix="/api/scheduling",
    tags=["Scheduling"]
)

PROJECT_ROOT = Path(__file__).resolve().parents[3]
# Fallback export paths if running in isolated container
_base_dir = PROJECT_ROOT if (PROJECT_ROOT / "exports").exists() or (PROJECT_ROOT / "CrunchWeek_StarterPack").exists() else Path(".")
EXPORT_PATH = _base_dir / "exports" / "schedule.json"
EXPORT_AFTER_PATH = _base_dir / "exports" / "schedule_after.json"

try:
    EXPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
except Exception:
    pass

PERIOD_TIMES = {
    1: ("08:00", "09:00"),
    2: ("09:00", "10:00"),
    3: ("10:00", "11:00"),
    4: ("11:00", "12:00"),
    5: ("12:00", "13:00"),
    6: ("14:00", "15:00"),
    7: ("15:00", "16:00"),
    8: ("16:00", "17:00"),
    9: ("17:00", "18:00"),
}

DAY_NAMES = {
    "MON": "Monday",
    "TUE": "Tuesday",
    "WED": "Wednesday",
    "THU": "Thursday",
    "FRI": "Friday",
    "SAT": "Saturday",
}


def build_timetable_from_assignments(assignments, data):
    sessions_by_id = {s["id"]: s for s in data["sessions"]}
    courses_by_id = {c["id"]: c for c in data["courses"]}
    faculty_by_id = {f["id"]: f for f in data["faculty"]}
    rooms_by_id = {r["id"]: r for r in data["rooms"]}
    groups_by_id = {g["id"]: g for g in data["student_groups"]}

    timetable = []
    for item in assignments:
        session_id = item.get("session_id")
        session = sessions_by_id.get(session_id)
        if not session:
            continue

        day_code = item.get("day")
        start_period = item.get("start_period")
        duration = session.get("duration", 1)
        end_period = start_period + duration - 1

        start_time = PERIOD_TIMES.get(start_period, ("08:00", "09:00"))[0]
        end_time = PERIOD_TIMES.get(end_period, ("09:00", "10:00"))[1]

        course = courses_by_id.get(session["course_id"], {})
        group_ids = session.get("groups", [])
        primary_group = groups_by_id.get(group_ids[0], {}) if group_ids else {}
        faculty_member = faculty_by_id.get(session.get("faculty_id"), {})
        room_id = item.get("room_id")
        room = rooms_by_id.get(room_id, {})

        timetable.append({
            "id": session["id"],
            "day": DAY_NAMES.get(day_code, day_code),
            "startTime": start_time,
            "time": f"{start_time} - {end_time}",
            "subject": course.get("title", session["course_id"]),
            "courseCode": session["course_id"],
            "faculty": faculty_member.get("name", session.get("faculty_id", "")),
            "roomId": room_id,
            "room": room.get("name", room_id),
            "department": primary_group.get("department", course.get("department", "")),
            "year": primary_group.get("year", course.get("year", 1)),
            "groups": [
                groups_by_id.get(gid, {}).get("name", gid)
                for gid in group_ids
            ],
            "kind": session.get("kind", "lecture"),
            "duration": duration,
        })

    return timetable


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


# Retrieve current generated schedule
@router.get("/latest")
def get_latest_schedule():
    try:
        if not EXPORT_PATH.exists():
            return {
                "success": True,
                "has_schedule": False,
                "timetable": [],
                "exams": [],
                "message": "No schedule generated yet"
            }

        with open(EXPORT_PATH, "r", encoding="utf-8") as f:
            export_data = json.load(f)

        data = load_dataset()
        timetable = build_timetable_from_assignments(export_data.get("sessions", []), data)

        return {
            "success": True,
            "has_schedule": True,
            "dataset_id": export_data.get("dataset_id"),
            "team": export_data.get("team"),
            "generated_at": export_data.get("generated_at"),
            "total_sessions": len(timetable),
            "total_exams": len(export_data.get("exams", [])),
            "timetable": timetable,
            "exams": export_data.get("exams", [])
        }

    except Exception as error:
        print("Error fetching latest schedule:", error)
        raise HTTPException(status_code=500, detail=str(error))


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

        sessions_by_id = {
            session["id"]: session
            for session in data["sessions"]
        }
        courses_by_id = {
            course["id"]: course
            for course in data["courses"]
        }
        faculty_by_id = {
            member["id"]: member
            for member in data["faculty"]
        }
        rooms_by_id = {
            room["id"]: room
            for room in data["rooms"]
        }
        groups_by_id = {
            group["id"]: group
            for group in data["student_groups"]
        }
        slots_by_id = {
            slot.id: slot
            for slot in request.slots
        }
        timetable = []

        for assignment in result["scheduled_sessions"]:
            session = sessions_by_id[assignment["session_id"]]
            start_slot = slots_by_id[assignment["slot_ids"][0]]
            end_slot = slots_by_id[assignment["slot_ids"][-1]]
            group = groups_by_id[session["groups"][0]]
            course = courses_by_id[session["course_id"]]

            timetable.append({
                "id": session["id"],
                "day": DAY_NAMES.get(start_slot.day, start_slot.day),
                "startTime": start_slot.start_time,
                "time": f"{start_slot.start_time} - {end_slot.end_time}",
                "subject": course["title"],
                "courseCode": session["course_id"],
                "faculty": faculty_by_id[session["faculty_id"]]["name"],
                "roomId": assignment["room_id"],
                "room": rooms_by_id[assignment["room_id"]]["name"],
                "department": group["department"],
                "year": group["year"],
                "groups": [
                    groups_by_id[group_id]["name"]
                    for group_id in session["groups"]
                ],
                "kind": session["kind"],
                "duration": len(assignment["slot_ids"]),
            })

        return {
            "success": True,
            "dataset_id": data["dataset_id"],
            "total_sessions": len(result["scheduled_sessions"]),
            "total_exams": exam_result["total_exams"],
            "solver_status": result["solver_status"],
            "exam_status": exam_result["message"],
            "timetable": timetable,
            "exams": exam_result["exams"],
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
