-- Habit Tracker seed data
-- Covers the happy path and at least one edge case per user story.
--
-- NOTE: streak and completion-rate features inherently require several weeks of
-- data, so checkins intentionally exceeds the "3–5 rows" guideline used for
-- simpler tables.
--
-- Dashboard state produced by this seed (relative to 2026-05-10):
--   Best streak    : 4 complete weeks (user is on their personal-best run)
--   Current streak : 4 complete weeks (Apr 6 – May 3)
--   This week      : 5 / 6  (Mon–Fri logged; Sun is today, not yet logged)
--   Completion rate: 100 %  (24 / 24 days across last 4 complete weeks)

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
INSERT INTO habits (id, name, colour, status, created_at, updated_at) VALUES
    (1, 'Upper Body', '#4A90D9', 'active',   '2026-01-06T08:00:00', '2026-01-06T08:00:00'),
    (2, 'Lower Body', '#7ED321', 'active',   '2026-01-06T08:00:00', '2026-01-06T08:00:00'),
    (3, 'Cardio',     '#F5A623', 'active',   '2026-01-06T08:00:00', '2026-01-06T08:00:00'),
    -- Edge case (US3): archived habit — visible in calendar history at full colour,
    -- absent from the check-in screen, cannot receive new check-ins.
    (4, 'Mobility',   '#9B59B6', 'archived', '2026-01-06T08:00:00', '2026-03-01T09:15:00');

-- ---------------------------------------------------------------------------
-- checkins
-- ---------------------------------------------------------------------------

-- US3 edge case: check-in older than 12 weeks from today (2026-05-10).
-- Requires the user to navigate backwards past the first 12-week block.
INSERT INTO checkins (date, habit_id, note, created_at) VALUES
    ('2026-01-12', 1, NULL, '2026-01-12T07:45:00');

-- US3 edge case: archived habit (Mobility) appears in calendar at full colour.
INSERT INTO checkins (date, habit_id, note, created_at) VALUES
    ('2026-01-26', 4, 'Last session before archiving this habit', '2026-01-26T08:10:00');

-- Old streak — two consecutive complete weeks (establishes an early baseline).
-- These weeks are superseded by the current streak but remain in calendar history.
-- Weeks: 2026-03-09 to 2026-03-15  and  2026-03-16 to 2026-03-22
INSERT INTO checkins (date, habit_id, note, created_at) VALUES
    ('2026-03-09', 1, NULL, '2026-03-09T07:30:00'),
    ('2026-03-10', 2, NULL, '2026-03-10T07:30:00'),
    ('2026-03-11', 3, NULL, '2026-03-11T07:30:00'),
    ('2026-03-12', 1, NULL, '2026-03-12T07:30:00'),
    ('2026-03-13', 2, NULL, '2026-03-13T07:30:00'),
    ('2026-03-14', 3, NULL, '2026-03-14T07:30:00'),

    ('2026-03-16', 1, NULL, '2026-03-16T07:30:00'),
    ('2026-03-17', 2, NULL, '2026-03-17T07:30:00'),
    ('2026-03-18', 3, NULL, '2026-03-18T07:30:00'),
    ('2026-03-19', 1, NULL, '2026-03-19T07:30:00'),
    ('2026-03-20', 2, NULL, '2026-03-20T07:30:00'),
    ('2026-03-21', 3, NULL, '2026-03-21T07:30:00');

-- US2 edge case: streak-breaking week (only 3 / 6 days — simulates illness).
-- This resets the current streak; the old streak of 2 becomes the prior best.
-- Week: 2026-03-23 to 2026-03-29
INSERT INTO checkins (date, habit_id, note, created_at) VALUES
    ('2026-03-23', 1, NULL, '2026-03-23T07:30:00'),
    ('2026-03-24', 2, NULL, '2026-03-24T07:30:00'),
    ('2026-03-25', 3, NULL, '2026-03-25T07:30:00');

-- US2 happy path + completion-rate window: four consecutive complete weeks.
-- These are also the last four complete Mon–Sun weeks before today (2026-05-10),
-- so they define the completion-rate denominator (4 × 6 = 24 possible days).
-- Current streak grows to 4, surpassing the prior best of 2.
-- Weeks: Apr 6–12, Apr 13–19, Apr 20–26, Apr 27–May 3
INSERT INTO checkins (date, habit_id, note, created_at) VALUES
    -- Week 1 of current streak
    ('2026-04-06', 1, NULL, '2026-04-06T07:30:00'),
    ('2026-04-07', 2, NULL, '2026-04-07T07:30:00'),
    ('2026-04-08', 3, NULL, '2026-04-08T07:30:00'),
    ('2026-04-09', 1, NULL, '2026-04-09T07:30:00'),
    ('2026-04-10', 2, NULL, '2026-04-10T07:30:00'),
    ('2026-04-11', 3, NULL, '2026-04-11T07:30:00'),

    -- Week 2 of current streak
    ('2026-04-13', 1, NULL, '2026-04-13T07:30:00'),
    ('2026-04-14', 2, NULL, '2026-04-14T07:30:00'),
    ('2026-04-15', 3, NULL, '2026-04-15T07:30:00'),
    ('2026-04-16', 1, NULL, '2026-04-16T07:30:00'),
    ('2026-04-17', 2, NULL, '2026-04-17T07:30:00'),
    ('2026-04-18', 3, NULL, '2026-04-18T07:30:00'),

    -- Week 3 of current streak
    ('2026-04-20', 1, NULL, '2026-04-20T07:30:00'),
    ('2026-04-21', 2, NULL, '2026-04-21T07:30:00'),
    ('2026-04-22', 3, NULL, '2026-04-22T07:30:00'),
    ('2026-04-23', 1, NULL, '2026-04-23T07:30:00'),
    ('2026-04-24', 2, NULL, '2026-04-24T07:30:00'),
    ('2026-04-25', 3, NULL, '2026-04-25T07:30:00'),

    -- Week 4 of current streak (US1 happy path: one check-in includes a note)
    ('2026-04-27', 1, NULL,                      '2026-04-27T07:30:00'),
    ('2026-04-28', 2, 'First time squatting 100 kg', '2026-04-28T07:30:00'),
    ('2026-04-29', 3, NULL,                      '2026-04-29T07:30:00'),
    ('2026-04-30', 1, NULL,                      '2026-04-30T07:30:00'),
    ('2026-05-01', 2, NULL,                      '2026-05-01T07:30:00'),
    ('2026-05-02', 3, NULL,                      '2026-05-02T07:30:00');

-- Current week (2026-05-04 to 2026-05-10, today is Sunday).
-- Five days logged → dashboard shows "This week: 5 / 6".
-- Sunday is unlogged (rest day implied by absence — not explicitly recorded).
INSERT INTO checkins (date, habit_id, note, created_at) VALUES
    ('2026-05-04', 1, NULL, '2026-05-04T07:30:00'),
    ('2026-05-05', 2, NULL, '2026-05-05T07:30:00'),
    ('2026-05-06', 3, NULL, '2026-05-06T07:30:00'),
    ('2026-05-07', 1, NULL, '2026-05-07T07:30:00'),
    ('2026-05-08', 2, NULL, '2026-05-08T07:30:00');
