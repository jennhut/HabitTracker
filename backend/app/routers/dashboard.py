"""Dashboard endpoint: streaks, this-week progress, and completion rate."""
from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter

from app.db import get_conn
from app.models import DashboardResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Week target is a constant: 6 workout days per Monday–Sunday window.
_WEEK_TARGET = 6
_RATE_WEEKS = 4  # completion-rate window


def _week_monday(d: date) -> date:
    """Return the Monday of the week containing *d*."""
    return d - timedelta(days=d.weekday())


# SQL expression that maps any date string to its Monday (ISO format).
_WEEK_START_EXPR = (
    "date(date, '-' || ((cast(strftime('%w', date) as integer) + 6) % 7) || ' days')"
)


def _compute_streaks(qualifying_mondays: list[str], today_monday: date) -> tuple[int, int]:
    """Return (current_streak, best_streak) from a sorted list of qualifying week-start dates.

    A week qualifies when it has >= 6 distinct check-in dates.
    Current streak counts consecutive qualifying weeks backwards from today's week.
    Best streak is the longest consecutive qualifying run across all history.
    """
    if not qualifying_mondays:
        return 0, 0

    week_set = set(qualifying_mondays)

    # Current streak: walk backwards from today's week Monday.
    current = 0
    check = today_monday
    while check.isoformat() in week_set:
        current += 1
        check -= timedelta(weeks=1)

    # Best streak: longest consecutive run in full history.
    best = 1
    run = 1
    for i in range(1, len(qualifying_mondays)):
        prev = date.fromisoformat(qualifying_mondays[i - 1])
        curr = date.fromisoformat(qualifying_mondays[i])
        if (curr - prev).days == 7:
            run += 1
            if run > best:
                best = run
        else:
            run = 1

    return current, max(best, current)


@router.get(
    "",
    summary="Get dashboard stats",
    response_model=DashboardResponse,
)
def get_dashboard() -> DashboardResponse:
    """Return all statistics shown on the dashboard:

    - **current_streak** — consecutive complete weeks (Mon–Sun) with ≥ 6 check-ins,
      counting backwards from the most recent qualifying week.
    - **best_streak** — all-time longest such run.
    - **this_week_count** — distinct days with a check-in in the current Mon–Sun week.
    - **this_week_target** — always 6.
    - **completion_rate** — `days_logged / (4 × 6)` over the last 4 complete weeks
      (expressed as a float between 0 and 1, rounded to 4 decimal places).
    """
    today = date.today()
    today_monday = _week_monday(today)
    today_sunday = today_monday + timedelta(days=6)

    conn = get_conn()
    try:
        # This week's distinct day count.
        this_week_count: int = conn.execute(
            "SELECT COUNT(DISTINCT date) FROM checkins WHERE date BETWEEN ? AND ?",
            (today_monday.isoformat(), today_sunday.isoformat()),
        ).fetchone()[0]

        # All weeks that qualify (≥ 6 distinct days), oldest first.
        rows = conn.execute(
            f"SELECT {_WEEK_START_EXPR} AS week_start, COUNT(DISTINCT date) AS days"
            " FROM checkins"
            " GROUP BY week_start"
            " HAVING days >= ?"
            " ORDER BY week_start",
            (_WEEK_TARGET,),
        ).fetchall()
        qualifying_mondays = [r[0] for r in rows]

        current_streak, best_streak = _compute_streaks(qualifying_mondays, today_monday)

        # Completion rate over the last _RATE_WEEKS complete weeks.
        rate_start = today_monday - timedelta(weeks=_RATE_WEEKS)
        rate_end = today_monday - timedelta(days=1)  # last Sunday
        days_logged: int = conn.execute(
            "SELECT COUNT(DISTINCT date) FROM checkins WHERE date BETWEEN ? AND ?",
            (rate_start.isoformat(), rate_end.isoformat()),
        ).fetchone()[0]
        completion_rate = round(days_logged / (_RATE_WEEKS * _WEEK_TARGET), 4)

    finally:
        conn.close()

    return DashboardResponse(
        current_streak=current_streak,
        best_streak=best_streak,
        this_week_count=this_week_count,
        this_week_target=_WEEK_TARGET,
        completion_rate=completion_rate,
    )
