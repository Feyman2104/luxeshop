import { useState } from 'react';
import { Link } from 'react-router-dom';
import './auth.css';

export default function ResetPage() {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [done, setDone] = useState(false);

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
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setModal(true);
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
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">🛍️</span>
          <h1 className="brand-name">LUXE<span>SHOP</span></h1>
        </div>

        {!done ? (
          <>
            <div className="auth-icon-header">🔑</div>
            <p className="auth-subtitle">Nueva contraseña</p>
            <p className="auth-hint">Elige una contraseña segura para tu cuenta.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                />
                {errors.password && <span className="error-msg">{errors.password}</span>}
              </div>

              {form.password && (
                <div className="password-strength">
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
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  name="confirm"
                  placeholder="Repite la nueva contraseña"
                  value={form.confirm}
                  onChange={handleChange}
                  className={errors.confirm ? 'input-error' : ''}
                />
                {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
                {form.confirm && form.confirm === form.password && (
                  <span className="success-inline">✓ Las contraseñas coinciden</span>
                )}
              </div>

              <button type="submit" className="btn-primary">Restablecer contraseña</button>
            </form>
          </>
        ) : (
          <div className="success-state">
            <div className="success-icon">🎊</div>
            <h3>¡Contraseña actualizada!</h3>
            <p>Tu contraseña ha sido restablecida correctamente.</p>
            <Link to="/login" className="btn-primary btn-block">Iniciar sesión</Link>
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
              <span className="modal-icon">🔒</span>
              <h3>Datos del formulario</h3>
            </div>
            <div className="modal-body">
              <div className="modal-field"><span>Nueva contraseña:</span> <strong>{'•'.repeat(form.password.length)} ({form.password.length} chars)</strong></div>
              <div className="modal-field"><span>Fortaleza:</span> <strong>{strengthLabel[strength()]}</strong></div>
              <div className="modal-field"><span>Acción:</span> <strong>Restablecimiento de contraseña</strong></div>
            </div>
            <button className="btn-primary" onClick={() => { setModal(false); setDone(true); }}>Confirmar cambio</button>
          </div>
        </div>
      )}
    </div>
  );
}
