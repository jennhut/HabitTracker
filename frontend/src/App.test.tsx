import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

vi.mock('./screens/CheckinScreen', () => ({ default: () => <div>CheckinScreen</div> }));
vi.mock('./screens/DashboardScreen', () => ({ default: () => <div>DashboardScreen</div> }));
vi.mock('./screens/HistoryScreen', () => ({ default: () => <div>HistoryScreen</div> }));
vi.mock('./screens/SettingsScreen', () => ({ default: () => <div>SettingsScreen</div> }));

it('renders the check-in screen by default', () => {
  window.location.hash = '#/';
  render(<App />);
  expect(screen.getByText('CheckinScreen')).toBeInTheDocument();
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
