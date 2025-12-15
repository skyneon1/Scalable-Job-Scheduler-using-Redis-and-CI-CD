import { useEffect, useState, useRef } from 'react';
import JobForm from './components/JobForm';
import Stats from './components/Stats';
import JobList from './components/JobList';
import Navbar from './components/Navbar';
import Documentation from './pages/Docs';
import type { JobStats } from './types';
import './index.css';

function App() {
  const [page, setPage] = useState<'dashboard' | 'docs'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [stats, setStats] = useState<JobStats | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Apply theme to root
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Determine API Base URL (Relative for Vercel/Proxy, Absolute if env var set)
  const API_URL = import.meta.env.VITE_API_URL || "";

  // Determine WebSocket URL automatically based on window location if relative
  const getWsUrl = () => {
    if (API_URL.startsWith('http')) {
      return API_URL.replace(/^http/, 'ws');
    }
    // Relative path strategy for Vercel/Local Proxy
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    return `${protocol}${window.location.host}`;
  };

  const fetchStats = async () => {
    try {
      // Use relative path locally (via proxy) and on Vercel
      const res = await fetch(`${API_URL}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Polling backup

    // WebSocket
    const wsUrl = `${getWsUrl()}/api/ws`;
    console.log("Connecting WS:", wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => console.log("WS Connected");
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents(prev => [data, ...prev].slice(0, 50)); // Keep last 50
      fetchStats(); // Refresh stats on event
    };

    return () => {
      clearInterval(interval);
      ws.current?.close();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onNav={setPage} currentPage={page} theme={theme} toggleTheme={toggleTheme} />

      <div className="container" style={{ flex: 1 }}>
        {page === 'docs' ? (
          <Documentation />
        ) : (
          <>
            <div className="grid grid-cols-2">
              <div>
                <JobForm />
              </div>

              <div>
                <Stats stats={stats} />

                <div className="card" style={{ marginTop: '2rem' }}>
                  <h3>System Health</h3>
                  <p>Workers: <strong style={{ color: 'var(--success)' }}>Active</strong></p>
                  <p>Redis: <strong style={{ color: 'var(--success)' }}>Connected</strong></p>
                  <p>MongoDB: <strong style={{ color: 'var(--success)' }}>Connected</strong></p>
                </div>
              </div>
            </div>

            <JobList events={events} />

            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>Log Stream</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace' }}>
                {events.map((ev, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.2rem' }}>
                    <span style={{ marginRight: '10px', color: 'var(--text-secondary)' }}>[{new Date().toLocaleTimeString()}]</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{ev.job_id.substring(0, 8)}</span>
                    {' '}moved to{' '}
                    <strong className={`status-${ev.status}`}>{ev.status?.toUpperCase()}</strong>
                    {ev.msg && <span style={{ marginLeft: '10px', color: 'gray' }}>- {ev.msg}</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
