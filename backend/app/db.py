"""Database connection factory."""
from __future__ import annotations

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "app.db"


def get_conn() -> sqlite3.Connection:
    """Open a connection with foreign-key enforcement and Row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn
