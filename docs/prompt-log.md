# Prompt Log — Habit Tracker Session

## Phase 1 — Brainstorm

**Prompt 1**
I want to build a small local web application. Help me sharpen the idea by asking me questions. I will answer. After five rounds of questions, summarise what we have agreed on as a one-page brief covering: the user, the three core user stories, the key nouns (things the app tracks), and the key verbs (things the user can do).

**Prompt 2**
1. The aim is to help track exercise habits, so that not only is the user exercising, but they're following a plan: Upper body, lower body, cardio, rest day. 6 days on and 1 day off for a total of 7 days. This is to track consistency and ensure full body health. 2. It's just me. 3. Local machine, not shared - it's a self contained app.

**Prompt 3**
1. The app records, but user decides which activity they're doing. 2. Logging includes date, habit (upper, lower, cardio), optional note. 3. Dashboard would show streak - e.g. 4 weeks (consecutive weeks at 6/6), This week - e.g. 4/6 days completed, Completion rate - e.g. 85% over the last month.

**Prompt 4**
1. Fixed Monday-Sunday. 2. No enforcement, but full visibility. 3. The app only exists in the moment the user checks in. User opens it - taps activity, closes it. There's no time based behaviour or notifications or reminders etc. So yes, it's active logging, it should be intentional. It might be helpful to also track best streak and current streak separately - if the user is sick, for example that would reset their current streak, but the record is preserved.

**Prompt 5**
1. 6 days logged regardless of rest. Every week counts. Note - I also want habits to be user-defined rather than hardcoded, so I can add or archive activity types myself. 2. A grid of days is the history - a calendar view showing which days had check-ins, colour-coded by activity type, will give the user a full picture at a glance. 3. Backend: Python 3.12 (managed by uv), FastAPI - web framework, SQLite - database (via stdlib sqlite3, no ORM), Pydantic - request/response validation, uvicorn.

**Prompt 6**
1. Where it lives - separate settings/admin section. Inline on the main screen mixes two different modes (doing vs managing) and clutters the daily check in interaction. The main screen should be frictionless - open, tap, done. Habit management is a rare action. Regarding the archived habits: yes, they should still appear in the calendar, in full colour, not greyed out. Archived habits just won't appear on the daily check-in screen, but they do appear in the history grid. That should be the only difference.

**Prompt 7**
One minor mistake: Rest days are not logged explicitly, they are simply the absence of a check-in. Correct and then save this as docs/01-brief.md.

---

## Phase 2 — Data Model

**Prompt 8**
Read docs/01-brief.md. Based on the nouns listed there, propose a data model for a SQLite database. For each entity, give me: its fields, each field's type and whether it is required, the primary key, any foreign keys, and any uniqueness or check constraints. Show the model as a markdown document, not SQL. Explain every foreign key in one sentence. Then list any ambiguities you had to resolve and why.

**Prompt 9**
Change UNIQUE(date) to UNIQUE(date, habit_id). Add updated_at to the habits table. Then save as docs/02-data-model.md.

---

## Phase 3 — Database

**Prompt 10**
Using docs/02-data-model.md as the source of truth, generate backend/schema.sql for SQLite. Include every primary key, foreign key, uniqueness constraint, and check constraint from the model. Add created_at and updated_at where the model specifies them. Then generate backend/seed.sql with 3-5 rows per table covering the happy path and at least one edge case per user story. Finally, wire the schema to apply automatically on backend startup if the database file does not exist.

**Prompt 11**
Restart the backend and confirm the database initialises from schema.sql and seed.sql without errors. Show me the habit and check-in counts.

---

## Phase 4 — API

**Prompt 12**
Based on the verbs in docs/01-brief.md and the entities in docs/02-data-model.md, propose a REST API. For each endpoint, give me: the method, the path, the request body shape, the response shape, and which user story it serves. Do not write code yet. Return a markdown table. Once I approve the table, implement these endpoints in FastAPI under backend/app/. Use Pydantic models for every request and response. Use the stdlib sqlite3 module. All routes must be prefixed with /api. Add a GET /api/health that returns {"status": "ok"}. Make sure every endpoint appears in the OpenAPI docs at /docs with a clear summary and a populated example.

