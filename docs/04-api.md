# API Reference — Habit Tracker

All routes prefixed `/api`. OpenAPI docs live at `http://localhost:8000/docs`.

## Endpoints

| # | Method | Path | Request Body | Response Body | User Story |
|---|--------|------|-------------|---------------|------------|
| 1 | GET | `/api/health` | — | `{status}` | — |
| 2 | GET | `/api/habits` | — | `[{id, name, colour, status, created_at, updated_at}]` | US1, US3 |
| 3 | POST | `/api/habits` | `{name, colour}` | `{id, name, colour, status, created_at, updated_at}` | Settings — Add |
| 4 | PATCH | `/api/habits/{id}` | `{name?, colour?, status?}` | `{id, name, colour, status, created_at, updated_at}` | Settings — Archive/Rename/Recolour |
| 5 | POST | `/api/checkins` | `{date, habit_id, note?}` | `{id, date, habit_id, note, created_at}` | US1 — Log |
| 6 | DELETE | `/api/checkins/{id}` | — | 204 No Content | US1 — Undo |
| 7 | GET | `/api/checkins` | — | `[{id, date, habit_id, note, created_at}]` | US3 — Browse |
| 8 | GET | `/api/dashboard` | — | `{current_streak, best_streak, this_week_count, this_week_target, completion_rate}` | US2 — View |
| 9 | GET | `/api/export` | — | CSV file (text/csv) | Settings — Export |

## Notes

- `GET /api/habits` returns all habits (active + archived); frontend filters by status client-side
- `GET /api/checkins` accepts `from=YYYY-MM-DD` and `to=YYYY-MM-DD` query params for the calendar range
- `PATCH /api/habits/{id}` accepts any combination of `name`, `colour`, and `status` — all optional
- Archived habits return 409 if a check-in is attempted against them
- Duplicate `(date, habit_id)` check-ins return 409
- `GET /api/export` returns `Content-Type: text/csv` with `Content-Disposition: attachment`
- No delete or update endpoints for check-ins beyond `DELETE /api/checkins/{id}`
- `PRAGMA foreign_keys = ON` is set per-connection in `backend/app/db.py`

## Files

- `backend/app/db.py` — connection factory
- `backend/app/models.py` — Pydantic models with OpenAPI examples
- `backend/app/routers/habits.py` — habit endpoints
- `backend/app/routers/checkins.py` — check-in endpoints
- `backend/app/routers/dashboard.py` — streak and completion rate
- `backend/app/routers/export.py` — CSV export
- `backend/app/main.py` — router registration
