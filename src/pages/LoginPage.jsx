import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const ShoppingBagIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithProvider, error, clearError } = useSocialAuth();
  const { loading } = useAuth();
  const [socialLoading, setSocialLoading] = useState(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de correo inválido.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres.';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModal(true);
    }, 600);
  };

  const handleSocialSignIn = async (providerId) => {
    clearError();
    setSocialLoading(providerId);
    try {
      await signInWithProvider(providerId);
    } catch (err) {
      console.error(`${providerId} sign-in failed:`, err.message);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" role="main">
        <div className="auth-brand">
          <div className="brand-icon" aria-hidden="true">
            <ShoppingBagIcon />
          </div>
          <h1 className="brand-name">LUXE<span>SHOP</span></h1>
        </div>
        <p className="auth-subtitle">Bienvenido de vuelta</p>

        {error && (
          <div className="auth-error" role="alert">
            <WarningIcon />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label="Formulario de inicio de sesión">
          <div className="field-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <span className="error-msg" id="email-error" role="alert"><WarningIcon />{errors.email}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              autoComplete="current-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && <span className="error-msg" id="password-error" role="alert"><WarningIcon />{errors.password}</span>}
          </div>

          <div className="field-row">
            <Link to="/forgot-password" className="link-subtle">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || socialLoading !== null}>
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-divider" aria-hidden="true">
          <span>O</span>
        </div>

        <div className="social-buttons" role="group" aria-label="Iniciar sesión con redes sociales">
          <button
            type="button"
            className="btn-social btn-social-google"
            onClick={() => handleSocialSignIn('google')}
            disabled={loading || socialLoading !== null}
            aria-label="Iniciar sesión con Google"
          >
            {socialLoading === 'google' ? <span className="spinner" /> : <span className="btn-social-icon" aria-hidden="true"><GoogleIcon /></span>}
          </button>

          <button
            type="button"
            className="btn-social btn-social-facebook"
            onClick={() => handleSocialSignIn('facebook')}
            disabled={loading || socialLoading !== null}
            aria-label="Iniciar sesión con Facebook"
          >
            {socialLoading === 'facebook' ? <span className="spinner" /> : <span className="btn-social-icon" aria-hidden="true"><FacebookIcon /></span>}
          </button>

          <button
            type="button"
            className="btn-social btn-social-github"
            onClick={() => handleSocialSignIn('github')}
            disabled={loading || socialLoading !== null}
            aria-label="Iniciar sesión con GitHub"
          >
            {socialLoading === 'github' ? <span className="spinner" /> : <span className="btn-social-icon" aria-hidden="true"><GitHubIcon /></span>}
          </button>
        </div>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register" className="link-accent">Regístrate</Link>
        </p>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" aria-hidden="true"><CheckIcon /></div>
              <h3 id="modal-title">Datos del formulario</h3>
            </div>
            <div className="modal-body">
              <div className="modal-field"><span>Email:</span> <strong>{form.email}</strong></div>
              <div className="modal-field"><span>Contraseña:</span> <strong>{'•'.repeat(form.password.length)}</strong></div>
              <div className="modal-field"><span>Acción:</span> <strong>Inicio de sesión</strong></div>
            </div>
            <button className="btn-primary" onClick={() => { setModal(false); navigate('/login'); }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}