# Screen Briefs — Habit Tracker

## Screen 1: Check-in (/)

### What the user sees
Today's date as a heading. A row of coloured pill buttons, one per active habit. Habits already logged today appear with a checkmark and are visually distinct (dimmed border, tick icon).

### What the user can do
- First tap on an unlogged habit → button expands to reveal a note field and a Confirm button; no check-in is written yet
- Second tap on the same habit button (without typing a note) → logs the check-in immediately with no note; note field collapses
- Type a note then tap Confirm → logs the check-in with the note
- Tap a logged habit → deletes the check-in (undo); button returns to unlogged state
- Navigate to other screens via bottom nav

### State changes

| Action | State change |
|--------|-------------|
| Mount | GET /api/habits + GET /api/checkins?from=today&to=today |
| First tap (unlogged habit) | Local UI state: habit enters pending mode; note field opens |
| Second tap on same habit | POST /api/checkins (no note); habit flips to logged |
| Confirm with note | POST /api/checkins (with note); habit flips to logged |
| Tap logged habit | DELETE /api/checkins/{id}; habit flips to unlogged |

---

## Screen 2: Dashboard (/dashboard)

### What the user sees
Four stat cards in a 2×2 grid: Current streak, Best streak, This week (N/6 + progress bar), Completion rate (%). Read-only.

### What the user can do
- Navigate to other screens via bottom nav. Stats refresh on each visit.

### State changes

| Action | State change |
|--------|-------------|
| Mount | GET /api/dashboard; loading skeleton → cards |
| Error | Inline error with retry button |

---

## Screen 3: History (/history)

### What the user sees
A 12-week grid: 12 rows × 7 columns (Mon–Sun). Filled cells show the habit's colour; empty cells are grey. Monday dates label each row. ← Prev / Next → navigation at the top. Next is disabled on the current block.

On hover (desktop): a tooltip appears over any filled cell showing the habit name and note (if one exists). On tap (touch): tapping a filled cell toggles an inline tooltip below the cell.

### What the user can do
- Hover or tap a filled cell → see habit name + note (e.g. "Upper Body — Personal best on bench press"; or just "Cardio" if no note)
- Tap ← Prev / Next → → navigate 12-week blocks; fetch new range
- Empty cells have no interaction

### State changes

| Action | State change |
|--------|-------------|
| Mount | Compute current 12-week window; GET /api/checkins?from=&to= + GET /api/habits; render grid |
| Hover/tap filled cell | Local UI state: tooltip visible with habit name + note |
| Tap Prev / Next | Offset ± 12 weeks; refetch check-ins; grid re-renders |

---

## Screen 4: Settings (/settings)

### What the user sees
Two sections:

**Habits** — a list of all habits, active first then archived. Each row shows a colour swatch, the habit name, a pencil icon, and an Archive/Unarchive button. Archived habits are visually subdued (lower opacity) but otherwise follow the same row layout. At the bottom of the habit list, an inline Add form: colour picker + name field + Add button.

**Data** — a single Export CSV button.

### What the user can do
- Pencil icon on any habit → row switches to edit mode inline: colour swatch becomes a colour picker, name becomes a text input, Save / Cancel buttons appear
- Save → commits the rename/recolour; row returns to read mode
- Cancel → discards changes; row returns to read mode
- Archive on an active habit → archives it; button label flips to Unarchive
- Unarchive on an archived habit → restores it to active; button label flips to Archive
- Add → creates a new active habit; form resets
- Export CSV → downloads the file

### State changes

| Action | State change |
|--------|-------------|
| Mount | GET /api/habits |
| Tap pencil | Local UI state: row enters edit mode; inputs pre-filled with current name and colour |
| Tap Save | PATCH /api/habits/{id} {name, colour}; row exits edit mode with updated values |
| Tap Cancel | Local UI state only; row exits edit mode, no API call |
| Tap Archive | PATCH /api/habits/{id} {status: "archived"}; row becomes subdued, button → Unarchive |
| Tap Unarchive | PATCH /api/habits/{id} {status: "active"}; row becomes full-opacity, button → Archive |
| Tap Add | POST /api/habits; habit appears at top of active list; form resets |
| Tap Export CSV | GET /api/export; browser downloads habit-tracker-export.csv |
