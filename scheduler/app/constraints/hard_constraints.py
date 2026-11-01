
from datetime import datetime


def get_required_capacity(session, groups):
    group_capacity = sum(group.strength for group in groups)

    if session.basket_slot and session.required_capacity > 0:
        return session.required_capacity

    return max(session.required_capacity, group_capacity)


def time_to_minutes(value):
    parsed = datetime.strptime(value, "%H:%M")
    return parsed.hour * 60 + parsed.minute


def validate_candidate(
    session,
    faculty,
    room,
    groups,
    occupied_slots
):
    """
    Check whether a session can be assigned
    to a particular room and set of time slots.

    Returns:
        (True, None) if valid
        (False, reason) if invalid
    """

    if not occupied_slots:
        return False, "No occupied slots provided"

    # 1. Fixed slot constraint
    if (
        session.fixed_slot_id
        and session.fixed_slot_id != occupied_slots[0].id
    ):
        return False, "Session must remain in its fixed slot"

    # 2. Room capacity constraint
    required_capacity = get_required_capacity(session, groups)

    if room.capacity < required_capacity:
        return False, "Room capacity is insufficient"

    # 3. Room type constraint
    if room.room_type != session.required_room_type:
        return False, "Room type does not match"

    # 4. Accessibility constraint
    if faculty.needs_accessible_room and not room.accessible:
        return False, "Accessible room is required"

    # 5. Faculty availability
    for slot in occupied_slots:
        if slot.id in faculty.unavailable_slots:
            return False, "Faculty is unavailable"

    # 6. Room availability
    for slot in occupied_slots:
        if slot.id in room.unavailable_slots:
            return False, "Room is unavailable"

    # 7. Student group availability
    for group in groups:
        for slot in occupied_slots:
            if slot.id in group.unavailable_slots:
                return False, "Student group is unavailable"

    # 8. All slots must belong to the same day
    day = occupied_slots[0].day

    if any(slot.day != day for slot in occupied_slots):
        return False, "Session cannot cross different days"

    # 9. Slots must be consecutive
    for index in range(len(occupied_slots) - 1):
        current_end = time_to_minutes(
            occupied_slots[index].end_time
        )

        next_start = time_to_minutes(
            occupied_slots[index + 1].start_time
        )

        if current_end != next_start:
            return False, "Session slots must be consecutive"

    # 10. No session can cross lunch (13:00–14:00)
    lunch_start = 13 * 60
    lunch_end = 14 * 60

    for slot in occupied_slots:
        start = time_to_minutes(slot.start_time)
        end = time_to_minutes(slot.end_time)

        if start < lunch_end and end > lunch_start:
            return False, "Session cannot overlap lunch"

    # 11. Three-hour labs must use P2-P4 or P6-P8
    if session.is_lab and session.duration_slots == 3:
        slot_ids = [slot.id for slot in occupied_slots]

        allowed_blocks = [
            ["P2", "P3", "P4"],
            ["P6", "P7", "P8"]
        ]

        if slot_ids not in allowed_blocks:
            return False, "Three-hour lab must use P2-P4 or P6-P8"

    # 12. Duration must match the number of occupied slots
    if len(occupied_slots) != session.duration_slots:
        return False, "Incorrect session duration"

    return True, None


def add_resource_conflict_constraints(model, resource_usage):
    """
    Prevent faculty, rooms and student groups
    from being assigned to multiple sessions
    during the same slot.
    """

    for variables in resource_usage.values():
        if len(variables) > 1:
            model.Add(sum(variables) <= 1)


def add_faculty_daily_limit_constraints(
    model,
    faculty_daily_hours,
    faculty
):
    """
    Ensure faculty members do not exceed
    their maximum daily teaching hours.
    """

    for (faculty_id, day), assignments in faculty_daily_hours.items():

        max_hours = faculty[faculty_id].max_hours_per_day

        model.Add(
            sum(
                variable * duration
                for variable, duration in assignments
            ) <= max_hours
        )
