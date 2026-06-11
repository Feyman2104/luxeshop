import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDuration } from '../lib/sessions';
import { exportSessionsPdf } from '../lib/sessionsPdf';
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
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (s.displayName || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.method || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (methodFilter && s.method !== methodFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;

    if (fromDate || toDate) {
      const login = s.loginAt?.toDate ? s.loginAt.toDate() : (s.loginAt ? new Date(s.loginAt) : null);
      if (!login) return false;
      if (fromDate && login < new Date(`${fromDate}T00:00:00`)) return false;
      if (toDate && login > new Date(`${toDate}T23:59:59.999`)) return false;
    }
    return true;
  });

  const hasFilters = search || methodFilter || statusFilter || fromDate || toDate;

  const clearFilters = () => {
    setSearch('');
    setMethodFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
  };

  const handleExportPdf = () => {
    exportSessionsPdf(filtered, {
      search: search.trim(),
      method: methodFilter,
      status: statusFilter,
      from: fromDate,
      to: toDate,
    });
  };

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

        <div className="sessions-filters" role="group" aria-label="Filtros de auditoría">
          <div className="filter-field">
            <label htmlFor="filter-method">Método</label>
            <select id="filter-method" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="password">Email/Pass</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="github">GitHub</option>
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="filter-status">Estado</label>
            <select id="filter-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="active">Activa</option>
              <option value="finalized">Finalizada</option>
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="filter-from">Desde</label>
            <input type="date" id="filter-from" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="filter-field">
            <label htmlFor="filter-to">Hasta</label>
            <input type="date" id="filter-to" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="filter-actions">
            {hasFilters && (
              <button type="button" className="btn-clear-filters" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
            <button
              type="button"
              className="btn-export-pdf"
              onClick={handleExportPdf}
              disabled={filtered.length === 0}
              aria-label="Exportar registros filtrados a PDF"
            >
              ⬇ Exportar PDF
            </button>
          </div>
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
