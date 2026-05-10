import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { CheckinResponse, HabitResponse } from '../api/types';
import { formatLongDate, todayISO } from '../utils/dates';
import './CheckinScreen.css';

/** Returns true only for a real YYYY-MM-DD date (no Feb 30 roll-overs, etc.). */
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export default function CheckinScreen() {
  const [selectedDate, setSelectedDate] = useState(todayISO);
  // textDate is what's in the box; may be incomplete/invalid while the user types.
  const [textDate, setTextDate] = useState(todayISO);
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [checkins, setCheckins] = useState<CheckinResponse[]>([]);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { void load(selectedDate); }, [selectedDate]);

  async function load(date: string) {
    setLoading(true);
    setError(null);
    try {
      const [h, c] = await Promise.all([
        api.listHabits(),
        api.listCheckins(date, date),
      ]);
      setHabits(h.filter(habit => habit.status === 'active'));
      setCheckins(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  /** Called on every keystroke; only commits to selectedDate when fully valid. */
  function handleTextInput(value: string) {
    setTextDate(value);
    if (isValidDate(value) && value <= todayISO()) {
      setSelectedDate(value);
      setPendingId(null);
      setNote('');
      setActionError(null);
    }
  }

  // Derived: show an error only once the user has typed all 10 characters.
  const dateError: string | null = (() => {
    if (textDate.length < 10) return null;
    if (!isValidDate(textDate)) return 'Invalid date — use YYYY-MM-DD';
    if (textDate > todayISO()) return 'Date cannot be in the future';
    return null;
  })();

  function checkinFor(habitId: number): CheckinResponse | undefined {
    return checkins.find(c => c.habit_id === habitId);
  }

  async function handleHabitClick(habit: HabitResponse) {
    // Block any action while the date field is in an invalid or uncommitted state.
    if (textDate !== selectedDate) return;

    setActionError(null);
    const existing = checkinFor(habit.id);

    if (existing) {
      try {
        await api.deleteCheckin(existing.id);
        setCheckins(prev => prev.filter(c => c.id !== existing.id));
        if (pendingId === habit.id) setPendingId(null);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Failed to undo check-in');
      }
      return;
    }

    if (pendingId === habit.id) {
      await submit(habit.id, '');
      return;
    }

    setPendingId(habit.id);
    setNote('');
  }

  async function submit(habitId: number, noteText: string) {
    try {
      const created = await api.createCheckin({
        date: selectedDate,
        habit_id: habitId,
        note: noteText.trim() || null,
      });
      setCheckins(prev => [...prev, created]);
      setPendingId(null);
      setNote('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to log check-in');
    }
  }

  if (loading) return <div className="screen-loading">Loading…</div>;
  if (error) return (
    <div className="screen-error">
      <p>{error}</p>
      <button onClick={() => void load(selectedDate)}>Retry</button>
    </div>
  );

  return (
    <div className="checkin-screen">
      <div className="checkin-header">
        <h1 className="checkin-date">{formatLongDate(selectedDate)}</h1>
        <div className="date-field">
          <input
            type="text"
            className={`date-text-input${dateError ? ' date-text-input--error' : ''}`}
            value={textDate}
            placeholder="YYYY-MM-DD"
            maxLength={10}
            aria-label="Date (YYYY-MM-DD)"
            aria-invalid={!!dateError}
            onChange={e => handleTextInput(e.target.value)}
          />
          {dateError && <p className="date-error">{dateError}</p>}
        </div>
      </div>

      {actionError && <p className="action-error">{actionError}</p>}

      {habits.length === 0 && (
        <p className="checkin-empty">
          No active habits.{' '}
          <a href="#/settings">Add one in Settings.</a>
        </p>
      )}

      <div className="habit-list">
        {habits.map(habit => {
          const logged = checkinFor(habit.id);
          const isPending = pendingId === habit.id;

          return (
            <div key={habit.id} className="habit-item">
              <button
                className={[
                  'habit-btn',
                  logged ? 'habit-btn--logged' : '',
                  isPending ? 'habit-btn--pending' : '',
                ].join(' ')}
                style={{ '--habit-colour': habit.colour } as React.CSSProperties}
                onClick={() => void handleHabitClick(habit)}
                aria-pressed={!!logged}
              >
                {logged && <span className="habit-btn__check">✓</span>}
                {habit.name}
              </button>

              {isPending && (
                <div className="note-field">
                  <input
                    type="text"
                    className="note-input"
                    placeholder="Note (optional)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') void submit(habit.id, note); }}
                    autoFocus
                  />
                  <button
                    className="btn"
                    onClick={() => void submit(habit.id, note)}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
