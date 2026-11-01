
from datetime import datetime

from app.constraints.hard_constraints import get_required_capacity


def to_minutes(value):
    parsed = datetime.strptime(value, "%H:%M")
    return parsed.hour * 60 + parsed.minute


def validate_schedule(request, scheduled_sessions):
    errors = []

    slots = {slot.id: slot for slot in request.slots}
    faculty = {item.id: item for item in request.faculty}
    rooms = {item.id: item for item in request.rooms}
    groups = {item.id: item for item in request.student_groups}
    sessions = {item.id: item for item in request.sessions}

    # Track occupied resources.
    faculty_usage = {}
    room_usage = {}
    group_usage = {}
    faculty_daily_hours = {}

    scheduled_ids = []

    for assignment in scheduled_sessions:
        session_id = assignment["session_id"]

        if session_id not in sessions:
            errors.append(f"Unknown session: {session_id}")
            continue

        session = sessions[session_id]

        faculty_id = assignment["faculty_id"]
        room_id = assignment["room_id"]
        slot_ids = assignment["slot_ids"]

        scheduled_ids.append(session_id)

        if faculty_id not in faculty:
            errors.append(f"Unknown faculty: {faculty_id}")
            continue

        if room_id not in rooms:
            errors.append(f"Unknown room: {room_id}")
            continue

        teacher = faculty[faculty_id]
        room = rooms[room_id]

        # 1. Check faculty assignment.
        if faculty_id != session.faculty_id:
            errors.append(
                f"{session_id}: Incorrect faculty assigned"
            )

        # 2. Check session duration.
        if len(slot_ids) != session.duration_slots:
            errors.append(
                f"{session_id}: Incorrect session duration"
            )

        # 3. Check duplicate or unknown periods.
        if len(set(slot_ids)) != len(slot_ids):
            errors.append(
                f"{session_id}: Duplicate period assigned"
            )

        if any(slot_id not in slots for slot_id in slot_ids):
            errors.append(
                f"{session_id}: Unknown time slot"
            )
            continue

        occupied = [slots[slot_id] for slot_id in slot_ids]

        if not occupied:
            errors.append(
                f"{session_id}: No time slot assigned"
            )
            continue

        # 4. Fixed slot constraint.
        if (
            session.fixed_slot_id
            and slot_ids[0] != session.fixed_slot_id
        ):
            errors.append(
                f"{session_id}: Fixed slot constraint violated"
            )

        # 5. Same day constraint.
        day = occupied[0].day

        if any(slot.day != day for slot in occupied):
            errors.append(
                f"{session_id}: Session crosses different days"
            )

        # 6. Consecutive periods.
        for i in range(len(occupied) - 1):
            current_end = to_minutes(occupied[i].end_time)
            next_start = to_minutes(occupied[i + 1].start_time)

            if current_end != next_start:
                errors.append(
                    f"{session_id}: Periods are not consecutive"
                )
                break

        # 7. Room capacity.
        required_capacity = get_required_capacity(
            session,
            [
                groups[group_id]
                for group_id in session.group_ids
                if group_id in groups
            ],
        )

        if room.capacity < required_capacity:
            errors.append(
                f"{session_id}: Insufficient room capacity"
            )

        # 8. Room type.
        allowed_room_types = (
            session.allowed_room_types or [session.required_room_type]
        )
        if room.room_type not in allowed_room_types:
            errors.append(
                f"{session_id}: Incorrect room type"
            )

        # 9. Accessibility.
        if teacher.needs_accessible_room and not room.accessible:
            errors.append(
                f"{session_id}: Accessible room required"
            )

        for slot_id in slot_ids:
            slot = slots[slot_id]

            # 10. Lunch break.
            start = to_minutes(slot.start_time)
            end = to_minutes(slot.end_time)

            if start < 14 * 60 and end > 13 * 60:
                errors.append(
                    f"{session_id}: Lunch break violation"
                )

            # 11. Faculty availability.
            if slot_id in teacher.unavailable_slots:
                errors.append(
                    f"{session_id}: Faculty unavailable"
                )

            # 12. Room availability.
            if slot_id in room.unavailable_slots:
                errors.append(
                    f"{session_id}: Room unavailable"
                )

            # 13. Faculty clash.
            key = (faculty_id, slot_id)

            if key in faculty_usage:
                errors.append(
                    f"Faculty clash: {faculty_id} at {slot_id}"
                )

            faculty_usage[key] = session_id

            # 14. Room clash.
            key = (room_id, slot_id)

            if key in room_usage:
                errors.append(
                    f"Room clash: {room_id} at {slot_id}"
                )

            room_usage[key] = session_id

            # 15. Student group availability and clashes.
            for group_id in session.group_ids:

                if group_id not in groups:
                    errors.append(
                        f"{session_id}: Unknown group {group_id}"
                    )
                    continue

                group = groups[group_id]

                if slot_id in group.unavailable_slots:
                    errors.append(
                        f"{session_id}: Group {group_id} unavailable"
                    )

                key = (group_id, slot_id)

                if key in group_usage:
                    previous_session = sessions[group_usage[key]]
                    same_basket = (
                        session.basket_slot is not None
                        and session.basket_slot
                        == previous_session.basket_slot
                    )
                    if not same_basket:
                        errors.append(
                            f"Student group clash: {group_id} at {slot_id}"
                        )

                group_usage[key] = session_id

            # Faculty daily workload.
            key = (faculty_id, day)
            faculty_daily_hours[key] = (
                faculty_daily_hours.get(key, 0)
                + (end - start) / 60
            )

        # 16. Three-hour laboratory restriction.
        if session.is_lab and session.duration_slots == 3:
            allowed_blocks = [
                ["P2", "P3", "P4"],
                ["P6", "P7", "P8"]
            ]
            period_ids = [
                f"P{slot_id.rsplit('-P', 1)[-1]}"
                if "-P" in slot_id
                else slot_id
                for slot_id in slot_ids
            ]

            if period_ids not in allowed_blocks:
                errors.append(
                    f"{session_id}: Invalid three-hour lab block"
                )

    # 17. Every session must be scheduled exactly once.
    for session_id in sessions:
        count = scheduled_ids.count(session_id)

        if count == 0:
            errors.append(
                f"Session not scheduled: {session_id}"
            )
        elif count > 1:
            errors.append(
                f"Session scheduled multiple times: {session_id}"
            )

    # 18. Faculty daily teaching-hour limit.
    for (faculty_id, day), hours in faculty_daily_hours.items():

        limit = faculty[faculty_id].max_hours_per_day

        if hours > limit:
            errors.append(
                f"Faculty {faculty_id} exceeds daily limit on {day}"
            )

    return {
        "valid": len(errors) == 0,
        "total_sessions": len(sessions),
        "scheduled_sessions": len(set(scheduled_ids)),
        "total_violations": len(errors),
        "errors": errors
    }
