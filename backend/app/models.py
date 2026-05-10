"""Pydantic request and response models."""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Habit models
# ---------------------------------------------------------------------------

class HabitCreate(BaseModel):
    model_config = ConfigDict(json_schema_extra={
        "example": {"name": "Upper Body", "colour": "#4A90D9"}
    })

    name: str = Field(..., min_length=1)
    colour: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")


class HabitUpdate(BaseModel):
    model_config = ConfigDict(json_schema_extra={
        "example": {"name": "Push Day", "colour": "#E74C3C", "status": "archived"}
    })

    name: str | None = Field(None, min_length=1)
    colour: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    status: str | None = Field(None, pattern=r"^(active|archived)$")


class HabitResponse(BaseModel):
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id": 1,
            "name": "Upper Body",
            "colour": "#4A90D9",
            "status": "active",
            "created_at": "2026-01-06T08:00:00",
            "updated_at": "2026-01-06T08:00:00",
        }
    })

    id: int
    name: str
    colour: str
    status: str
    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# Check-in models
# ---------------------------------------------------------------------------

class CheckinCreate(BaseModel):
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "date": "2026-05-10",
            "habit_id": 1,
            "note": "Personal best on bench press",
        }
    })

    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    habit_id: int
    note: str | None = None


class CheckinResponse(BaseModel):
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id": 1,
            "date": "2026-05-10",
            "habit_id": 1,
            "note": "Personal best on bench press",
            "created_at": "2026-05-10T07:30:00",
        }
    })

    id: int
    date: str
    habit_id: int
    note: str | None
    created_at: str


# ---------------------------------------------------------------------------
# Dashboard model
# ---------------------------------------------------------------------------

class DashboardResponse(BaseModel):
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "current_streak": 4,
            "best_streak": 4,
            "this_week_count": 5,
            "this_week_target": 6,
            "completion_rate": 1.0,
        }
    })

    current_streak: int
    best_streak: int
    this_week_count: int
    this_week_target: int
    completion_rate: float
