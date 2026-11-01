
from app.models.schedule import (
    TimeSlot,
    Faculty,
    Room,
    StudentGroup,
    TeachingSession,
    SchedulingRequest,
)


def make_slot_id(day, period_id):
    return f"{day}-P{period_id}"


def map_dataset_to_request(data):
    calendar = data["calendar"]

    # 1. Create teaching time slots.
    slots = []

    for day in calendar["days"]:
        for period in calendar["periods"]:
            if not period.get("teaching", False):
                continue

            slots.append(
                TimeSlot(
                    id=make_slot_id(day, period["id"]),
                    day=day,
                    start_time=period["start"],
                    end_time=period["end"],
                )
            )

    # 2. Map faculty.
    faculty_list = []

    for item in data["faculty"]:
        unavailable_slots = []

        for unavailable in item.get("unavailable", []):
            for period_id in unavailable.get("periods", []):
                unavailable_slots.append(
                    make_slot_id(unavailable["day"], period_id)
                )

        faculty_list.append(
            Faculty(
                id=item["id"],
                name=item["name"],
                max_hours_per_day=item.get("max_hours_per_day", 4),
                unavailable_slots=unavailable_slots,
                preferred_slots=[],
                needs_accessible_room=item.get("needs_accessible", False),
            )
        )

    # 3. Map room unavailability.
    room_unavailable = {}

    for item in data.get("room_unavailability", []):
        room_id = item["room_id"]

        room_unavailable.setdefault(room_id, [])

        for period_id in item.get("periods", []):
            room_unavailable[room_id].append(
                make_slot_id(item["day"], period_id)
            )

    # 4. Map rooms.
    rooms = []

    for item in data["rooms"]:
        rooms.append(
            Room(
                id=item["id"],
                name=item["name"],
                capacity=item["capacity"],
                room_type=item["type"].upper(),
                accessible=item.get("accessible", False),
                unavailable_slots=room_unavailable.get(item["id"], []),
            )
        )

    # 5. Map student groups.
    groups = []

    for item in data["student_groups"]:
        groups.append(
            StudentGroup(
                id=item["id"],
                name=item["name"],
                strength=item["size"],
                unavailable_slots=[],
            )
        )

    # 6. Map teaching sessions.
    sessions = []

    for item in data["sessions"]:
        room_types = [
            room_type.upper()
            for room_type in item.get("room_types", [])
        ]

        if not room_types:
            raise ValueError(
                f"No permitted room types for session {item['id']}"
            )

        fixed_slot_id = None
        fixed_slot = item.get("fixed_slot")

        if fixed_slot:
            if isinstance(fixed_slot, str):
                fixed_slot_id = fixed_slot

            elif isinstance(fixed_slot, dict):
                fixed_slot_id = make_slot_id(
                    fixed_slot["day"],
                    fixed_slot.get("period", fixed_slot.get("period_id")),
                )

        sessions.append(
            TeachingSession(
                id=item["id"],
                course_id=item["course_id"],
                faculty_id=item["faculty_id"],
                group_ids=item["groups"],
                duration_slots=item["duration"],
                allowed_room_types=room_types,
                required_room_type=room_types[0],
                required_capacity=item.get("size", 0),
                is_lab=item.get("kind", "").lower() == "lab",

                # Session-specific accessibility requirement.
                needs_accessible_room=item.get("needs_accessible", False),

                basket_slot=item.get("basket_slot"),
                fixed_slot_id=fixed_slot_id,
            )
        )

    return SchedulingRequest(
        slots=slots,
        faculty=faculty_list,
        rooms=rooms,
        student_groups=groups,
        sessions=sessions,
    )
