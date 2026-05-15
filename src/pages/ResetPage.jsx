import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../lib/firebase';
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

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
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

const ConfettiIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

export default function ResetPage() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.';
    if (!form.confirm) e.confirm = 'Confirma tu nueva contraseña.';
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
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!oobCode) {
      setAuthError('El enlace de restablecimiento no es válido. Solicita uno nuevo desde "Olvidé mi contraseña".');
      return;
    }
    setLoading(true);
    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, form.password);
      setDone(true);
    } catch (err) {
      switch (err.code) {
        case 'auth/expired-action-code':
          setAuthError('El enlace expiró. Solicita uno nuevo.');
          break;
        case 'auth/invalid-action-code':
          setAuthError('El enlace no es válido o ya fue usado.');
          break;
        case 'auth/weak-password':
          setAuthError('La contraseña es demasiado débil.');
          break;
        default:
          setAuthError('No se pudo restablecer la contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColor = ['', 'weak', 'medium', 'good', 'strong'];

  return (
    <div className="auth-bg">
      <div className="auth-card" role="main">
        <div className="auth-brand">
          <div className="brand-icon" aria-hidden="true">
            <DumbbellIcon />
          </div>
          <div className="brand-text">
            <h1 className="brand-name">Tu Mejor Versión <span>Shop</span></h1>
            <p className="brand-tagline">Suplementos &amp; Ropa Deportiva</p>
          </div>
        </div>

        {!done ? (
          <>
            <div className="auth-icon-header" aria-hidden="true"><KeyIcon /></div>
            <p className="auth-subtitle">Nueva contraseña</p>
            <p className="auth-hint">
              {oobCode ? 'Elige una contraseña segura para tu cuenta.' : 'Usa el enlace enviado a tu correo para restablecer tu contraseña.'}
            </p>

            {authError && (
              <div className="auth-error" role="alert">
                <WarningIcon />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate aria-label="Formulario de restablecimiento de contraseña">
              <div className="field-group">
                <label htmlFor="password">Nueva contraseña</label>
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

              {form.password && (
                <div className="password-strength" role="group" aria-label="Indicador de fortaleza">
                  <span>Fortaleza:</span>
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`bar ${strength() >= i ? strengthColor[strength()] : ''}`} />
                    ))}
                  </div>
                  <span className="strength-label">{strengthLabel[strength()]}</span>
                </div>
              )}

              <div className="field-group">
                <label htmlFor="confirm">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirm"
                  name="confirm"
                  placeholder="Repite la nueva contraseña"
                  value={form.confirm}
                  onChange={handleChange}
                  className={errors.confirm ? 'input-error' : ''}
                  autoComplete="new-password"
                  aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                />
                {errors.confirm && <span className="error-msg" id="confirm-error" role="alert"><WarningIcon />{errors.confirm}</span>}
                {form.confirm && form.confirm === form.password && (
                  <span className="success-inline"><CheckIcon /> Las contraseñas coinciden</span>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" aria-hidden="true" /> : null}
                {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>
          </>
        ) : (
          <div className="success-state">
            <div className="success-icon" aria-hidden="true"><ConfettiIcon /></div>
            <h3>¡Contraseña actualizada!</h3>
            <p>Tu contraseña ha sido restablecida correctamente.</p>
            <Link to="/login" className="btn-primary btn-block">Iniciar sesión</Link>
          </div>
        )}

        <p className="auth-footer">
          <Link to="/login" className="link-accent">← Volver al inicio de sesión</Link>
        </p>
      </div>

    </div>
  );
}