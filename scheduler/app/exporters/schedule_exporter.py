
import json
from pathlib import Path
from datetime import datetime, timezone


def export_schedule(
    schedule,
    output_path="../exports/schedule.json",
    dataset_id="cit-public-v1",
    team="Campus Scheduler"
):
    """Export solver output in the official validator format."""

    if hasattr(schedule, "model_dump"):
        schedule = schedule.model_dump()

    if not isinstance(schedule, dict):
        raise ValueError("Schedule must be a dictionary")

    if not schedule.get("success", False):
        raise ValueError("Cannot export an unsuccessful schedule")

    scheduled_sessions = schedule.get("scheduled_sessions", [])
    scheduled_exams = schedule.get("exams", [])

    if not isinstance(scheduled_sessions, list):
        raise ValueError("scheduled_sessions must be a list")

    if not isinstance(scheduled_exams, list):
        raise ValueError("exams must be a list")

    # --------------------------------------------------
    # 1. Export regular timetable sessions
    # --------------------------------------------------

    exported_sessions = []

    for session in scheduled_sessions:
        slot_ids = session.get("slot_ids", [])

        if not slot_ids:
            raise ValueError(
                f"No slot_ids found for session "
                f"{session.get('session_id')}"
            )

        # Example slot ID: MON-P1
        start_slot = slot_ids[0]

        try:
            day, period = start_slot.rsplit("-P", 1)
            start_period = int(period)
        except (ValueError, AttributeError):
            raise ValueError(f"Invalid slot ID: {start_slot}")

        exported_sessions.append({
            "session_id": session["session_id"],
            "day": day,
            "start_period": start_period,
            "room_id": session["room_id"]
        })

    # --------------------------------------------------
    # 2. Export examination assignments
    # --------------------------------------------------

    exported_exams = []

    for exam in scheduled_exams:

        required_fields = [
            "exam_id",
            "day",
            "session",
            "rooms"
        ]

        for field in required_fields:
            if field not in exam:
                raise ValueError(
                    f"Missing {field} in exam assignment"
                )

        if not isinstance(exam["rooms"], list) or not exam["rooms"]:
            raise ValueError(
                f"No rooms assigned to exam {exam['exam_id']}"
            )

        exported_exams.append({
            "exam_id": exam["exam_id"],
            "day": exam["day"],
            "session": exam["session"],
            "rooms": exam["rooms"]
        })

    # --------------------------------------------------
    # 3. Build official schedule JSON
    # --------------------------------------------------

    export_data = {
        "dataset_id": dataset_id,
        "team": team,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sessions": exported_sessions,
        "exams": exported_exams
    }

    # --------------------------------------------------
    # 4. Write JSON file
    # --------------------------------------------------

    file_path = Path(output_path)
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with file_path.open("w", encoding="utf-8") as file:
        json.dump(
            export_data,
            file,
            indent=4,
            ensure_ascii=False
        )

    return {
        "success": True,
        "file_path": str(file_path),
        "total_sessions": len(exported_sessions),
        "total_exams": len(exported_exams)
    }
