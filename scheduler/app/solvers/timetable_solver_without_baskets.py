from datetime import datetime
from collections import defaultdict

from ortools.sat.python import cp_model

from app.constraints.hard_constraints import get_required_capacity


def time_to_minutes(value: str) -> int:
    parsed = datetime.strptime(value, "%H:%M")
    return parsed.hour * 60 + parsed.minute


def get_period_number(slot_id: str) -> int:
    return int(slot_id.split("-P")[-1])


def generate_timetable(request):
    model = cp_model.CpModel()

    # --------------------------------------------------
    # 1. Prepare dataset
    # --------------------------------------------------
    slots = request.slots
    faculty = {item.id: item for item in request.faculty}
    rooms = {item.id: item for item in request.rooms}
    groups = {item.id: item for item in request.student_groups}

    candidates = {}
    # Faculty and room occupancy only. Student-group occupancy is
    # handled separately so parallel alternatives in an elective
    # basket can share the same student groups.
    resource_usage = defaultdict(list)
    group_usage = defaultdict(list)
    faculty_daily_hours = defaultdict(list)
    basket_sessions = defaultdict(list)
    objective_terms = []

    # --------------------------------------------------
    # 2. Generate valid assignment candidates
    # --------------------------------------------------
    for session in request.sessions:
        if session.faculty_id not in faculty:
            raise ValueError(f"Unknown faculty: {session.faculty_id}")

        unknown_groups = [
            group_id
            for group_id in session.group_ids
            if group_id not in groups
        ]
        if unknown_groups:
            raise ValueError(
                f"Unknown student group(s) in session {session.id}: "
                f"{unknown_groups}"
            )

        if session.duration_slots <= 0:
            raise ValueError(f"Invalid duration for session: {session.id}")

        teacher = faculty[session.faculty_id]

        required_capacity = get_required_capacity(
            session,
            [groups[group_id] for group_id in session.group_ids],
        )

        allowed_types = (
            session.allowed_room_types or [session.required_room_type]
        )

        candidates[session.id] = []

        for room in rooms.values():
            if room.capacity < required_capacity:
                continue

            if room.room_type not in allowed_types:
                continue

            if teacher.needs_accessible_room and not room.accessible:
                continue

            for start_index, start_slot in enumerate(slots):
                # Fixed starting slot.
                if (
                    session.fixed_slot_id
                    and session.fixed_slot_id != start_slot.id
                ):
                    continue

                end_index = start_index + session.duration_slots
                if end_index > len(slots):
                    continue

                occupied_slots = slots[start_index:end_index]

                # All occupied periods must be on the same day.
                if any(item.day != start_slot.day for item in occupied_slots):
                    continue

                # Periods must be consecutive in clock time.
                consecutive = True
                for index in range(len(occupied_slots) - 1):
                    current_end = time_to_minutes(
                        occupied_slots[index].end_time
                    )
                    next_start = time_to_minutes(
                        occupied_slots[index + 1].start_time
                    )
                    if current_end != next_start:
                        consecutive = False
                        break

                if not consecutive:
                    continue

                slot_ids = [item.id for item in occupied_slots]

                # Three-hour labs may start only at P2 or P6.
                if session.is_lab and session.duration_slots == 3:
                    if get_period_number(start_slot.id) not in (2, 6):
                        continue

                # Faculty unavailability.
                if any(
                    slot_id in teacher.unavailable_slots
                    for slot_id in slot_ids
                ):
                    continue

                # Room unavailability.
                if any(
                    slot_id in room.unavailable_slots
                    for slot_id in slot_ids
                ):
                    continue

                # Student-group unavailability.
                if any(
                    slot_id in groups[group_id].unavailable_slots
                    for group_id in session.group_ids
                    for slot_id in slot_ids
                ):
                    continue

                candidates[session.id].append(
                    {
                        "room_id": room.id,
                        "slot_ids": slot_ids,
                        "start_slot_id": start_slot.id,
                        "day": start_slot.day,
                        "duration": session.duration_slots,
                        "capacity": required_capacity,
                        "room_capacity": room.capacity,
                    }
                )

        if not candidates[session.id]:
            raise ValueError(
                f"No valid assignment available for session {session.id}"
            )

        # Add this session to its elective basket once.
        if session.basket_slot:
            basket_sessions[session.basket_slot].append(session)

        # --------------------------------------------------
        # 3. Create decision variables and collect occupancy
        # --------------------------------------------------
        for index, candidate in enumerate(candidates[session.id]):
            variable = model.NewBoolVar(
                f"{session.id}_candidate_{index}"
            )
            candidate["variable"] = variable

            for slot_id in candidate["slot_ids"]:
                # Faculty occupancy.
                resource_usage[
                    ("faculty", session.faculty_id, slot_id)
                ].append(variable)

                # Room occupancy.
                resource_usage[
                    ("room", candidate["room_id"], slot_id)
                ].append(variable)

                # Group occupancy is handled in Section 4.
                for group_id in session.group_ids:
                    group_usage[(group_id, slot_id)].append(
                        (session.id, session.basket_slot, variable)
                    )

            faculty_daily_hours[
                (session.faculty_id, candidate["day"])
            ].append((variable, session.duration_slots))

            # Soft penalty: avoid P9.
            if any(
                get_period_number(slot_id) == 9
                for slot_id in candidate["slot_ids"]
            ):
                objective_terms.append(8 * variable)

            # Soft penalty: avoid room utilization below 40%.
            utilization = candidate["capacity"] / candidate["room_capacity"]
            if utilization < 0.40:
                objective_terms.append(4 * variable)

        # Every session must be scheduled exactly once.
        model.AddExactlyOne(
            [candidate["variable"] for candidate in candidates[session.id]]
        )

    # --------------------------------------------------
    # 4. Prevent faculty, room, and student-group clashes
    # --------------------------------------------------

    # Faculty and room clashes: at most one selected assignment
    # per resource and occupied slot.
    for usage_variables in resource_usage.values():
        if len(usage_variables) > 1:
            model.AddAtMostOne(usage_variables)

    # Student-group clashes:
    # First combine all room/start candidate variables belonging to
    # the same session into one occupancy variable for this group/slot.
    # This avoids creating a pairwise constraint for every candidate pair.
    for (group_id, slot_id), entries in group_usage.items():
        session_variables = defaultdict(list)
        session_baskets = {}

        for session_id, basket_id, variable in entries:
            session_variables[session_id].append(variable)
            session_baskets[session_id] = basket_id

        session_occupancy = {}

        for session_id, variables in session_variables.items():
            active = model.NewBoolVar(
                f"group_{group_id}_{slot_id}_{session_id}"
            )

            # A session can occupy this group/slot if one of its
            # candidate assignments covering this slot is selected.
            model.Add(active == sum(variables))
            session_occupancy[session_id] = active

        session_ids = list(session_occupancy.keys())

        for first_index in range(len(session_ids)):
            first_id = session_ids[first_index]

            for second_index in range(first_index + 1, len(session_ids)):
                second_id = session_ids[second_index]

                first_basket = session_baskets[first_id]
                second_basket = session_baskets[second_id]

                # Elective alternatives in the same basket intentionally
                # share the same student cohort and run in parallel.
                if (
                    first_basket is not None
                    and first_basket == second_basket
                ):
                    continue

                model.Add(
                    session_occupancy[first_id]
                    + session_occupancy[second_id]
                    <= 1
                )

    # --------------------------------------------------
    # 5. Faculty maximum daily teaching hours
    # --------------------------------------------------
    for (faculty_id, day), assignments in faculty_daily_hours.items():
        max_hours = faculty[faculty_id].max_hours_per_day
        model.Add(
            sum(
                variable * duration
                for variable, duration in assignments
            ) <= max_hours
        )

    # --------------------------------------------------
    # 6. Elective basket synchronization
    # --------------------------------------------------
    # Every session in a basket must use the same starting day/period.
    # Each session can still choose its own suitable room.
    # for basket_id, sessions_in_basket in basket_sessions.items():
    #     session_start_slots = {
    #         session.id: {
    #             candidate["start_slot_id"]
    #             for candidate in candidates[session.id]
    #         }
    #         for session in sessions_in_basket
    #     }

    #     common_starts = set.intersection(
    #         *(
    #             session_start_slots[session.id]
    #             for session in sessions_in_basket
    #         )
    #     )

    #     if not common_starts:
    #         details = {
    #             session.id: sorted(session_start_slots[session.id])
    #             for session in sessions_in_basket
    #         }
    #         raise ValueError(
    #             f"Elective basket {basket_id} has no common starting slot. "
    #             f"Candidate starts by session: {details}"
    #         )

    #     # A basket cannot use the same faculty member for two simultaneous
    #     # alternatives. The faculty occupancy constraints above enforce this.
    #     start_choice = {
    #         start_slot: model.NewBoolVar(
    #             f"basket_{basket_id}_{start_slot}"
    #         )
    #         for start_slot in sorted(common_starts)
    #     }
    #     model.AddExactlyOne(list(start_choice.values()))

    #     for session in sessions_in_basket:
    #         candidates_by_start = defaultdict(list)

    #         for candidate in candidates[session.id]:
    #             candidates_by_start[
    #                 candidate["start_slot_id"]
    #             ].append(candidate["variable"])

    #         # Exactly one candidate for this session must use the selected
    #         # common basket start.
    #         for start_slot in common_starts:
    #             model.Add(
    #                 sum(candidates_by_start[start_slot])
    #                 == start_choice[start_slot]
    #             )

    #         # Forbid starts outside the common-start intersection.
    #         for start_slot, variables in candidates_by_start.items():
    #             if start_slot not in common_starts:
    #                 model.Add(sum(variables) == 0)

    # --------------------------------------------------
    # 7. Minimize soft-constraint penalties
    # --------------------------------------------------
    if objective_terms:
        model.Minimize(sum(objective_terms))

    # --------------------------------------------------
    # 8. Solve using OR-Tools CP-SAT
    # --------------------------------------------------
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 60

    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {
            "success": False,
            "message": "No feasible timetable could be generated",
            "scheduled_sessions": [],
            "solver_status": solver.StatusName(status),
        }

    # --------------------------------------------------
    # 9. Extract scheduled sessions
    # --------------------------------------------------
    scheduled_sessions = []

    for session in request.sessions:
        for candidate in candidates[session.id]:
            if solver.Value(candidate["variable"]) == 1:
                scheduled_sessions.append(
                    {
                        "session_id": session.id,
                        "faculty_id": session.faculty_id,
                        "room_id": candidate["room_id"],
                        "slot_ids": candidate["slot_ids"],
                    }
                )
                break

    # --------------------------------------------------
    # 10. Return result
    # --------------------------------------------------
    return {
        "success": True,
        "message": "Timetable generated successfully",
        "scheduled_sessions": scheduled_sessions,
        "solver_status": solver.StatusName(status),
        "objective_value": solver.ObjectiveValue(),
    }
