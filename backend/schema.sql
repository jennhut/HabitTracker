-- Habit Tracker schema
-- Applied once on startup when app.db does not exist (see app/main.py).
--
-- NOTE: foreign_keys pragma must also be set on every subsequent connection
-- opened by route handlers — this PRAGMA only applies to the current connection.
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
CREATE TABLE habits (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    colour     TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'active',
    created_at TEXT    NOT NULL,
    updated_at TEXT    NOT NULL,
    UNIQUE (name),
    CHECK (status IN ('active', 'archived'))
);

-- ---------------------------------------------------------------------------
-- checkins
-- ---------------------------------------------------------------------------
CREATE TABLE checkins (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    NOT NULL,
    habit_id   INTEGER NOT NULL REFERENCES habits (id),
    note       TEXT,
    created_at TEXT    NOT NULL,
    UNIQUE (date, habit_id)
);
