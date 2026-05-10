import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { CheckinResponse, HabitResponse } from '../api/types';
import { formatShortDate, getBlock, todayISO } from '../utils/dates';
import './HistoryScreen.css';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface TooltipState {
  dateStr: string;
  x: number;
  y: number;
  pinned: boolean;
  moveCheckin: CheckinResponse | null;
  moveDate: string;
  moveError: string | null;
}

export default function HistoryScreen() {
  const [offset, setOffset] = useState(0);
  const [checkins, setCheckins] = useState<CheckinResponse[]>([]);
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const pinnedDate = useRef<string | null>(null);

  useEffect(() => { void load(offset); }, [offset]);

  async function load(off: number) {
    setLoading(true);
    setError(null);
    setTooltip(null);
    pinnedDate.current = null;
    try {
      const { from, to } = getBlock(off);
      const [c, h] = await Promise.all([
        api.listCheckins(from, to),
        api.listHabits(),
      ]);
      setCheckins(c);
      setHabits(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }

  const { weeks } = getBlock(offset);
  const habitsById = new Map(habits.map(h => [h.id, h]));

  const byDate = new Map<string, CheckinResponse[]>();
  for (const c of checkins) {
    const list = byDate.get(c.date) ?? [];
    list.push(c);
    byDate.set(c.date, list);
  }

  // Pre-compute checkins for the currently-shown tooltip
  const tooltipCheckins = tooltip ? (byDate.get(tooltip.dateStr) ?? []) : [];

  function openTooltip(e: React.MouseEvent, dateStr: string, pinned: boolean) {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      dateStr,
      x: rect.left + rect.width / 2,
      y: rect.top,
      pinned,
      moveCheckin: null,
      moveDate: '',
      moveError: null,
    });
  }

  function handleCellEnter(e: React.MouseEvent, dateStr: string) {
    if (pinnedDate.current) return;
    openTooltip(e, dateStr, false);
  }

  function handleCellLeave() {
    if (!pinnedDate.current) setTooltip(null);
  }

  function handleCellClick(e: React.MouseEvent, dateStr: string) {
    if (pinnedDate.current === dateStr) {
      pinnedDate.current = null;
      setTooltip(null);
    } else {
      pinnedDate.current = dateStr;
      openTooltip(e, dateStr, true);
    }
  }

  async function handleMove(checkin: CheckinResponse, newDate: string) {
    if (!newDate || newDate === checkin.date) return;
    try {
      // Create first — if the target date already has this habit, the API
      // will reject with a conflict error and we leave the original intact.
      await api.createCheckin({ date: newDate, habit_id: checkin.habit_id, note: checkin.note });
      await api.deleteCheckin(checkin.id);
      pinnedDate.current = null;
      setTooltip(null);
      void load(offset);
    } catch (e) {
      setTooltip(prev => prev
        ? { ...prev, moveError: e instanceof Error ? e.message : 'Failed to move' }
        : prev
      );
    }
  }

  if (error) return (
    <div className="screen-error">
      <p>{error}</p>
      <button onClick={() => void load(offset)}>Retry</button>
    </div>
  );

  return (
    <div className="history-screen">
      <div className="history-nav">
        <button className="btn-ghost" onClick={() => setOffset(o => o - 1)}>
          ← Prev
        </button>
        <span className="history-range">
          {weeks[0][0] !== undefined ? formatShortDate(weeks[0][0]) : ''}
          {' – '}
          {weeks[11][6] !== undefined ? formatShortDate(weeks[11][6]) : ''}
        </span>
        <button
          className="btn-ghost"
          onClick={() => setOffset(o => o + 1)}
          disabled={offset >= 0}
        >
          Next →
        </button>
      </div>

      {loading ? (
        <div className="screen-loading">Loading…</div>
      ) : (
        <div className="history-grid">
          <div className="history-week-label" />
          {DAY_HEADERS.map(d => (
            <div key={d} className="history-day-header">{d}</div>
          ))}

          {weeks.map((week, wi) => (
            <div key={wi} className="history-row">
              <div className="history-week-label">
                {formatShortDate(week[0])}
              </div>
              {week.map(dateStr => {
                const dayCis = byDate.get(dateStr) ?? [];
                const hasCi = dayCis.length > 0;
                return (
                  <div
                    key={dateStr}
                    className={hasCi ? 'history-cell history-cell--filled' : 'history-cell'}
                    onMouseEnter={e => handleCellEnter(e, dateStr)}
                    onMouseLeave={handleCellLeave}
                    onClick={e => handleCellClick(e, dateStr)}
                    role={hasCi ? 'button' : undefined}
                    aria-label={hasCi ? dateStr : undefined}
                  >
                    {dayCis.map(c => {
                      const colour = habitsById.get(c.habit_id)?.colour;
                      return colour ? (
                        <span
                          key={c.id}
                          className="history-dot"
                          style={{ background: colour }}
                        />
                      ) : null;
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tooltip && (
        <div
          className={`history-tooltip${tooltip.pinned ? ' history-tooltip--pinned' : ''}`}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.moveCheckin ? (
            // ── Move mode ──────────────────────────────────────────────
            <div className="tooltip-move">
              <input
                type="date"
                className="tooltip-date-input"
                value={tooltip.moveDate}
                max={todayISO()}
                autoFocus
                onChange={e => setTooltip(prev => prev
                  ? { ...prev, moveDate: e.target.value, moveError: null }
                  : prev
                )}
              />
              {tooltip.moveError && (
                <p className="tooltip-move-error">{tooltip.moveError}</p>
              )}
              <div className="tooltip-move-actions">
                <button
                  disabled={!tooltip.moveDate || tooltip.moveDate === tooltip.moveCheckin.date}
                  onClick={() => void handleMove(tooltip.moveCheckin!, tooltip.moveDate)}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setTooltip(prev => prev
                    ? { ...prev, moveCheckin: null, moveError: null }
                    : prev
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // ── Info mode ──────────────────────────────────────────────
            <>
              <div className="tooltip-date">{formatShortDate(tooltip.dateStr)}</div>
              {tooltipCheckins.map(c => {
                const name = habitsById.get(c.habit_id)?.name ?? 'Unknown';
                const label = c.note ? `${name} · ${c.note}` : name;
                return (
                  <div key={c.id} className="tooltip-row">
                    <span>{label}</span>
                    {tooltip.pinned && (
                      <button
                        className="tooltip-move-btn"
                        onClick={() => setTooltip(prev => prev
                          ? { ...prev, moveCheckin: c, moveDate: c.date, moveError: null }
                          : prev
                        )}
                      >
                        Move
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
