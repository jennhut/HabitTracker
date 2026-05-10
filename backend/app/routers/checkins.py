"""Check-in endpoints: log, list by date range, delete."""
from __future__ import annotations

import sqlite3
from datetime import datetime

from fastapi import APIRouter, HTTPException, Path, Query

from app.db import get_conn
from app.models import CheckinCreate, CheckinResponse

router = APIRouter(prefix="/api/checkins", tags=["checkins"])


def _now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _row_to_checkin(row: sqlite3.Row) -> CheckinResponse:
    return CheckinResponse(**dict(row))


@router.post(
    "",
    summary="Log a check-in",
    response_model=CheckinResponse,
    status_code=201,
)
def create_checkin(body: CheckinCreate) -> CheckinResponse:
    """Record a workout for a given date.

    - The habit must exist and be **active** (archived habits are rejected).
    - The same habit cannot be logged twice on the same date.
    - Rest days are implicit — simply do not log a check-in for that day.
    """
    now = _now()
    conn = get_conn()
    try:
        habit = conn.execute(
            "SELECT status FROM habits WHERE id = ?", (body.habit_id,)
        ).fetchone()
        if habit is None:
            raise HTTPException(status_code=404, detail="Habit not found.")
        if habit["status"] == "archived":
            raise HTTPException(
                status_code=409,
                detail="Cannot log a check-in for an archived habit.",
            )
        try:
            cur = conn.execute(
                "INSERT INTO checkins (date, habit_id, note, created_at) VALUES (?, ?, ?, ?)",
                (body.date, body.habit_id, body.note, now),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(
                status_code=409,
                detail="A check-in for this habit on this date already exists.",
            )
        row = conn.execute("SELECT * FROM checkins WHERE id = ?", (cur.lastrowid,)).fetchone()
        return _row_to_checkin(row)
    finally:
        conn.close()


@router.get(
    "",
    summary="List check-ins in a date range",
    response_model=list[CheckinResponse],
)
def list_checkins(
    from_date: str = Query(
        ...,
        alias="from",
        description="Start date (inclusive), ISO format YYYY-MM-DD",
        examples=["2026-02-16"],
    ),
    to_date: str = Query(
        ...,
        alias="to",
        description="End date (inclusive), ISO format YYYY-MM-DD",
        examples=["2026-05-10"],
    ),
) -> list[CheckinResponse]:
    """Return all check-ins whose date falls between `from` and `to` (inclusive).

    The frontend passes the Monday and Sunday of each 12-week calendar block
    as `from` and `to` to populate the history grid.
    """
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM checkins WHERE date BETWEEN ? AND ? ORDER BY date",
            (from_date, to_date),
        ).fetchall()
    return [_row_to_checkin(r) for r in rows]


@router.delete(
    "/{checkin_id}",
    summary="Delete a check-in",
    status_code=204,
)
def delete_checkin(
    checkin_id: int = Path(..., description="ID of the check-in to remove", examples=[1]),
) -> None:
    """Undo a logged check-in by ID. Returns 204 No Content on success."""
    conn = get_conn()
    try:
        row = conn.execute(
            "SELECT id FROM checkins WHERE id = ?", (checkin_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Check-in not found.")
        conn.execute("DELETE FROM checkins WHERE id = ?", (checkin_id,))
        conn.commit()
    finally:
        conn.close()
