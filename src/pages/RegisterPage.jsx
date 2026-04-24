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

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="auth-bg">
      <div className="auth-card auth-card-wide" role="main">
        <div className="auth-brand">
          <div className="brand-icon" aria-hidden="true">
            <ShoppingBagIcon />
          </div>
          <h1 className="brand-name">LUXE<span>SHOP</span></h1>
        </div>
        <p className="auth-subtitle">Crea tu cuenta</p>

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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="link-accent">Inicia sesión</Link>
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
              <div className="modal-field"><span>Nombre:</span> <strong>{form.name}</strong></div>
              <div className="modal-field"><span>Email:</span> <strong>{form.email}</strong></div>
              <div className="modal-field"><span>Contraseña:</span> <strong>{'•'.repeat(form.password.length)} ({form.password.length} chars)</strong></div>
              <div className="modal-field"><span>Acción:</span> <strong>Registro de usuario</strong></div>
            </div>
            <button className="btn-primary" onClick={() => setModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}