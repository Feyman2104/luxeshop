import { useState } from 'react';
import { Link } from 'react-router-dom';
import './auth.css';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de correo inválido.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setModal(true);
  };

  const handleConfirm = () => {
    setModal(false);
    setSent(true);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">🛍️</span>
          <h1 className="brand-name">LUXE<span>SHOP</span></h1>
        </div>

        {!sent ? (
          <>
            <div className="auth-icon-header">🔐</div>
            <p className="auth-subtitle">Recuperar contraseña</p>
            <p className="auth-hint">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={error ? 'input-error' : ''}
                />
                {error && <span className="error-msg">{error}</span>}
              </div>

              <button type="submit" className="btn-primary">Enviar enlace</button>
            </form>
          </>
        ) : (
          <div className="success-state">
            <div className="success-icon">📧</div>
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
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">📤</span>
              <h3>Datos del formulario</h3>
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
