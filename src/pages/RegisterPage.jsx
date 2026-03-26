import { useState } from 'react';
import { Link } from 'react-router-dom';
import './auth.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);

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
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setModal(true);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <span className="brand-icon">🛍️</span>
          <h1 className="brand-name">LUXE<span>SHOP</span></h1>
        </div>
        <p className="auth-subtitle">Crea tu cuenta</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="field-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="fields-row">
            <div className="field-group">
              <label>Contraseña</label>
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

            <div className="field-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                name="confirm"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={handleChange}
                className={errors.confirm ? 'input-error' : ''}
              />
              {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
            </div>
          </div>

          <div className="password-strength">
            {form.password && (
              <>
                <span>Fortaleza:</span>
                <div className="strength-bars">
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

          <button type="submit" className="btn-primary">Crear cuenta</button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="link-accent">Inicia sesión</Link>
        </p>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">🎉</span>
              <h3>Datos del formulario</h3>
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
