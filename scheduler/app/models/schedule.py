
from pydantic import BaseModel, Field
from typing import Optional


class TimeSlot(BaseModel):
    id: str
    day: str
    start_time: str
    end_time: str


class Faculty(BaseModel):
    id: str
    name: str
    max_hours_per_day: int = 4
    unavailable_slots: list[str] = Field(default_factory=list)
    preferred_slots: list[str] = Field(default_factory=list)
    needs_accessible_room: bool = False


class Room(BaseModel):
    id: str
    name: str
    capacity: int
    room_type: str
    accessible: bool = False
    unavailable_slots: list[str] = Field(default_factory=list)


class StudentGroup(BaseModel):
    id: str
    name: str
    strength: int
    unavailable_slots: list[str] = Field(default_factory=list)


class TeachingSession(BaseModel):
    id: str
    course_id: str
    faculty_id: str
    group_ids: list[str]

    duration_slots: int = 1

    # Support multiple permitted room types.
    allowed_room_types: list[str] = Field(
        default_factory=list
    )

    required_room_type: str = "CLASSROOM"
    required_capacity: int = 0

    is_lab: bool = False

    # Session-specific accessibility requirement.
    needs_accessible_room: bool = False

    # Elective basket synchronization.
    basket_slot: Optional[str] = None

    # Fixed starting period, if any.
    fixed_slot_id: Optional[str] = None


class SchedulingRequest(BaseModel):
    slots: list[TimeSlot]
    faculty: list[Faculty]
    rooms: list[Room]
    student_groups: list[StudentGroup]
    sessions: list[TeachingSession]


class ScheduledSession(BaseModel):
    session_id: str
    faculty_id: str
    room_id: str
    slot_ids: list[str]


class SchedulingResponse(BaseModel):
    success: bool
    message: str
    scheduled_sessions: list[ScheduledSession] = Field(default_factory=list)
