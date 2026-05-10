import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import HistoryScreen from './HistoryScreen';

vi.mock('../api/client', () => ({
  api: {
    listCheckins: vi.fn(),
    listHabits: vi.fn(),
  },
}));

import { api } from '../api/client';

const HABITS = [
  { id: 1, name: 'Upper Body', colour: '#4A90D9', status: 'active' as const, created_at: '', updated_at: '' },
];

const CHECKIN = {
  id: 1, date: '2026-05-04', habit_id: 1, note: 'Good session', created_at: '2026-05-04T07:00:00',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.listHabits).mockResolvedValue(HABITS);
  vi.mocked(api.listCheckins).mockResolvedValue([CHECKIN]);
});

it('renders Prev and Next navigation buttons', async () => {
  render(<HistoryScreen />);
  expect(await screen.findByText('← Prev')).toBeInTheDocument();
  expect(screen.getByText('Next →')).toBeInTheDocument();
});

it('Next button is disabled on the current block', async () => {
  render(<HistoryScreen />);
  const next = await screen.findByText('Next →');
  expect(next).toBeDisabled();
});

it('clicking Prev fetches the previous block', async () => {
  render(<HistoryScreen />);
  const prev = await screen.findByText('← Prev');
  fireEvent.click(prev);
  // listCheckins should be called again with earlier dates
  await screen.findByText('← Prev'); // wait for re-render
  expect(vi.mocked(api.listCheckins)).toHaveBeenCalledTimes(2);
});
