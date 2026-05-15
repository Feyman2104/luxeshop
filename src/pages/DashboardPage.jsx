import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';
import './dashboard.css';

const DumbbellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor"/>
    <rect x="5" y="8"  width="3" height="8" rx="1" fill="currentColor"/>
    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
    <rect x="16" y="8"  width="3" height="8" rx="1" fill="currentColor"/>
    <rect x="19" y="10" width="3" height="4" rx="1" fill="currentColor"/>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const providerLabel = (providerId) => {
  if (!providerId) return 'desconocido';
  if (providerId.includes('google'))   return 'Google';
  if (providerId.includes('facebook')) return 'Facebook';
  if (providerId.includes('github'))   return 'GitHub';
  return providerId;
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = (user?.displayName ?? user?.email ?? 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="auth-bg">
      <div className="auth-card dashboard-card" role="main">
        <div className="auth-brand">
          <div className="brand-icon" aria-hidden="true"><DumbbellIcon /></div>
          <div className="brand-text">
            <h1 className="brand-name">Tu Mejor Versión <span>Shop</span></h1>
            <p className="brand-tagline">Suplementos &amp; Ropa Deportiva</p>
          </div>
        </div>

        <p className="auth-subtitle">¡Bienvenido!</p>

        <div className="user-profile">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="user-avatar" referrerPolicy="no-referrer" />
          ) : (
            <div className="user-avatar user-avatar-fallback">{initials}</div>
          )}
          <div className="user-info">
            <p className="user-name">{user?.displayName ?? 'Usuario'}</p>
            <p className="user-email">{user?.email ?? '—'}</p>
            <p className="user-provider">
              Sesión vía <strong>{providerLabel(user?.providerData?.[0]?.providerId)}</strong>
            </p>
          </div>
        </div>

        <Link to="/sessions" className="btn-secondary">
          <span>Ver registro de sesiones</span>
        </Link>

        <button className="btn-primary" onClick={handleSignOut}>
          <LogoutIcon />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
