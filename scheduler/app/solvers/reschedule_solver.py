from ortools.sat.python import cp_model

from app.constraints.hard_constraints import get_required_capacity


def reschedule_timetable(request, current_schedule):
    """
    Reschedule sessions after a disruption.

    Args:
        request:
            Updated SchedulingRequest containing all sessions,
            faculty, rooms, groups and available time slots.

        current_schedule:
            Previously generated schedule as a list of dictionaries:
            {
                "session_id": "S01",
                "faculty_id": "F01",
                "room_id": "R01",
                "slot_ids": ["P1"]
            }

    Returns:
        Rescheduled timetable and list of moved sessions.
    """

    model = cp_model.CpModel()

    # Convert existing schedule into a lookup dictionary.
    old_schedule = {
        item["session_id"]: item
        for item in current_schedule
    }

    faculty_map = {f.id: f for f in request.faculty}
    room_map = {r.id: r for r in request.rooms}
    group_map = {g.id: g for g in request.student_groups}
    slot_map = {s.id: s for s in request.slots}

    # Keep slots in their supplied order.
    slots = request.slots

    variables = {}
    resource_usage = {}
    movement_penalties = []

    for session in request.sessions:

        faculty = faculty_map.get(session.faculty_id)

        if faculty is None:
            raise ValueError(
                f"Faculty {session.faculty_id} not found"
            )

        groups = [
            group_map[group_id]
            for group_id in session.group_ids
            if group_id in group_map
        ]

        if len(groups) != len(session.group_ids):
            raise ValueError(
                f"Invalid group assigned to session {session.id}"
            )

        old_assignment = old_schedule.get(session.id)
        required_capacity = get_required_capacity(session, groups)

        candidates = []

        # Generate possible room and starting-slot combinations.
        for room in request.rooms:

            if room.capacity < required_capacity:
                continue

            if room.room_type != session.required_room_type:
                continue

            if faculty.needs_accessible_room and not room.accessible:
                continue

            for start_index in range(
                len(slots) - session.duration_slots + 1
            ):

                selected_slots = slots[
                    start_index:
                    start_index + session.duration_slots
                ]

                # All selected slots must belong to the same day.
                if len({
                    slot.day for slot in selected_slots
                }) != 1:
                    continue

                # Ensure periods are consecutive.
                consecutive = True

                for i in range(len(selected_slots) - 1):
                    if (
                        selected_slots[i].end_time
                        != selected_slots[i + 1].start_time
                    ):
                        consecutive = False
                        break

                if not consecutive:
                    continue

                slot_ids = [
                    slot.id for slot in selected_slots
                ]

                # Fixed sessions cannot move from their fixed slot.
                if (
                    session.fixed_slot_id
                    and session.fixed_slot_id not in slot_ids
                ):
                    continue

                # Check faculty availability.
                if any(
                    slot_id in faculty.unavailable_slots
                    for slot_id in slot_ids
                ):
                    continue

                # Check room availability.
                if any(
                    slot_id in room.unavailable_slots
                    for slot_id in slot_ids
                ):
                    continue

                # Check group availability.
                if any(
                    slot_id in group.unavailable_slots
                    for group in groups
                    for slot_id in slot_ids
                ):
                    continue

                # Do not schedule sessions during lunch.
                lunch_conflict = False

                for slot in selected_slots:
                    start = int(slot.start_time[:2]) * 60 + int(
                        slot.start_time[3:5]
                    )
                    end = int(slot.end_time[:2]) * 60 + int(
                        slot.end_time[3:5]
                    )

                    if start < 14 * 60 and end > 13 * 60:
                        lunch_conflict = True
                        break

                if lunch_conflict:
                    continue

                # Three-hour labs can only occupy P2-P4 or P6-P8.
                if session.is_lab and session.duration_slots == 3:
                    if slot_ids not in (
                        ["P2", "P3", "P4"],
                        ["P6", "P7", "P8"]
                    ):
                        continue

                candidates.append({
                    "room_id": room.id,
                    "slot_ids": slot_ids
                })

        if not candidates:
            raise ValueError(
                f"No valid rescheduling option for session {session.id}"
            )

        candidate_variables = []

        for index, candidate in enumerate(candidates):

            variable = model.NewBoolVar(
                f"{session.id}_{index}"
            )

            variables[(session.id, index)] = variable
            candidate_variables.append(variable)

            # Track faculty, room and group conflicts.
            for slot_id in candidate["slot_ids"]:

                resources = [
                    ("faculty", session.faculty_id),
                    ("room", candidate["room_id"])
                ]

                resources.extend(
                    ("group", group_id)
                    for group_id in session.group_ids
                )

                for resource_type, resource_id in resources:
                    key = (
                        resource_type,
                        resource_id,
                        slot_id
                    )

                    resource_usage.setdefault(key, []).append(
                        variable
                    )

            # Penalize moving an existing session.
            if old_assignment:
                unchanged = (
                    old_assignment.get("room_id")
                    == candidate["room_id"]
                    and old_assignment.get("slot_ids")
                    == candidate["slot_ids"]
                )

                if not unchanged:
                    movement_penalties.append(variable * 100)

        # Every session must be scheduled exactly once.
        model.Add(sum(candidate_variables) == 1)

    # No faculty, room or group can have overlapping sessions.
    for resource_variables in resource_usage.values():
        if len(resource_variables) > 1:
            model.Add(sum(resource_variables) <= 1)

    # Minimize the number of moved existing sessions.
    if movement_penalties:
        model.Minimize(sum(movement_penalties))
    else:
        model.Minimize(0)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30

    status = solver.Solve(model)

    if status not in (
        cp_model.OPTIMAL,
        cp_model.FEASIBLE
    ):
        raise ValueError(
            "Unable to find a valid timetable after the disruption"
        )

    scheduled_sessions = []
    moved_sessions = []

    for session in request.sessions:

        for index, candidate in enumerate(
            [
                {
                    "room_id": room.id,
                    "slot_ids": [
                        slot.id for slot in slots[start:start + session.duration_slots]
                    ]
                }
                for room in request.rooms
                for start in range(
                    len(slots) - session.duration_slots + 1
                )
            ]
        ):
            # Candidate indexing must match the filtered candidate list.
            # The actual assignment is collected below instead.
            pass

    # Extract the selected candidate for each session.
    # Reconstruct the same filtered candidate list used during solving.
    for session in request.sessions:

        faculty = faculty_map[session.faculty_id]
        groups = [
            group_map[group_id]
            for group_id in session.group_ids
        ]

        candidates = []

        for room in request.rooms:
            for start_index in range(
                len(slots) - session.duration_slots + 1
            ):
                selected_slots = slots[
                    start_index:
                    start_index + session.duration_slots
                ]

                if len({
                    slot.day for slot in selected_slots
                }) != 1:
                    continue

                if any(
                    selected_slots[i].end_time
                    != selected_slots[i + 1].start_time
                    for i in range(len(selected_slots) - 1)
                ):
                    continue

                slot_ids = [slot.id for slot in selected_slots]

                if (
                    room.capacity < required_capacity
                    or room.room_type != session.required_room_type
                    or (
                        faculty.needs_accessible_room
                        and not room.accessible
                    )
                    or (
                        session.fixed_slot_id
                        and session.fixed_slot_id not in slot_ids
                    )
                    or any(
                        slot_id in faculty.unavailable_slots
                        or slot_id in room.unavailable_slots
                        for slot_id in slot_ids
                    )
                    or any(
                        slot_id in group.unavailable_slots
                        for group in groups
                        for slot_id in slot_ids
                    )
                ):
                    continue

                lunch_conflict = any(
                    int(slot.start_time[:2]) * 60
                    + int(slot.start_time[3:5]) < 14 * 60
                    and
                    int(slot.end_time[:2]) * 60
                    + int(slot.end_time[3:5]) > 13 * 60
                    for slot in selected_slots
                )

                if lunch_conflict:
                    continue

                if session.is_lab and session.duration_slots == 3:
                    if slot_ids not in (
                        ["P2", "P3", "P4"],
                        ["P6", "P7", "P8"]
                    ):
                        continue

                candidates.append({
                    "room_id": room.id,
                    "slot_ids": slot_ids
                })

        selected_candidate = None

        for index, candidate in enumerate(candidates):
            if solver.Value(variables[(session.id, index)]) == 1:
                selected_candidate = candidate
                break

        if selected_candidate is None:
            raise RuntimeError(
                f"Could not extract assignment for {session.id}"
            )

        result = {
            "session_id": session.id,
            "faculty_id": session.faculty_id,
            "room_id": selected_candidate["room_id"],
            "slot_ids": selected_candidate["slot_ids"]
        }

        scheduled_sessions.append(result)

        old_assignment = old_schedule.get(session.id)

        if old_assignment:
            if (
                old_assignment.get("room_id") != result["room_id"]
                or old_assignment.get("slot_ids") != result["slot_ids"]
            ):
                moved_sessions.append({
                    "session_id": session.id,
                    "old_room_id": old_assignment.get("room_id"),
                    "new_room_id": result["room_id"],
                    "old_slot_ids": old_assignment.get("slot_ids"),
                    "new_slot_ids": result["slot_ids"]
                })

    return {
        "success": True,
        "message": "Rescheduling completed",
        "scheduled_sessions": scheduled_sessions,
        "moved_sessions": moved_sessions,
        "moved_count": len(moved_sessions)
    }