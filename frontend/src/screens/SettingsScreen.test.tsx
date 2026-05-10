import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SettingsScreen from './SettingsScreen';

vi.mock('../api/client', () => ({
  api: {
    listHabits: vi.fn(),
    createHabit: vi.fn(),
    updateHabit: vi.fn(),
    exportCsv: vi.fn(),
  },
}));

import { api } from '../api/client';

const HABITS = [
  { id: 1, name: 'Upper Body', colour: '#4A90D9', status: 'active'   as const, created_at: '', updated_at: '' },
  { id: 2, name: 'Cardio',     colour: '#F5A623', status: 'active'   as const, created_at: '', updated_at: '' },
  { id: 4, name: 'Mobility',   colour: '#9B59B6', status: 'archived' as const, created_at: '', updated_at: '' },
];

beforeEach(() => {
  vi.mocked(api.listHabits).mockResolvedValue(HABITS);
});

it('lists active and archived habits with correct controls', async () => {
  render(<SettingsScreen />);

  expect(await screen.findByText('Upper Body')).toBeInTheDocument();
  expect(screen.getByText('Cardio')).toBeInTheDocument();
  expect(screen.getByText('Mobility')).toBeInTheDocument();

  // Active habits have Archive buttons
  const archiveBtns = screen.getAllByText('Archive');
  expect(archiveBtns).toHaveLength(2);

  // Archived habit has Unarchive button
  expect(screen.getByText('Unarchive')).toBeInTheDocument();
});

it('pencil icon puts a row into edit mode', async () => {
  render(<SettingsScreen />);
  const editBtn = await screen.findByRole('button', { name: 'Edit Upper Body' });
  fireEvent.click(editBtn);

  // Name input pre-filled with habit name
  const input = screen.getByDisplayValue('Upper Body');
  expect(input).toBeInTheDocument();
  expect(screen.getByText('Save')).toBeInTheDocument();
  expect(screen.getByText('Cancel')).toBeInTheDocument();
});

it('archives an active habit via the Archive button', async () => {
  const updated = { ...HABITS[0], status: 'archived' as const };
  vi.mocked(api.updateHabit).mockResolvedValue(updated);

  render(<SettingsScreen />);
  const archiveBtns = await screen.findAllByText('Archive');
  fireEvent.click(archiveBtns[0]);

  await waitFor(() =>
    expect(api.updateHabit).toHaveBeenCalledWith(1, { status: 'archived' })
  );
});

it('adds a new habit via the Add form', async () => {
  const newHabit = { id: 5, name: 'HIIT', colour: '#4A90D9', status: 'active' as const, created_at: '', updated_at: '' };
  vi.mocked(api.createHabit).mockResolvedValue(newHabit);

  render(<SettingsScreen />);
  await screen.findByText('Upper Body');

  fireEvent.change(screen.getByPlaceholderText('New habit name'), { target: { value: 'HIIT' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));

  await waitFor(() =>
    expect(api.createHabit).toHaveBeenCalledWith({ name: 'HIIT', colour: expect.any(String) })
  );
});
