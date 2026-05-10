"""Export endpoint: download all data as a CSV file."""
from __future__ import annotations

import csv
import io

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.db import get_conn

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get(
    "",
    summary="Export all data as CSV",
    response_class=StreamingResponse,
    responses={
        200: {
            "content": {"text/csv": {}},
            "description": "A CSV file containing all habits and check-ins.",
        }
    },
)
def export_csv() -> StreamingResponse:
    """Download the full dataset as a single CSV file.

    The file contains two sections separated by a blank line:
    one for habits and one for check-ins. Check-ins include the resolved
    habit name so the file is self-contained without needing a join.
    """
    conn = get_conn()
    try:
        habits = conn.execute(
            "SELECT id, name, colour, status, created_at, updated_at"
            " FROM habits ORDER BY id"
        ).fetchall()
        checkins = conn.execute(
            "SELECT c.id, c.date, h.name AS habit_name, c.note, c.created_at"
            " FROM checkins c"
            " JOIN habits h ON h.id = c.habit_id"
            " ORDER BY c.date, c.id"
        ).fetchall()
    finally:
        conn.close()

    buf = io.StringIO()
    writer = csv.writer(buf)

    writer.writerow(["# habits"])
    writer.writerow(["id", "name", "colour", "status", "created_at", "updated_at"])
    for row in habits:
        writer.writerow(list(row))

    writer.writerow([])

    writer.writerow(["# checkins"])
    writer.writerow(["id", "date", "habit_name", "note", "created_at"])
    for row in checkins:
        writer.writerow(list(row))

    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=habit-tracker-export.csv"},
    )
