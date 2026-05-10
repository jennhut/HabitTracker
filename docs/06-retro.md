# Retrospective — Habit Tracker Build

**Date:** 10 May 2026
**Total build time:** ~4.5 hours
**Outcome:** All three user stories verified passing. 13 automated tests green.

---

## What Surprised Me

**Staying within the token budget.**
I expected to hit context limits much earlier and have to start over or lose thread. The context compaction kicked in cleanly and the session continued without losing architectural decisions. The agent picked up exactly where it left off.

**The two-agent setup worked better than expected.**
I had a second agent running in parallel — a guide rather than a builder. It answered questions, challenged scope creep in real time, and helped me stay on track. When I spotted that the Settings screen was missing from the documentation phase, I used the guide to help identify it, then brought the finding back to the builder. It genuinely felt like working with a small team: one person who builds, one who keeps an eye on the bigger picture, and me as the decision-maker in the middle.

**Calendar bugs were surfaced, not hidden.**
The native `<input type="date">` issues — month arrows closing the picker, arrow keys escaping to the habit buttons — appeared during the verification step exactly as you'd expect from a browser-native control embedded in a custom layout. The first fix (adding a fallback icon + hidden picker) turned out not to resolve the root cause. The second pass (removing the native control entirely) was the right call. The bugs were real, they were predictable in hindsight, and surfacing them during a structured walkthrough rather than in production was the correct order.

---

## What I Would Do Differently

**Document the Settings screen earlier.**
The brief captured the three narrative user stories but the Settings screen — add habit, archive, rename, recolour, export — wasn't written up until after the screens were already proposed. I had to identify the gap myself (with the guide's help) and push it back to the builder mid-cycle. It should have been in the brief as a fourth user story, or at least called out as a supporting story in `01-brief.md`.

**Add week-level notes to the data model from the start.**
When I wanted to record why a week was missed — illness, travel, whatever — the answer was scope creep and I agreed to park it. But it's a real need and adding it later will require a schema migration and a UI change. A `week_notes` table with `(week_start TEXT, note TEXT)` would have been cheap to add up front and would have enabled a meaningful feature without bloating the core loop.

**Separate the history grid interaction spec from the visual spec.**
The history grid went through several rounds: single-colour cells → stacked dots → tooltip on empty cells → move option inside the tooltip → date shown on all cells. Each change was reasonable individually but they accumulated. A tighter interaction spec before implementation would have reduced the iteration count.

**Add a startup script.**
Running the app outside of VS Code requires two manual terminal commands — one for the backend, one for the frontend. A simple `start.bat` (Windows) or `start.sh` (Mac/Linux) in the repo root would launch both servers in one step and make the app genuinely usable day-to-day without a development environment open.

---

## Where I Pushed Back and Why

**Scope: exercise tracking within a check-in.**
I wanted to log the specific exercises done during a session, not just that a session happened. The guide explained clearly why this was scope creep: it changes the data model from a simple check-in log to a workout journal, adds a whole new set of verbs and nouns, and pulls the app away from its core frictionless premise. I agreed. The habit + optional note model is the right constraint for this tool.

**Schema: `UNIQUE(date)` → `UNIQUE(date, habit_id)`.**
The builder initially proposed one check-in per day total. I pushed back: I have multiple habits and I want to log all of them on the same day. The fix was a one-line schema change and a seed data update. This was the right call — the original constraint would have made the app unusable for its actual purpose.

**Settings screen: rename and recolour missing.**
The first Settings proposal had archive/unarchive and add, but no way to rename a habit or change its colour. I pushed back because those are day-one needs — habit names change and colour-coding is only useful if you can correct a bad choice. The builder added inline edit mode with a colour picker.

**Settings screen: unarchive missing.**
Relatedly, the first version had no way to bring an archived habit back to active. I caught this separately. Archive without unarchive is a one-way door, which is wrong for a personal tool.

**Calendar date picker: two rounds of fixes.**
The first fix introduced a hidden native picker + icon button and `showPicker()`. I accepted it, but on browser testing the month-arrow bug was still present. I pushed back again and the right fix was simpler: remove the native picker entirely. The text input with format validation is genuinely sufficient and eliminates the class of bugs entirely.

---

## Prompt Log — This Session

*The full verbatim prompt log is in [docs/prompt-log.md](prompt-log.md), extracted from the session transcript and organised by phase.*

### Pre-compaction prompts (reconstructed from session summary)

