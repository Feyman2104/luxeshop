import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  categoriesRef,
  createCategory,
  updateCategory,
  deleteCategory,
  validateCategory,
  uploadCategoryImage,
} from '../lib/categories';
import './crud.css';

const EMPTY_FORM = { name: '', description: '', imageUrl: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef(null);

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

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadCategoryImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      console.error('upload category image failed:', err);
      showFeedback(err.message || 'Error al subir la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description, imageUrl: cat.imageUrl || '' });
    setErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      closeForm();
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
      if (editingId === deleteTarget.id) closeForm();
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
      <header className="crud-header crud-header--row">
        <div>
          <Link to="/dashboard" className="crud-back" aria-label="Volver al dashboard">← Dashboard</Link>
          <h1 className="crud-title">Categorías</h1>
          <p className="crud-subtitle">Organiza los productos de la tienda por categoría</p>
        </div>
        <button className="crud-btn-primary" onClick={openCreate}>+ Nueva categoría</button>
      </header>

      {feedback && <div className="crud-feedback" role="status">{feedback}</div>}

      {loading ? (
        <p className="crud-empty">Cargando categorías...</p>
      ) : categories.length === 0 ? (
        <div className="crud-empty-state">
          <p className="crud-empty-icon" aria-hidden="true">🏷️</p>
          <p>No hay categorías todavía.</p>
          <button className="crud-btn-primary" onClick={openCreate}>Crear la primera</button>
        </div>
      ) : (
        <div className="crud-grid" aria-label="Listado de categorías">
          {categories.map((cat) => (
            <article className="crud-card" key={cat.id}>
              {cat.imageUrl
                ? <img src={cat.imageUrl} alt={cat.name} className="crud-card-img" />
                : <div className="crud-card-img crud-card-img--placeholder" aria-hidden="true">🏷️</div>}
              <div className="crud-card-body">
                <h3 className="crud-card-title">{cat.name}</h3>
                <p className="crud-card-desc">{cat.description}</p>
                <div className="crud-card-actions">
                  <button className="crud-btn-sm" onClick={() => openEdit(cat)} aria-label={`Editar ${cat.name}`}>Editar</button>
                  <button className="crud-btn-sm crud-btn-danger" onClick={() => setDeleteTarget(cat)} aria-label={`Eliminar ${cat.name}`}>Eliminar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="crud-modal-overlay" onClick={closeForm} role="dialog" aria-modal="true" aria-labelledby="form-title">
          <div className="crud-modal crud-modal--form" onClick={(e) => e.stopPropagation()}>
            <h3 id="form-title">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="crud-field">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Ej: Proteínas limpias"
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

              <div className="crud-field">
                <label htmlFor="image">Imagen (opcional, máx 2 MB)</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  disabled={uploadingImage}
                />
                {uploadingImage && <span className="crud-error" style={{ color: 'var(--accent, #7ab830)' }}>Subiendo imagen...</span>}
                {form.imageUrl && <img src={form.imageUrl} alt="Vista previa de la categoría" className="crud-img-preview" />}
              </div>

              <div className="crud-form-actions">
                <button type="submit" className="crud-btn-primary" disabled={saving || uploadingImage}>
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
                </button>
                <button type="button" className="crud-btn-ghost" onClick={closeForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
