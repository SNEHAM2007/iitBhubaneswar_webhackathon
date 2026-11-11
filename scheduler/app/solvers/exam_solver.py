
from collections import defaultdict
from ortools.sat.python import cp_model


def generate_exam_timetable(exams, rooms, exam_week):
    """
    Generate an exam timetable compatible with the official CIT dataset.

    Exam:
        id, groups, size

    Room:
        id, capacity, allowed_uses

    Exam calendar:
        days: ["MON", "TUE", ...]
        sessions: [{"id": "AM"}, {"id": "PM"}]

    Output:
        {
            "exam_id": "...",
            "day": "MON",
            "session": "AM",
            "rooms": ["AUD", "LH-1"]
        }
    """

    model = cp_model.CpModel()

    days = exam_week["days"]
    sessions = exam_week["sessions"]

    session_ids = [s["id"] for s in sessions]

    # Only rooms approved for examinations can be used.
    eligible_rooms = [
        room for room in rooms
        if "exam" in room.get("allowed_uses", [])
    ]

    if not eligible_rooms:
        return {
            "success": False,
            "message": "No exam-eligible rooms found",
            "exams": []
        }

    # Effective exam capacity is half the normal room capacity.
    room_capacity = {
        room["id"]: room["capacity"] // 2
        for room in eligible_rooms
    }

    exam_time = {}
    room_assignment = {}

    # --------------------------------------------------
    # 1. Create exam-time and exam-room variables
    # --------------------------------------------------

    for exam in exams:
        exam_id = exam["id"]

        for day in days:
            for session in session_ids:

                exam_time[(exam_id, day, session)] = (
                    model.NewBoolVar(
                        f"time_{exam_id}_{day}_{session}"
                    )
                )

                for room in eligible_rooms:
                    room_id = room["id"]

                    room_assignment[
                        (exam_id, day, session, room_id)
                    ] = model.NewBoolVar(
                        f"room_{exam_id}_{day}_{session}_{room_id}"
                    )

    # --------------------------------------------------
    # 2. Every exam must have exactly one time
    # --------------------------------------------------

    for exam in exams:
        exam_id = exam["id"]

        model.Add(
            sum(
                exam_time[(exam_id, day, session)]
                for day in days
                for session in session_ids
            ) == 1
        )

    # --------------------------------------------------
    # 3. Room capacity and room-time assignment
    # --------------------------------------------------

    for exam in exams:
        exam_id = exam["id"]
        required_size = exam["size"]

        for day in days:
            for session in session_ids:

                time_var = exam_time[
                    (exam_id, day, session)
                ]

                room_vars = []

                for room in eligible_rooms:
                    room_id = room["id"]

                    room_var = room_assignment[
                        (exam_id, day, session, room_id)
                    ]

                    room_vars.append(room_var)

                    # A room can only be selected when
                    # this exam is assigned to this time.
                    model.Add(room_var <= time_var)

                # Combined effective room capacity must
                # accommodate all students in the exam.
                model.Add(
                    sum(
                        room_capacity[room["id"]]
                        * room_assignment[
                            (exam_id, day, session, room["id"])
                        ]
                        for room in eligible_rooms
                    ) >= required_size * time_var
                )

    # --------------------------------------------------
    # 4. A room cannot host two exams simultaneously
    # --------------------------------------------------

    room_usage = defaultdict(list)

    for exam in exams:
        exam_id = exam["id"]

        for day in days:
            for session in session_ids:
                for room in eligible_rooms:
                    room_id = room["id"]

                    room_usage[
                        (room_id, day, session)
                    ].append(
                        room_assignment[
                            (exam_id, day, session, room_id)
                        ]
                    )

    for variables in room_usage.values():
        model.Add(sum(variables) <= 1)

    # --------------------------------------------------
    # 5. Student groups cannot have simultaneous exams
    # --------------------------------------------------

    group_usage = defaultdict(list)

    for exam in exams:
        exam_id = exam["id"]

        for group_id in exam.get("groups", []):
            for day in days:
                for session in session_ids:
                    group_usage[
                        (group_id, day, session)
                    ].append(
                        exam_time[(exam_id, day, session)]
                    )

    for variables in group_usage.values():
        if len(variables) > 1:
            model.Add(sum(variables) <= 1)

    # --------------------------------------------------
    # 6. Minimize the number of rooms used
    # --------------------------------------------------

    model.Minimize(
        sum(room_assignment.values())
    )

    # --------------------------------------------------
    # 7. Solve
    # --------------------------------------------------

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 120
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        failure_message = "No feasible exam timetable found"
        if status == cp_model.UNKNOWN:
            failure_message = "Exam solver timed out before finding a feasible timetable."
        return {
            "success": False,
            "message": failure_message,
            "exams": []
        }

    # --------------------------------------------------
    # 8. Export exam assignments
    # --------------------------------------------------

    scheduled_exams = []

    for exam in exams:
        exam_id = exam["id"]

        for day in days:
            for session in session_ids:

                if solver.Value(
                    exam_time[(exam_id, day, session)]
                ) != 1:
                    continue

                selected_rooms = []

                for room in eligible_rooms:
                    room_id = room["id"]

                    if solver.Value(
                        room_assignment[
                            (exam_id, day, session, room_id)
                        ]
                    ) == 1:
                        selected_rooms.append(room_id)

                scheduled_exams.append({
                    "exam_id": exam_id,
                    "day": day,
                    "session": session,
                    "rooms": selected_rooms
                })

    return {
        "success": True,
        "message": "Exam timetable generated successfully",
        "total_exams": len(exams),
        "scheduled_count": len(scheduled_exams),
        "exams": scheduled_exams
    }
