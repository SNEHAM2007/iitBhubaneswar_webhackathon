
from ortools.sat.python import cp_model


# Penalty weights
FACULTY_AVOID_PENALTY = 10
P9_PENALTY = 8
STUDENT_GAP_PENALTY = 5
DAILY_OVERLOAD_PENALTY = 7
SAME_COURSE_PENALTY = 6
ROOM_UNDERUTILIZATION_PENALTY = 4


def calculate_candidate_penalty(
    session,
    candidate,
    faculty,
    room,
    groups
):
    """
    Calculate penalties for an individual assignment.
    Lower penalty means a better assignment.
    """

    penalty = 0

    slot_ids = candidate["slot_ids"]

    # 1. Faculty preferred slots
    if faculty.preferred_slots:
        for slot_id in slot_ids:
            if slot_id not in faculty.preferred_slots:
                penalty += FACULTY_AVOID_PENALTY

    # 2. Faculty slots they want to avoid
    avoid_slots = getattr(faculty, "avoid_slots", [])

    for slot_id in slot_ids:
        if slot_id in avoid_slots:
            penalty += FACULTY_AVOID_PENALTY

    # 3. Avoid P9
    for slot_id in slot_ids:
        if slot_id == "P9":
            penalty += P9_PENALTY

    # 4. Room utilization below 40%
    total_strength = sum(group.strength for group in groups)

    if room.capacity > 0:
        utilization = total_strength / room.capacity

        if utilization < 0.40:
            penalty += ROOM_UNDERUTILIZATION_PENALTY

    return penalty


def add_daily_overload_penalties(
    model,
    faculty_daily_hours,
    faculty,
    objective_terms
):
    """
    Penalize faculty members who teach
    more than six hours in a day.
    """

    for (faculty_id, day), assignments in faculty_daily_hours.items():

        total_hours = sum(
            variable * duration
            for variable, duration in assignments
        )

        excess = model.NewIntVar(
            0, 24, f"faculty_excess_{faculty_id}_{day}"
        )

        model.Add(excess >= total_hours - 6)

        objective_terms.append(
            excess * DAILY_OVERLOAD_PENALTY
        )


def add_group_daily_overload_penalties(
    model,
    group_daily_hours,
    objective_terms
):
    """
    Penalize student groups having
    more than six class hours per day.
    """

    for (group_id, day), assignments in group_daily_hours.items():

        total_hours = sum(
            variable * duration
            for variable, duration in assignments
        )

        excess = model.NewIntVar(
            0, 24, f"group_excess_{group_id}_{day}"
        )

        model.Add(excess >= total_hours - 6)

        objective_terms.append(
            excess * DAILY_OVERLOAD_PENALTY
        )


def add_objective(model, objective_terms):
    """
    Minimize total soft constraint penalties.
    """

    if objective_terms:
        model.Minimize(sum(objective_terms))