**Prompt 13**
Before implementing, add two more endpoints: DELETE /api/checkins/{id} to undo a check-in, and update PATCH /api/habits/{id} to also accept name and colour as optional fields alongside status so habits can be renamed and recoloured. Then implement everything.

**Prompt 14**
Confirm - port 8000 or 8001?

**Prompt 15**
Kill 8001 and restart on 8000.

---

## Phase 5 — Frontend

**Prompt 16**
Generate TypeScript types for every request and response in the backend OpenAPI spec at http://localhost:8000/openapi.json. Put them in frontend/src/api/types.ts. Then write a thin client.ts in the same directory with one function per endpoint. Every function must use the generated types — no any. Then, for each of the three user stories in docs/01-brief.md, propose a screen: what the user sees, what they can do, what state changes after each action. Return a short markdown brief per screen. Do not write components yet. Once I approve the screens, implement them using React and plain CSS. Use the typed client for every API call. Keep each screen to one route. Show loading and error states for every request. Add one Vitest test per screen that renders it with a mocked client.

**Prompt 17**
The settings screen is missing. Could you add it? Regarding Screen 1: I think we should articulate the taps more clearly: First tap - note field opens, second tap on the habit button (not a separate confirm button) - logs with no note, or type a note and hit confirm - logs with note. Screen 3: what happens if I tap a cell that has a check in? Can I see the note? Otherwise, maybe a tooltip opens up when hovering above.

**Prompt 18**
For the settings screen - renaming and recolour is missing. Each habit row needs an edit interaction - this can be a pencil icon that makes the name and colour swatch editable inline. There's also no way to unarchive a habit.

**Prompt 19**
Approved - please implement.

---

## Phase 5 — Refinements

**Prompt 20**
Add a date picker to the check in screen defaulting to today, so the user can backdate a check in. The selected date should be passed as the date field in the POST /api/checkins request. In the history grid, replace single-colour cells with stacked dots - one small circular dot per check-in on that day, each dot using its habit's colour. Dots should be centred in the cell and stack vertically. The cell background should remain grey/neutral.

**Prompt 21**
[Context compaction — session continued from summary]

**Prompt 22**
In the history grid, add a move option to the tooltip on filled cells. When the user clicks 'Move', a small date picker appears. On confirm, DELETE the existing check-in and POST a new one with the same habit_id and note but the new date. If the new date already has a check-in for the same habit, show an error — don't delete the original. Once complete, refresh the grid.

**Prompt 23**
In the history grid, show the full date (e.g. '12 May') on hover/tap of any cell — logged or empty. Currently only filled cells show a tooltip. Empty cells should also show their date on hover/tap so the user always knows exactly which day they're looking at.

**Prompt 24**
The date picker on the Check-in screen has two bugs: (1) clicking the month navigation arrows inside the native date picker closes the picker and jumps to the same day in the previous/next month instead of staying open for day selection; (2) keyboard arrow keys navigate between habit buttons instead of within the date picker. Fix both by replacing the native input type="date" with a controlled text input that accepts manual typing in YYYY-MM-DD format, with a visible format hint (e.g. placeholder 'YYYY-MM-DD'). Keep the native date picker as a fallback icon button next to the text input for users who prefer it, but ensure keyboard focus stays within the picker when it's open.

**Prompt 25**
The native date picker still has navigation issues — clicking month arrows closes the picker. Remove the native date picker icon/button entirely. The text input with YYYY-MM-DD format is sufficient. Add basic validation: if the user types an invalid date, show an inline error message and prevent the POST.

**Prompt 26**
Confirm that when opened, the app will default to today().

---

## Phase 6 — Verify & Retro

**Prompt 27**
Let's verify. Kill both servers. From the repo root, run uv sync in backend/, then npm install in frontend/, then start both. Walk me through each user story in the browser. If any story fails or any unexpected error appears, tell me which phase's artifact needs to change — do not patch in place. Then help me write docs/06-retro.md: what surprised me, what I would do differently, where I pushed back on the agent and why. Include the full prompt log from this session.
