import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDuration } from '../lib/sessions';
import './sessions.css';

const METHOD_LABELS = {
  google:   'Google',
  facebook: 'Facebook',
  github:   'GitHub',
  password: 'Email/Pass',
};

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('loginAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('sessions snapshot error:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = sessions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.displayName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.method || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="sessions-bg">
      <div className="sessions-container">
        <div className="sessions-header">
          <h1>Registro de Sesiones</h1>
          <Link to="/dashboard" className="btn-back">← Dashboard</Link>
        </div>

        <div className="sessions-search">
          <input
            type="search"
            placeholder="Buscar por nombre, correo o método..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar sesiones"
          />
          <span className="sessions-count">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="sessions-loading">Cargando sesiones...</div>
        ) : filtered.length === 0 ? (
          <div className="sessions-empty">
            {search ? 'Sin resultados para tu búsqueda.' : 'Aún no hay sesiones registradas.'}
          </div>
        ) : (
          <div className="sessions-table-wrapper">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Método</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Duración</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="td-name">
                      {s.photoURL && (
                        <img src={s.photoURL} alt="" className="session-avatar" referrerPolicy="no-referrer" />
                      )}
                      <span>{s.displayName || '—'}</span>
                    </td>
                    <td>{s.email || '—'}</td>
                    <td>
                      <span className={`badge badge-method badge-${s.method}`}>
                        {METHOD_LABELS[s.method] || s.method}
                      </span>
                    </td>
                    <td>{formatDate(s.loginAt)}</td>
                    <td>{formatDate(s.logoutAt)}</td>
                    <td>{formatDuration(s.durationMs)}</td>
                    <td>
                      <span className={`badge badge-status badge-${s.status}`}>
                        {s.status === 'active' ? 'Activa' : 'Finalizada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
