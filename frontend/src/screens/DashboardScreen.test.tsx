import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardScreen from './DashboardScreen';

vi.mock('../api/client', () => ({
  api: {
    getDashboard: vi.fn(),
  },
}));

import { api } from '../api/client';

const STATS = {
  current_streak: 4,
  best_streak: 4,
  this_week_count: 5,
  this_week_target: 6,
  completion_rate: 1.0,
};

it('renders all four stat cards with correct values', async () => {
  vi.mocked(api.getDashboard).mockResolvedValue(STATS);
  render(<DashboardScreen />);

  // Both streak cards show "4" — assert there are exactly two
  const streakValues = await screen.findAllByText('4', { selector: '.stat-value' });
  expect(streakValues).toHaveLength(2);
  expect(screen.getByText('Current streak')).toBeInTheDocument();
  expect(screen.getByText('Best streak')).toBeInTheDocument();
  expect(screen.getByText('This week')).toBeInTheDocument();
  expect(screen.getByText('Completion rate')).toBeInTheDocument();
  expect(screen.getByText('100%')).toBeInTheDocument();
});

it('shows an error and retry button when the request fails', async () => {
  vi.mocked(api.getDashboard).mockRejectedValue(new Error('Network error'));
  render(<DashboardScreen />);

  expect(await screen.findByText('Network error')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
});
