import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { HabitResponse } from '../api/types';
import './SettingsScreen.css';

const DEFAULT_COLOUR = '#4A90D9';

interface EditState {
  id: number;
  name: string;
  colour: string;
}

export default function SettingsScreen() {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [newName, setNewName] = useState('');
  const [newColour, setNewColour] = useState(DEFAULT_COLOUR);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setHabits(await api.listHabits());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }

  // ── Edit ────────────────────────────────────────────────────────────────

  function openEdit(h: HabitResponse) {
    setEdit({ id: h.id, name: h.name, colour: h.colour });
    setActionError(null);
  }

  function cancelEdit() {
    setEdit(null);
  }

  async function saveEdit() {
    if (!edit) return;
    setActionError(null);
    try {
      const updated = await api.updateHabit(edit.id, {
        name: edit.name.trim(),
        colour: edit.colour,
      });
      setHabits(prev => prev.map(h => h.id === updated.id ? updated : h));
      setEdit(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to save');
    }
  }

  // ── Archive / Unarchive ─────────────────────────────────────────────────

  async function toggleArchive(h: HabitResponse) {
    setActionError(null);
    const newStatus = h.status === 'active' ? 'archived' : 'active';
    try {
      const updated = await api.updateHabit(h.id, { status: newStatus });
      setHabits(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to update habit');
    }
  }

  // ── Add ─────────────────────────────────────────────────────────────────

  async function addHabit() {
    const name = newName.trim();
    if (!name) return;
    setActionError(null);
    try {
      const created = await api.createHabit({ name, colour: newColour });
      setHabits(prev => [created, ...prev]);
      setNewName('');
      setNewColour(DEFAULT_COLOUR);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to create habit');
    }
  }

  // ── Export ───────────────────────────────────────────────────────────────

  async function exportCsv() {
    try {
      const blob = await api.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'habit-tracker-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Export failed');
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) return <div className="screen-loading">Loading…</div>;
  if (error) return (
    <div className="screen-error">
      <p>{error}</p>
      <button onClick={() => void load()}>Retry</button>
    </div>
  );

  const active = habits.filter(h => h.status === 'active');
  const archived = habits.filter(h => h.status === 'archived');

  function renderRow(h: HabitResponse) {
    const isEditing = edit?.id === h.id;

    if (isEditing) {
      return (
        <div key={h.id} className="habit-row habit-row--editing">
          <input
            type="color"
            className="colour-picker"
            value={edit.colour}
            onChange={e => setEdit(prev => prev ? { ...prev, colour: e.target.value } : prev)}
          />
          <input
            type="text"
            className="habit-name-input"
            value={edit.name}
            onChange={e => setEdit(prev => prev ? { ...prev, name: e.target.value } : prev)}
            onKeyDown={e => { if (e.key === 'Enter') void saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
            autoFocus
          />
          <div className="row-actions">
            <button className="btn" onClick={() => void saveEdit()}>Save</button>
            <button className="btn-ghost" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      );
    }

    return (
      <div key={h.id} className={`habit-row${h.status === 'archived' ? ' habit-row--archived' : ''}`}>
        <span className="colour-swatch" style={{ background: h.colour }} />
        <span className="habit-row__name">{h.name}</span>
        <div className="row-actions">
          <button
            className="icon-btn"
            onClick={() => openEdit(h)}
            aria-label={`Edit ${h.name}`}
            title="Edit name and colour"
          >
            ✏
          </button>
          <button
            className={h.status === 'active' ? 'btn-danger' : 'btn-ghost'}
            onClick={() => void toggleArchive(h)}
          >
            {h.status === 'active' ? 'Archive' : 'Unarchive'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-screen">
      <h1 className="settings-title">Settings</h1>

      {actionError && <p className="action-error">{actionError}</p>}

      {/* ── Active habits ── */}
      <p className="section-heading">Habits</p>
      <div className="habit-list-section">
        {active.length === 0 && (
          <p className="settings-empty">No active habits yet.</p>
        )}
        {active.map(renderRow)}
      </div>

      {/* ── Add new habit ── */}
      <div className="add-form">
        <input
          type="color"
          className="colour-picker"
          value={newColour}
          onChange={e => setNewColour(e.target.value)}
          aria-label="New habit colour"
        />
        <input
          type="text"
          className="habit-name-input"
          placeholder="New habit name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') void addHabit(); }}
        />
        <button className="btn" onClick={() => void addHabit()} disabled={!newName.trim()}>
          Add
        </button>
      </div>

      {/* ── Archived habits ── */}
      {archived.length > 0 && (
        <>
          <p className="section-heading">Archived</p>
          <div className="habit-list-section">
            {archived.map(renderRow)}
          </div>
        </>
      )}

      {/* ── Data ── */}
      <p className="section-heading">Data</p>
      <button className="btn-ghost" onClick={() => void exportCsv()}>
        Export CSV
      </button>
    </div>
  );
}
