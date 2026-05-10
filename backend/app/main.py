"""FastAPI entrypoint for the Habit Tracker."""
from __future__ import annotations

import sqlite3
from pathlib import Path

from fastapi import FastAPI

from app.routers import checkins, dashboard, export, habits

BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BACKEND_DIR / "app.db"
SCHEMA_PATH = BACKEND_DIR / "schema.sql"
SEED_PATH = BACKEND_DIR / "seed.sql"


def _init_db_if_missing() -> None:
    if DB_PATH.exists():
        return
    if not SCHEMA_PATH.exists():
        return
    schema = SCHEMA_PATH.read_text()
    if not schema.strip():
        return
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(schema)
        if SEED_PATH.exists() and SEED_PATH.read_text().strip():
            conn.executescript(SEED_PATH.read_text())
        conn.commit()
    finally:
        conn.close()


app = FastAPI(
    title="Habit Tracker",
    description=(
        "REST API for the Habit Tracker app. "
        "Track workout consistency across Upper Body, Lower Body, Cardio, and any "
        "custom habits you define. All routes are prefixed with `/api`."
    ),
    version="0.1.0",
)


@app.on_event("startup")
def on_startup() -> None:
    _init_db_if_missing()


@app.get("/api/health", summary="Health check", tags=["health"])
def health() -> dict[str, str]:
    """Return `{"status": "ok"}` if the backend is running."""
    return {"status": "ok"}


app.include_router(habits.router)
app.include_router(checkins.router)
app.include_router(dashboard.router)
app.include_router(export.router)
