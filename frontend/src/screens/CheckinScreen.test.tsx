import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CheckinScreen from './CheckinScreen';

vi.mock('../api/client', () => ({
  api: {
    listHabits: vi.fn(),
    listCheckins: vi.fn(),
    createCheckin: vi.fn(),
    deleteCheckin: vi.fn(),
  },
}));

import { api } from '../api/client';

const HABITS = [
  { id: 1, name: 'Upper Body', colour: '#4A90D9', status: 'active' as const, created_at: '', updated_at: '' },
  { id: 2, name: 'Cardio',     colour: '#F5A623', status: 'active' as const, created_at: '', updated_at: '' },
];

const CHECKIN = {
  id: 10, date: '2026-05-10', habit_id: 1, note: null, created_at: '2026-05-10T07:00:00',
};

beforeEach(() => {
  vi.mocked(api.listHabits).mockResolvedValue(HABITS);
  vi.mocked(api.listCheckins).mockResolvedValue([]);
});

it('renders active habit buttons after loading', async () => {
  render(<CheckinScreen />);
  expect(await screen.findByText('Upper Body')).toBeInTheDocument();
  expect(screen.getByText('Cardio')).toBeInTheDocument();
});

it('first tap opens note field; second tap logs with no note', async () => {
  vi.mocked(api.createCheckin).mockResolvedValue(CHECKIN);
  render(<CheckinScreen />);
  const btn = await screen.findByText('Upper Body');

  // First tap → note field appears
  fireEvent.click(btn);
  expect(await screen.findByPlaceholderText('Note (optional)')).toBeInTheDocument();

  // Second tap on same button → submits with no note
  fireEvent.click(btn);
  await waitFor(() => expect(api.createCheckin).toHaveBeenCalledWith({
    date: expect.any(String),
    habit_id: 1,
    note: null,
  }));
});

it('shows checkmark and allows undo on a logged habit', async () => {
  vi.mocked(api.listCheckins).mockResolvedValue([CHECKIN]);
  vi.mocked(api.deleteCheckin).mockResolvedValue(undefined);
  render(<CheckinScreen />);

  // Logged habit shows checkmark
  const btn = await screen.findByRole('button', { name: /✓.*Upper Body/i });
  expect(btn).toBeInTheDocument();

  // Clicking deletes it
  fireEvent.click(btn);
  await waitFor(() => expect(api.deleteCheckin).toHaveBeenCalledWith(CHECKIN.id));
});