1. *"I want to build a small local web application. Help me sharpen the idea by asking me questions."*
2. *(Answer round 1)* "The aim is to help track exercise habits. It's just me. Local machine."
3. *(Answer round 2)* "The app records, but the user decides which activity they're doing. Logging includes date, habit, optional note. Dashboard would show streak."
4. *(Answer round 3)* "Fixed Monday–Sunday. No enforcement, but full visibility. The app only exists in the moment the user checks in."
5. *(Answer round 4)* "6 days logged regardless of rest. Every week counts. I also want habits to be user-defined. A grid of days is the history. Period defined by last 4 complete weeks."
6. *"One minor mistake: rest days are not logged explicitly, they are simply the absence of a check-in. Correct and then save this as docs/01-brief.md."*
7. *"Read docs/01-brief.md. Based on the nouns listed there, propose a data model for a SQLite database."*
8. *"Change UNIQUE(date) to UNIQUE(date, habit_id). Add updated_at to the habits table. Then save as docs/02-data-model.md."*
9. *"Using docs/02-data-model.md as the source of truth, generate backend/schema.sql for SQLite… Then generate backend/seed.sql… Finally, wire the schema to apply automatically on backend startup."*
10. *"Restart the backend and confirm the database initialises from schema.sql and seed.sql without errors. Show me the habit and check-in counts."*
11. *"Based on the verbs in docs/01-brief.md and the entities in docs/02-data-model.md, propose a REST API… Once I approve the table, implement these endpoints in FastAPI."*
12. *"Before implementing, add two more endpoints: DELETE /api/checkins/{id}… and update PATCH /api/habits/{id} to also accept name and colour… Then implement everything."*
13. *"Confirm — port 8000 or 8001?"*
14. *"Kill 8001 and restart on 8000."*
15. *"Generate TypeScript types for every request and response in the backend OpenAPI spec at http://localhost:8000/openapi.json… Then write a thin client.ts… Then, for each of the three user stories in docs/01-brief.md, propose a screen."*
16. *"The settings screen is missing. Could you add it? Regarding Screen 1: I think we should articulate the taps more clearly… Screen 3: what happens if I tap a cell that has a check-in? Can I see the note?"*
17. *"For the settings screen — renaming and recolour is missing… There's also no way to unarchive a habit."*
18. *"Approved — please implement."*
19. *"Add a date picker to the check-in screen defaulting to today, so the user can backdate a check-in. The selected date should be passed as the date field in the POST /api/checkins/ request. In the history grid, replace single-colour cells with stacked dots — one small circular dot per check-in on that day, each dot using its habit's colour. Dots should be centred in the cell and stack vertically. The cell background should remain grey/neutral."*

### Post-compaction prompts (this conversation)

20. *"In the history grid, add a move option to the tooltip on filled cells. When the user clicks 'Move', a small date picker appears. On confirm, DELETE the existing check-in and POST a new one with the same habit_id and note but the new date. If the new date already has a check-in for the same habit, show an error — don't delete the original. Once complete, refresh the grid."*
21. *"In the history grid, show the full date (e.g. '12 May') on hover/tap of any cell — logged or empty. Currently only filled cells show a tooltip. Empty cells should also show their date on hover/tap so the user always knows exactly which day they're looking at."*
22. *"The date picker on the Check-in screen has two bugs: (1) clicking the month navigation arrows inside the native date picker closes the picker and jumps to the same day in the previous/next month instead of staying open for day selection; (2) keyboard arrow keys navigate between habit buttons instead of within the date picker. Fix both by replacing the native \<input type='date'\> with a controlled text input that accepts manual typing in YYYY-MM-DD format, with a visible format hint (e.g. placeholder 'YYYY-MM-DD'). Keep the native date picker as a fallback icon button next to the text input for users who prefer it, but ensure keyboard focus stays within the picker when it's open."*
23. *"The native date picker still has navigation issues — clicking month arrows closes the picker. Remove the native date picker icon/button entirely. The text input with YYYY-MM-DD format is sufficient. Add basic validation: if the user types an invalid date, show an inline error message and prevent the POST."*
24. *"Confirm that when opened, the app will default to today()."*
25. *"Let's verify. Kill both servers. From the repo root, run uv sync in backend/, then npm install in frontend/, then start both. Walk me through each user story in the browser. If any story fails or any unexpected error appears, tell me which phase's artifact needs to change — do not patch in place. Then help me write docs/06-retro.md."*
26. *"Tests all passed. Here are my reflections: I was surprised how I stayed well within my tokens. I had another agent running as well that plugged into the activity instructions and was able to guide me through the creation of the tool… [full reflection provided verbally]"*

---

## Summary Verdict

The build worked. The constraint discipline — no ORM, no component library, types from the spec, raw SQL — held throughout. The two-agent approach was unexpectedly effective. The next version of this tool should add week notes, a startup script (`start.bat` or `start.sh`) so the app can be launched outside of VS Code without two manual terminal commands, and tighten the interaction spec before touching code.
