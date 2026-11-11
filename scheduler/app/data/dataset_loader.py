
import json
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = Path(__file__).resolve().parents[3]

POSSIBLE_DATASET_PATHS = [
    CURRENT_DIR / "cit_public.json",
    PROJECT_ROOT / "CrunchWeek_StarterPack" / "data" / "cit_public.json",
    Path("CrunchWeek_StarterPack/data/cit_public.json"),
    Path("/app/app/data/cit_public.json"),
    Path("/app/cit_public.json"),
]

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
    if file_path:
        path = Path(file_path)
    else:
        path = None
        for candidate in POSSIBLE_DATASET_PATHS:
            if candidate.exists():
                path = candidate
                break

    if not path or not path.exists():
        raise FileNotFoundError(
            f"CIT dataset not found. Checked: {[str(p) for p in POSSIBLE_DATASET_PATHS]}"
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
