import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
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
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">🛍️</span>
          <h1 className="brand-name">LUXE<span>SHOP</span></h1>
        </div>
        <p className="auth-subtitle">Bienvenido de vuelta</p>

        <form onSubmit={handleSubmit} noValidate>
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

          <div className="field-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="field-row">
            <Link to="/forgot-password" className="link-subtle">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="btn-primary">Iniciar sesión</button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register" className="link-accent">Regístrate</Link>
        </p>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">✅</span>
              <h3>Datos del formulario</h3>
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
