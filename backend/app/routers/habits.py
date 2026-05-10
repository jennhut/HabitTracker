"""Habit endpoints: list, create, update (rename / recolour / archive)."""
from __future__ import annotations

import sqlite3
from datetime import datetime

from fastapi import APIRouter, HTTPException, Path

from app.db import get_conn
from app.models import HabitCreate, HabitResponse, HabitUpdate

router = APIRouter(prefix="/api/habits", tags=["habits"])


def _now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _row_to_habit(row: sqlite3.Row) -> HabitResponse:
    return HabitResponse(**dict(row))


@router.get(
    "",
    summary="List all habits",
    response_model=list[HabitResponse],
)
def list_habits() -> list[HabitResponse]:
    """Return every habit, active and archived.

    The check-in screen should filter to `status == "active"` client-side.
    The calendar history uses all habits (including archived) to resolve colours.
    """
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM habits ORDER BY id").fetchall()
    return [_row_to_habit(r) for r in rows]


@router.post(
    "",
    summary="Create a habit",
    response_model=HabitResponse,
    status_code=201,
)
def create_habit(body: HabitCreate) -> HabitResponse:
    """Add a new active habit with a name and a hex colour (e.g. `#4A90D9`)."""
    now = _now()
    conn = get_conn()
    try:
        cur = conn.execute(
            "INSERT INTO habits (name, colour, status, created_at, updated_at)"
            " VALUES (?, ?, 'active', ?, ?)",
            (body.name, body.colour, now, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM habits WHERE id = ?", (cur.lastrowid,)).fetchone()
        return _row_to_habit(row)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="A habit with that name already exists.")
    finally:
        conn.close()


@router.patch(
    "/{habit_id}",
    summary="Update a habit",
    response_model=HabitResponse,
)
def update_habit(
    body: HabitUpdate,
    habit_id: int = Path(..., description="ID of the habit to update", examples=[1]),
) -> HabitResponse:
    """Partially update a habit.

    All fields are optional — supply any combination of `name`, `colour`,
    and `status`. To archive a habit set `status` to `"archived"`; it will
    no longer appear on the check-in screen but remains visible in history.
    """
    if all(v is None for v in (body.name, body.colour, body.status)):
        raise HTTPException(status_code=422, detail="At least one field must be provided.")

    now = _now()
    conn = get_conn()
    try:
        row = conn.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Habit not found.")

        new_name = body.name if body.name is not None else row["name"]
        new_colour = body.colour if body.colour is not None else row["colour"]
        new_status = body.status if body.status is not None else row["status"]

        try:
            conn.execute(
                "UPDATE habits SET name=?, colour=?, status=?, updated_at=? WHERE id=?",
                (new_name, new_colour, new_status, now, habit_id),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="A habit with that name already exists.")

        row = conn.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()
        return _row_to_habit(row)
    finally:
        conn.close()
