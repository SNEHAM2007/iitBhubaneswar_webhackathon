from collections import defaultdict
from functools import cmp_to_key

MAX_PERIOD = 13


def effective_category(data, req):
    order = data["priority_order"]
    cap = data["role_category_cap"].get(req["role"], "club_event")
    a = (
        order.index(req["requested_category"])
        if req["requested_category"] in order
        else len(order) - 1
    )
    return order[max(a, order.index(cap))]


def outranks(data, r1, r2):
    """True if request r1 has priority over r2."""
    order = data["priority_order"]
    c1 = order.index(effective_category(data, r1))
    c2 = order.index(effective_category(data, r2))
    if c1 != c2:
        return c1 < c2
    return r1["submitted_at"] < r2["submitted_at"]


def solve_fest_bookings(data, base_assignments):
    """
    Solves Spectra week (fest_week) booking requests following CIT rules.

    base_assignments: list of dicts with session_id, day, start_period, room_id
    data: CIT public dataset dict
    """
    rooms_by_id = {r["id"]: r for r in data["rooms"]}
    sessions_by_id = {s["id"]: s for s in data["sessions"]}
    cancellations = {c["request_id"] for c in data.get("cancellations", [])}
    room_unavailability = defaultdict(set)
    for un in data.get("room_unavailability", []):
        for p in un.get("periods", []):
            room_unavailability[(un["room_id"], un["day"])].add(p)

    # Track timetable occupancy for week 7
    room_busy = defaultdict(list)
    group_busy = defaultdict(list)

    for item in base_assignments:
        sid = item.get("session_id")
        session = sessions_by_id.get(sid)
        if not session:
            continue
        day = item.get("day")
        start = item.get("start_period")
        rid = item.get("room_id")
        duration = session.get("duration", 1)

        for p in range(start, start + duration):
            room_busy[(rid, day, p)].append(sid)
            for gid in session.get("groups", []):
                group_busy[(gid, day, p)].append(sid)

    # Sort requests strictly by priority order and submission time
    requests = list(data["booking_requests"])
    requests.sort(key=cmp_to_key(lambda r1, r2: -1 if outranks(data, r1, r2) else 1))

    decisions = []
    session_overrides = []

    for req in requests:
        req_id = req["id"]
        attendance = req["attendance"]
        duration = req["duration_periods"]
        room_types = set(req.get("room_types", []))
        needs = set(req.get("needs", []))
        mandatory_groups = req.get("mandatory_for_groups", [])
        requested_room_id = req.get("requested_room")
        windows = req.get("windows", [])
        eff_cat = effective_category(data, req)

        # 1. Cancellation check
        if req_id in cancellations:
            decisions.append({
                "request_id": req_id,
                "status": "rejected",
                "reason": "Request was withdrawn/cancelled by requester"
            })
            continue

        # 2. Check if campus has any room that fits attendance
        max_campus_capacity = max(r["capacity"] for r in data["rooms"])
        if attendance > max_campus_capacity:
            decisions.append({
                "request_id": req_id,
                "status": "rejected",
                "reason": f"No venue on campus seats {attendance} (largest is {max_campus_capacity})"
            })
            continue

        # Order room candidates: requested room first, then by capacity ascending
        candidate_rooms = []
        for r in data["rooms"]:
            if "event" not in r.get("allowed_uses", []):
                continue
            if r["type"] not in room_types:
                continue
            if r["capacity"] < attendance:
                continue
            feats = set(r.get("features", [])) | ({"accessible"} if r.get("accessible") else set())
            if needs - feats:
                continue
            candidate_rooms.append(r)

        # Sort: requested room first, then closest capacity fit
        candidate_rooms.sort(
            key=lambda r: (
                0 if r["id"] == requested_room_id else 1,
                r["capacity"] - attendance
            )
        )

        if not candidate_rooms:
            decisions.append({
                "request_id": req_id,
                "status": "rejected",
                "reason": f"No event-eligible room matches room types {list(room_types)}, capacity {attendance}, and required needs {list(needs)}"
            })
            continue

        assigned = False

        # 3. Try to place in requested windows (Approved)
        for room in candidate_rooms:
            rid = room["id"]
            for w in windows:
                day = w["day"]
                from_p = w["from_period"]
                to_p = w["to_period"]

                for s0 in range(from_p, to_p - duration + 2):
                    end_p = s0 + duration - 1
                    if end_p > MAX_PERIOD:
                        continue

                    # Check room availability & occupancy
                    conflict = False
                    for p in range(s0, end_p + 1):
                        if p in room_unavailability[(rid, day)]:
                            conflict = True
                            break
                        if room_busy[(rid, day, p)]:
                            conflict = True
                            break
                        for g in mandatory_groups:
                            if group_busy[(g, day, p)]:
                                conflict = True
                                break
                        if conflict:
                            break

                    if not conflict:
                        # Place request
                        for p in range(s0, end_p + 1):
                            room_busy[(rid, day, p)].append(req_id)
                            for g in mandatory_groups:
                                group_busy[(g, day, p)].append(req_id)

                        decisions.append({
                            "request_id": req_id,
                            "status": "approved",
                            "day": day,
                            "start_period": s0,
                            "end_period": end_p,
                            "room_id": rid,
                            "reason": f"{eff_cat.replace('_', ' ').capitalize()} approved for {room['name']}"
                        })
                        assigned = True
                        break
                if assigned:
                    break
            if assigned:
                break

        if assigned:
            continue

        # 4. Try alternative slot/room (Alternative Offered)
        # Search all days, preferably evening event slots (P10..P13) or free teaching slots
        days_order = [w["day"] for w in windows] + [d for d in data["calendar"]["days"] if d not in [w["day"] for w in windows]]
        for room in candidate_rooms:
            rid = room["id"]
            for day in days_order:
                # Try evening slots first, then other slots
                period_ranges = list(range(10, MAX_PERIOD - duration + 2)) + list(range(1, 10 - duration + 2))
                for s0 in period_ranges:
                    end_p = s0 + duration - 1
                    if end_p > MAX_PERIOD:
                        continue

                    conflict = False
                    for p in range(s0, end_p + 1):
                        if p in room_unavailability[(rid, day)]:
                            conflict = True
                            break
                        if room_busy[(rid, day, p)]:
                            conflict = True
                            break
                        for g in mandatory_groups:
                            if group_busy[(g, day, p)]:
                                conflict = True
                                break
                        if conflict:
                            break

                    if not conflict:
                        for p in range(s0, end_p + 1):
                            room_busy[(rid, day, p)].append(req_id)
                            for g in mandatory_groups:
                                group_busy[(g, day, p)].append(req_id)

                        decisions.append({
                            "request_id": req_id,
                            "status": "alternative_offered",
                            "day": day,
                            "start_period": s0,
                            "end_period": end_p,
                            "room_id": rid,
                            "reason": f"Requested window busy; alternative scheduled in {room['name']} on {day} P{s0}-P{end_p}"
                        })
                        assigned = True
                        break
                if assigned:
                    break
            if assigned:
                break

        if not assigned:
            decisions.append({
                "request_id": req_id,
                "status": "rejected",
                "reason": f"Preferred rooms were occupied by higher-priority bookings or classes during requested periods"
            })

    return {
        "bookings": decisions,
        "session_overrides": session_overrides
    }
