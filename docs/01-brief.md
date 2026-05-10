# App Brief

## The User

A solo user running a self-contained local web app. The interaction model is a **frictionless check-in**: open the app, tap an activity, close it. There are no notifications, reminders, or time-based behaviours. All actions are intentional and user-initiated.

---

## Three Core User Stories

1. **Log a workout** — As the user, I open the app and tap one of my active habits to log a check-in for today, with an optional note, so I can record my effort with minimal friction.

2. **See how I'm doing** — As the user, I view a dashboard showing my current streak, best streak ever, this week's progress (e.g. 4/6), and completion rate over the last 4 complete weeks, so I can assess my consistency at a glance.

3. **Review my history** — As the user, I browse a colour-coded 12-week calendar grid with prev/next navigation (no limit on how far back I can go), so I can see patterns in my activity type and consistency over time.

---

## Key Nouns — Things the App Tracks

| Noun | Description |
|---|---|
| **Check-in** | A single log entry: date, habit, optional note |
| **Habit** | A user-defined activity type with status: `active` or `archived` |
| **Week** | Fixed Monday–Sunday window |
| **Current streak** | Consecutive weeks where 6 check-ins were logged |
| **Best streak** | All-time highest streak, preserved even if current streak resets |
| **Completion rate** | `days logged ÷ (weeks × 6)` over the last 4 complete weeks |

---

## Key Verbs — Things the User Can Do

| Verb | Where |
|---|---|
| **Log** a check-in (habit + optional note) | Main / check-in screen |
| **View** dashboard stats (streaks, this week, completion rate) | Main / dashboard screen |
| **Browse** 12-week calendar history (prev/next, unlimited depth) | History screen |
| **Add** a new habit | Settings screen |
| **Archive** a habit (hides from check-in; stays in history at full colour) | Settings screen |
| **Export** all data as CSV | Settings screen |

---

## Notable Constraints

- **No ORM** — raw SQL only (`sqlite3` stdlib)
- **No UI component library** — plain CSS
- **TypeScript types** generated from OpenAPI spec, not handwritten
- **All API routes** prefixed `/api`
- **Archived habits** cannot accept new check-ins; active/archived is the only distinction
- **Rest days** are the absence of a check-in — they are not logged explicitly; streaks count weeks with 6 logged days
