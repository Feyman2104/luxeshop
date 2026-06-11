import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  categoriesRef,
  createCategory,
  updateCategory,
  deleteCategory,
  validateCategory,
} from '../lib/categories';
import './crud.css';

const EMPTY_FORM = { name: '', description: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const q = query(categoriesRef(), orderBy('name'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('categories snapshot failed:', err);
        setFeedback('No se pudieron cargar las categorías.');
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateCategory(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        showFeedback('Categoría actualizada correctamente.');
      } else {
        await createCategory(form);
        showFeedback('Categoría creada correctamente.');
      }
      cancelEdit();
    } catch (err) {
      console.error('save category failed:', err);
      showFeedback('Error al guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      if (editingId === deleteTarget.id) cancelEdit();
      showFeedback('Categoría eliminada.');
    } catch (err) {
      console.error('delete category failed:', err);
      showFeedback('Error al eliminar la categoría.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="crud-root">
      <header className="crud-header">
        <Link to="/dashboard" className="crud-back" aria-label="Volver al dashboard">← Dashboard</Link>
        <div>
          <h1 className="crud-title">Categorías</h1>
          <p className="crud-subtitle">Organiza los productos de la tienda por categoría</p>
        </div>
      </header>

      {feedback && <div className="crud-feedback" role="status">{feedback}</div>}

      <section className="crud-form-card" aria-label={editingId ? 'Editar categoría' : 'Nueva categoría'}>
        <h2 className="crud-form-title">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="crud-field">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ej: Suplementos"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <span className="crud-error" id="name-error" role="alert">{errors.name}</span>}
          </div>

          <div className="crud-field">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe qué productos agrupa esta categoría"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className={errors.description ? 'input-error' : ''}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && <span className="crud-error" id="description-error" role="alert">{errors.description}</span>}
          </div>

          <div className="crud-form-actions">
            <button type="submit" className="crud-btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
            </button>
            {editingId && (
              <button type="button" className="crud-btn-ghost" onClick={cancelEdit}>Cancelar</button>
            )}
          </div>
        </form>
      </section>

      <section className="crud-list-card" aria-label="Listado de categorías">
        <h2 className="crud-form-title">Listado ({categories.length})</h2>
        {loading ? (
          <p className="crud-empty">Cargando categorías...</p>
        ) : categories.length === 0 ? (
          <p className="crud-empty">No hay categorías todavía. Crea la primera con el formulario.</p>
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th className="crud-col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="crud-cell-strong">{cat.name}</td>
                    <td>{cat.description}</td>
                    <td className="crud-col-actions">
                      <button className="crud-btn-sm" onClick={() => startEdit(cat)} aria-label={`Editar ${cat.name}`}>Editar</button>
                      <button className="crud-btn-sm crud-btn-danger" onClick={() => setDeleteTarget(cat)} aria-label={`Eliminar ${cat.name}`}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {deleteTarget && (
        <div className="crud-modal-overlay" onClick={() => setDeleteTarget(null)} role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="delete-title">¿Eliminar categoría?</h3>
            <p>Se eliminará <strong>{deleteTarget.name}</strong> de forma permanente. Esta acción no se puede deshacer.</p>
            <div className="crud-form-actions">
              <button className="crud-btn-danger-solid" onClick={confirmDelete}>Sí, eliminar</button>
              <button className="crud-btn-ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
