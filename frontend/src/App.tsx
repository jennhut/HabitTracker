import { useEffect, useState } from 'react';
import Nav from './Nav';
import CheckinScreen from './screens/CheckinScreen';
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import './App.css';

function useRoute(): string {
  const [route, setRoute] = useState(window.location.hash || '#/');
  useEffect(() => {
    const handler = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return route;
}

export default function App() {
  const route = useRoute();

  const screen =
    route === '#/dashboard' ? <DashboardScreen /> :
    route === '#/history'   ? <HistoryScreen /> :
    route === '#/settings'  ? <SettingsScreen /> :
                              <CheckinScreen />;

  return (
    <div className="app">
      <main className="app-main">{screen}</main>
      <Nav route={route} />
    </div>
  );
}
