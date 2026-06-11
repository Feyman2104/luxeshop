import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { formatDuration } from '../lib/sessions';
import EditPhotoModal from '../components/EditPhotoModal';
import './dashboard.css';

/* ── Icons ─────────────────────────────────────────────── */
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

const BoxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ── Helpers ────────────────────────────────────────────── */
const METHOD_META = {
  google:   { label: 'Google',     cls: 'badge-google'   },
  facebook: { label: 'Facebook',   cls: 'badge-facebook' },
  github:   { label: 'GitHub',     cls: 'badge-github'   },
  password: { label: 'Email',      cls: 'badge-email'    },
};

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};

const getInitials = (name, email) =>
  (name || email || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

const providerLabel = (pid) => {
  if (!pid) return 'Email';
  if (pid.includes('google'))   return 'Google';
  if (pid.includes('facebook')) return 'Facebook';
  if (pid.includes('github'))   return 'GitHub';
  return 'Email';
};

const providerMethod = (pid) => {
  if (!pid) return 'password';
  if (pid.includes('google'))   return 'google';
  if (pid.includes('facebook')) return 'facebook';
  if (pid.includes('github'))   return 'github';
  return 'password';
};

/* ── Session Card ───────────────────────────────────────── */
function SessionCard({ session }) {
  const meta = METHOD_META[session.method] || METHOD_META.password;
  const isActive = session.status === 'active';

  return (
    <article className="session-card">
      <div className="session-card-header">
        <div className="session-card-user">
          {session.photoURL ? (
            <img src={session.photoURL} alt="" className="session-card-avatar" referrerPolicy="no-referrer" />
          ) : (
            <div className="session-card-avatar session-card-avatar--fallback">
              {getInitials(session.displayName, session.email)}
            </div>
          )}
          <div>
            <p className="session-card-name">{session.displayName || '—'}</p>
            <p className="session-card-email">{session.email || '—'}</p>
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
        <span className="session-meta-item">
          <LoginIcon />
          {formatDate(session.loginAt)}
        </span>
        <span className="session-meta-item">
          <ClockIcon />
          {formatDuration(session.durationMs)}
        </span>
      </div>
    </article>
  );
}

/* ── Main Component ─────────────────────────────────────── */
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

export default function DashboardPage() {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('loginAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/login');
  };

  const filtered = sessions.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.displayName || '').toLowerCase().includes(q) ||
      (s.email       || '').toLowerCase().includes(q) ||
      (s.method      || '').toLowerCase().includes(q)
    );
  });

  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const pid = user?.providerData?.[0]?.providerId;
  const method = providerMethod(pid);
  const methodMeta = METHOD_META[method] || METHOD_META.password;

  return (
    <div className="db-root">
      {/* ── Left panel: user profile ────────────────────── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-inner">

          {/* Avatar */}
          <div className="db-avatar-wrap">
            <button
              type="button"
              className="db-avatar-ring db-avatar-ring--button"
              onClick={() => setEditingPhoto(true)}
              aria-label="Cambiar foto de perfil"
              title="Cambiar foto de perfil"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="db-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="db-avatar db-avatar--fallback">
                  {getInitials(user?.displayName, user?.email)}
                </div>
              )}
              <span className="db-avatar-edit-overlay" aria-hidden="true">
                <CameraIcon />
              </span>
            </button>
            <div className={`db-online-dot ${activeSessions > 0 ? 'db-online-dot--active' : ''}`} aria-hidden="true" />
          </div>

          {/* Info */}
          <div className="db-user-info">
            <h2 className="db-user-name">{user?.displayName || 'Usuario'}</h2>
            <p className="db-user-email">{user?.email || '—'}</p>
            <span className={`badge ${methodMeta.cls} db-method-badge`}>{providerLabel(pid)}</span>
          </div>

          {/* Stats */}
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

          {/* Módulos */}
          <nav className="db-nav" aria-label="Módulos de la aplicación">
            <p className="db-nav-title">Módulos</p>
            <Link to="/productos" className="db-nav-link">
              <BoxIcon />
              <span>
                <strong>Productos</strong>
                <small>Suplementos y ropa deportiva</small>
              </span>
            </Link>
            <Link to="/categorias" className="db-nav-link">
              <TagIcon />
              <span>
                <strong>Categorías</strong>
                <small>Organización del catálogo</small>
              </span>
            </Link>
            <Link to="/auditoria" className="db-nav-link">
              <ShieldIcon />
              <span>
                <strong>Auditoría</strong>
                <small>Sesiones, filtros y reporte PDF</small>
              </span>
            </Link>
          </nav>

          <div className="db-sidebar-divider" />

          {/* Actions */}
          <button
            className="db-btn-logout"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Cerrar sesión"
          >
            <LogoutIcon />
            <span>{signingOut ? 'Cerrando...' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>

      {/* ── Right panel: sessions ───────────────────────── */}
      <main className="db-main">
        <header className="db-main-header">
          <div>
            <h1 className="db-main-title">Registro de Sesiones</h1>
            <p className="db-main-subtitle">Actividad en tiempo real de todos los usuarios</p>
          </div>
          <div className="db-search-wrap">
            <span className="db-search-icon" aria-hidden="true"><SearchIcon /></span>
            <input
              className="db-search"
              type="search"
              placeholder="Buscar por nombre, correo o método..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Buscar sesiones"
            />
            {filtered.length > 0 && (
              <span className="db-search-count">{filtered.length}</span>
            )}
          </div>
        </header>

        <div className="db-cards-area">
          {loading ? (
            <div className="db-state-msg">
              <div className="db-spinner" aria-label="Cargando" />
              <p>Cargando sesiones...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="db-state-msg">
              <p className="db-empty-icon">◎</p>
              <p>{search ? 'Sin resultados para tu búsqueda.' : 'Aún no hay sesiones registradas.'}</p>
              {!search && <p className="db-empty-hint">Inicia sesión para ver el registro aquí.</p>}
            </div>
          ) : (
            <div className="db-cards-grid">
              {filtered.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          )}
        </div>
      </main>

      <EditPhotoModal
        open={editingPhoto}
        onClose={() => setEditingPhoto(false)}
        user={user}
        refreshUser={refreshUser}
      />
    </div>
  );
}
