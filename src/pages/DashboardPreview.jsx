// Archivo temporal para captura — eliminar después del screenshot
import { useState } from 'react';
import { formatDuration } from '../lib/sessions';
import './dashboard.css';

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const LoginIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const METHOD_META = {
  google:   { label: 'Google',   cls: 'badge-google'   },
  facebook: { label: 'Facebook', cls: 'badge-facebook' },
  github:   { label: 'GitHub',   cls: 'badge-github'   },
  password: { label: 'Email',    cls: 'badge-email'    },
};

const MOCK_SESSIONS = [
  { id:'1', displayName:'Feyman Joya', email:'feyman@gmail.com',   photoURL:'', method:'password', loginAt:{ toDate:()=>new Date('2026-05-14T10:30:00') }, logoutAt:{ toDate:()=>new Date('2026-05-14T11:15:00') }, durationMs:2700000, status:'finalized' },
  { id:'2', displayName:'Maria García',email:'maria@gmail.com',    photoURL:'', method:'google',   loginAt:{ toDate:()=>new Date('2026-05-14T12:00:00') }, logoutAt:null, durationMs:null, status:'active' },
  { id:'3', displayName:'Carlos Ruiz', email:'carlos@outlook.com', photoURL:'', method:'github',   loginAt:{ toDate:()=>new Date('2026-05-14T09:00:00') }, logoutAt:{ toDate:()=>new Date('2026-05-14T09:45:00') }, durationMs:2700000, status:'finalized' },
  { id:'4', displayName:'Ana López',   email:'ana@hotmail.com',    photoURL:'', method:'facebook', loginAt:{ toDate:()=>new Date('2026-05-14T13:20:00') }, logoutAt:null, durationMs:null, status:'active' },
  { id:'5', displayName:'Luis Torres', email:'luis@yahoo.com',     photoURL:'', method:'password', loginAt:{ toDate:()=>new Date('2026-05-14T08:00:00') }, logoutAt:{ toDate:()=>new Date('2026-05-14T08:30:00') }, durationMs:1800000, status:'finalized' },
  { id:'6', displayName:'Sofía Mora',  email:'sofia@gmail.com',    photoURL:'', method:'google',   loginAt:{ toDate:()=>new Date('2026-05-14T14:00:00') }, logoutAt:null, durationMs:null, status:'active' },
];

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};
const getInitials = (name, email) =>
  (name || email || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

function SessionCard({ session }) {
  const meta = METHOD_META[session.method] || METHOD_META.password;
  const isActive = session.status === 'active';
  return (
    <article className="session-card">
      <div className="session-card-header">
        <div className="session-card-user">
          <div className="session-card-avatar session-card-avatar--fallback">
            {getInitials(session.displayName, session.email)}
          </div>
          <div>
            <p className="session-card-name">{session.displayName}</p>
            <p className="session-card-email">{session.email}</p>
          </div>
        </div>
        <div className="session-card-badges">
          <span className={`badge ${meta.cls}`}>{meta.label}</span>
          <span className={`badge ${isActive ? 'badge-active' : 'badge-done'}`}>
            {isActive ? '● Activa' : 'Finalizada'}
          </span>
        </div>
      </div>
      <div className="session-card-meta">
        <span className="session-meta-item"><LoginIcon />{formatDate(session.loginAt)}</span>
        <span className="session-meta-item"><ClockIcon />{formatDuration(session.durationMs)}</span>
      </div>
    </article>
  );
}

export default function DashboardPreview() {
  const [search, setSearch] = useState('');
  const sessions = MOCK_SESSIONS;
  const filtered = sessions.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (s.displayName||'').toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q) || (s.method||'').toLowerCase().includes(q);
  });
  const activeSessions = sessions.filter(s => s.status === 'active').length;

  return (
    <div className="db-root">
      <aside className="db-sidebar">
        <div className="db-sidebar-inner">
          <div className="db-avatar-wrap" style={{marginBottom:'20px'}}>
            <div className="db-avatar-ring db-avatar-ring--button">
              <div className="db-avatar db-avatar--fallback">FJ</div>
              <span className="db-avatar-edit-overlay" aria-hidden="true">
                <CameraIcon />
              </span>
            </div>
            <div className="db-online-dot db-online-dot--active" />
          </div>
          <div className="db-user-info">
            <h2 className="db-user-name">Feyman Joya</h2>
            <p className="db-user-email">feyman@gmail.com</p>
            <span className="badge badge-email db-method-badge">Email</span>
          </div>
          <div className="db-stats">
            <div className="db-stat">
              <span className="db-stat-icon"><UserIcon /></span>
              <div>
                <p className="db-stat-value">{sessions.length}</p>
                <p className="db-stat-label">Sesiones totales</p>
              </div>
            </div>
            <div className="db-stat">
              <span className="db-stat-icon db-stat-icon--active"><ZapIcon /></span>
              <div>
                <p className="db-stat-value">{activeSessions}</p>
                <p className="db-stat-label">Activas ahora</p>
              </div>
            </div>
          </div>
          <div className="db-sidebar-divider" />
          <button className="db-btn-logout">
            <LogoutIcon /><span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <main className="db-main">
        <header className="db-main-header">
          <div>
            <h1 className="db-main-title">Registro de Sesiones</h1>
            <p className="db-main-subtitle">Actividad en tiempo real de todos los usuarios</p>
          </div>
          <div className="db-search-wrap">
            <span className="db-search-icon"><SearchIcon /></span>
            <input className="db-search" type="search" placeholder="Buscar por nombre, correo o método..." value={search} onChange={e => setSearch(e.target.value)} />
            {filtered.length > 0 && <span className="db-search-count">{filtered.length}</span>}
          </div>
        </header>
        <div className="db-cards-area">
          <div className="db-cards-grid">
            {filtered.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
      </main>
    </div>
  );
}
