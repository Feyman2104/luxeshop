import { useState } from 'react';
import { Link } from 'react-router-dom';
import './auth.css';

const ShoppingBagIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de correo inválido.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModal(true);
    }, 600);
  };

  const handleConfirm = () => {
    setModal(false);
    setSent(true);
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

        {!sent ? (
          <>
            <div className="auth-icon-header" aria-hidden="true"><ShieldIcon /></div>
            <p className="auth-subtitle">Recuperar contraseña</p>
            <p className="auth-hint">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

            <form onSubmit={handleSubmit} noValidate aria-label="Formulario de recuperación de contraseña">
              <div className="field-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={error ? 'input-error' : ''}
                  autoComplete="email"
                  aria-describedby={error ? 'email-error' : undefined}
                />
                {error && <span className="error-msg" id="email-error" role="alert"><WarningIcon />{error}</span>}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" aria-hidden="true" /> : null}
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        ) : (
          <div className="success-state">
            <div className="success-icon" aria-hidden="true"><MailIcon /></div>
            <h3>¡Correo enviado!</h3>
            <p>Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones.</p>
            <Link to="/reset-password" className="btn-primary btn-block">Ir a restablecer</Link>
          </div>
        )}

        <p className="auth-footer">
          <Link to="/login" className="link-accent">← Volver al inicio de sesión</Link>
        </p>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" aria-hidden="true"><SendIcon /></div>
              <h3 id="modal-title">Datos del formulario</h3>
            </div>
            <div className="modal-body">
              <div className="modal-field"><span>Email:</span> <strong>{email}</strong></div>
              <div className="modal-field"><span>Acción:</span> <strong>Solicitud de recuperación</strong></div>
              <div className="modal-field"><span>Estado:</span> <strong>Enlace por enviar</strong></div>
            </div>
            <button className="btn-primary" onClick={handleConfirm}>Confirmar envío</button>
          </div>
        </div>
      )}
    </div>
  );
}