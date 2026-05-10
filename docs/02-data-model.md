# Data Model

## Entity: `habits`

| Field | SQLite Type | Required | Notes |
|---|---|---|---|
| `id` | INTEGER | Yes | Primary key, autoincrement |
| `name` | TEXT | Yes | User-defined label (e.g. "Upper Body") |
| `colour` | TEXT | Yes | Hex colour string (e.g. `#4A90D9`) for calendar display |
| `status` | TEXT | Yes | Either `'active'` or `'archived'` |
| `created_at` | TEXT | Yes | ISO 8601 datetime, set on insert |
| `updated_at` | TEXT | Yes | ISO 8601 datetime, updated on every write |

**Primary key:** `id`

**Foreign keys:** none

**Constraints:**
- `UNIQUE(name)` — two habits cannot share a name
- `CHECK(status IN ('active', 'archived'))`

---

## Entity: `checkins`

| Field | SQLite Type | Required | Notes |
|---|---|---|---|
| `id` | INTEGER | Yes | Primary key, autoincrement |
| `date` | TEXT | Yes | ISO 8601 date `YYYY-MM-DD` |
| `habit_id` | INTEGER | Yes | The habit logged for this day |
| `note` | TEXT | No | Optional free-text note |
| `created_at` | TEXT | Yes | ISO 8601 datetime, set on insert |

**Primary key:** `id`

**Foreign keys:**
- `habit_id` → `habits.id` — each check-in must reference a valid habit, linking the logged activity to its definition and colour.

**Constraints:**
- `UNIQUE(date, habit_id)` — a habit cannot be logged more than once on the same day
- The rule that archived habits cannot accept new check-ins is enforced at the **application layer**, not the database — SQLite cannot check `habits.status` in a simple column constraint without a trigger

---

## Entities Treated as Computed, Not Stored

| Noun | Rationale |
|---|---|
| **Week** | Derived from `date` using Monday-anchored arithmetic; no table needed |
| **Current streak** | Computed by querying `checkins`, grouping by week, and counting backwards from the most recent complete week with ≥ 6 days |
| **Best streak** | Computed from the same query over all historical data; since check-ins are never deleted, the full history is always available for recalculation |
| **Completion rate** | Computed as `COUNT(DISTINCT date) ÷ (4 × 6)` over the last 4 complete Monday–Sunday weeks |

Storing derived values would risk them drifting out of sync with the source data. Computing them on read keeps the database as a single source of truth.

---

## Ambiguities Resolved

1. **One check-in per day vs. one per habit per day.** The brief says "tap one of my active habits" and measures progress in days (6/6), not activities. The constraint `UNIQUE(date, habit_id)` prevents the same habit being logged twice on one day, while still permitting multiple different habits to be logged on the same day. Day-counting logic for streaks and completion rate must deduplicate on `date` (i.e. `COUNT(DISTINCT date)`).

2. **Colour ownership.** The calendar is colour-coded by activity type (habit), not by individual check-in. Colour lives on `habits`, not `checkins`.

3. **How colours are assigned.** The brief doesn't specify. Assumed the user picks a hex colour when creating a habit, since habit management is already a user-driven flow.

4. **Streak and completion rate as tables.** They appear as nouns in the brief but are fully derivable from `checkins`. Storing them would add write complexity with no benefit for a single-user local app.
