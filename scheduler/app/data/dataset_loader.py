
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DEFAULT_DATASET_PATH = (
    PROJECT_ROOT
    / "CrunchWeek_StarterPack"
    / "data"
    / "cit_public.json"
)

REQUIRED_KEYS = [
    "calendar",
    "faculty",
    "rooms",
    "student_groups",
    "sessions",
    "booking_requests",
    "room_unavailability",
]


def load_dataset(file_path=None):
    path = Path(file_path) if file_path else DEFAULT_DATASET_PATH

    if not path.exists():
        raise FileNotFoundError(
            f"CIT dataset not found: {path}"
        )

    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, dict):
        raise ValueError("Dataset root must be a JSON object")

    missing = [key for key in REQUIRED_KEYS if key not in data]

    if missing:
        raise ValueError(f"Missing dataset sections: {missing}")

    for key in REQUIRED_KEYS[1:]:
        if not isinstance(data[key], list):
            raise ValueError(f"{key} must be a list")

    return data


def get_dataset_summary(data):
    return {
        "dataset_id": data.get("dataset_id"),
        "institute": data.get("institute"),
        "total_days": len(data["calendar"].get("days", [])),
        "total_periods": len(data["calendar"].get("periods", [])),
        "total_faculty": len(data["faculty"]),
        "total_rooms": len(data["rooms"]),
        "total_groups": len(data["student_groups"]),
        "total_sessions": len(data["sessions"]),
        "total_booking_requests": len(data["booking_requests"]),
        "total_room_unavailability": len(data["room_unavailability"]),
    }
