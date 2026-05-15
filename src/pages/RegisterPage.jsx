import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { startSession } from '../lib/sessions';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const DumbbellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor"/>
    <rect x="5" y="8"  width="3" height="8" rx="1" fill="currentColor"/>
    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
    <rect x="16" y="8"  width="3" height="8" rx="1" fill="currentColor"/>
    <rect x="19" y="10" width="3" height="4" rx="1" fill="currentColor"/>
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

const mapRegisterError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'Ese correo ya está registrado.';
    case 'auth/invalid-email':        return 'Formato de correo inválido.';
    case 'auth/weak-password':        return 'La contraseña es demasiado débil.';
    case 'auth/operation-not-allowed': return 'El registro con email/contraseña está deshabilitado. Habilítalo en Firebase Console → Authentication → Sign-in method → Email/Password.';
    case 'auth/network-request-failed': return 'Error de red. Revisa tu conexión.';
    default: return 'No se pudo completar el registro. Inténtalo de nuevo.';
  }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signInWithProvider, error: socialError, clearError } = useSocialAuth();
  const { loading, user } = useAuth();
  const [socialLoading, setSocialLoading] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);

  const error = authError || socialError;

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!form.email) e.email = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de correo inválido.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.';
    if (!form.confirm) e.confirm = 'Confirma tu contraseña.';
    else if (form.confirm !== form.password) e.confirm = 'Las contraseñas no coinciden.';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    clearError();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name.trim() });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:       cred.user.uid,
        name:      form.name.trim(),
        email:     form.email,
        createdAt: serverTimestamp(),
      });
      try {
        await startSession(cred.user, 'password');
      } catch (sessionErr) {
        setAuthError(sessionErr.message);
      }
      setModal(true);
    } catch (err) {
      setAuthError(mapRegisterError(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialSignIn = async (providerId) => {
    setAuthError('');
    clearError();
    setSocialLoading(providerId);
    try {
      const u = await signInWithProvider(providerId);
      try {
        await startSession(u, providerId);
      } catch (sessionErr) {
        setAuthError(sessionErr.message);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(`${providerId} sign-in failed:`, err.message);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card auth-card-wide" role="main">
        <div className="auth-brand">
          <div className="brand-icon" aria-hidden="true">
            <DumbbellIcon />
          </div>
          <div className="brand-text">
            <h1 className="brand-name">Tu Mejor Versión <span>Shop</span></h1>
            <p className="brand-tagline">Suplementos &amp; Ropa Deportiva</p>
          </div>
        </div>
        <p className="auth-subtitle">Crea tu cuenta</p>

        {error && (
          <div className="auth-error" role="alert">
            <WarningIcon />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label="Formulario de registro">
          <div className="field-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              autoComplete="name"
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <span className="error-msg" id="name-error" role="alert"><WarningIcon />{errors.name}</span>}
          </div>

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

          <div className="fields-row">
            <div className="field-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                autoComplete="new-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && <span className="error-msg" id="password-error" role="alert"><WarningIcon />{errors.password}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="confirm">Confirmar contraseña</label>
              <input
                type="password"
                id="confirm"
                name="confirm"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={handleChange}
                className={errors.confirm ? 'input-error' : ''}
                autoComplete="new-password"
                aria-describedby={errors.confirm ? 'confirm-error' : undefined}
              />
              {errors.confirm && <span className="error-msg" id="confirm-error" role="alert"><WarningIcon />{errors.confirm}</span>}
            </div>
          </div>

          <div className="password-strength">
            {form.password && (
              <>
                <span>Fortaleza:</span>
                <div className="strength-bars" role="group" aria-label="Indicador de fortaleza">
                  <div className={`bar ${form.password.length >= 1 ? 'weak' : ''}`} />
                  <div className={`bar ${form.password.length >= 6 ? 'medium' : ''}`} />
                  <div className={`bar ${form.password.length >= 10 ? 'strong' : ''}`} />
                </div>
                <span className="strength-label">
                  {form.password.length < 6 ? 'Débil' : form.password.length < 10 ? 'Media' : 'Fuerte'}
                </span>
              </>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting || loading || socialLoading !== null}>
            {submitting ? <span className="spinner" aria-hidden="true" /> : null}
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-divider" aria-hidden="true">
          <span>O</span>
        </div>

        <div className="social-buttons" role="group" aria-label="Registrarse con redes sociales">
          <button
            type="button"
            className="btn-social btn-social-google"
            onClick={() => handleSocialSignIn('google')}
            disabled={loading || socialLoading !== null}
            aria-label="Registrarse con Google"
          >
            {socialLoading === 'google' ? <span className="spinner" /> : <span className="btn-social-icon" aria-hidden="true"><GoogleIcon /></span>}
            <span className="btn-social-label">Continuar con Google</span>
          </button>

          <button
            type="button"
            className="btn-social btn-social-facebook"
            onClick={() => handleSocialSignIn('facebook')}
            disabled={loading || socialLoading !== null}
            aria-label="Registrarse con Facebook"
          >
            {socialLoading === 'facebook' ? <span className="spinner" /> : <span className="btn-social-icon" aria-hidden="true"><FacebookIcon /></span>}
            <span className="btn-social-label">Continuar con Facebook</span>
          </button>

          <button
            type="button"
            className="btn-social btn-social-github"
            onClick={() => handleSocialSignIn('github')}
            disabled={loading || socialLoading !== null}
            aria-label="Registrarse con GitHub"
          >
            {socialLoading === 'github' ? <span className="spinner" /> : <span className="btn-social-icon" aria-hidden="true"><GitHubIcon /></span>}
            <span className="btn-social-label">Continuar con GitHub</span>
          </button>
        </div>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="link-accent">Inicia sesión</Link>
        </p>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" aria-hidden="true"><CheckIcon /></div>
              <h3 id="modal-title">¡Cuenta creada!</h3>
            </div>
            <div className="modal-body">
              <div className="modal-field"><span>Nombre:</span> <strong>{form.name}</strong></div>
              <div className="modal-field"><span>Email:</span> <strong>{form.email}</strong></div>
              <div className="modal-field"><span>Guardado en:</span> <strong>Firebase Auth + Firestore</strong></div>
            </div>
            <button className="btn-primary" onClick={() => { setModal(false); navigate('/dashboard', { replace: true }); }}>Ir al dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}