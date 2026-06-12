import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  productsRef,
  createProduct,
  updateProduct,
  deleteProduct,
  validateProduct,
  formatPrice,
} from '../lib/products';
import { categoriesRef } from '../lib/categories';
import './crud.css';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const q = query(productsRef(), orderBy('name'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('products snapshot failed:', err);
        setFeedback('No se pudieron cargar los productos.');
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(categoriesRef(), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
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

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (prod) => {
    setEditingId(prod.id);
    setForm({
      name: prod.name,
      description: prod.description,
      price: String(prod.price),
      stock: String(prod.stock),
      categoryId: prod.categoryId || '',
      imageUrl: prod.imageUrl || '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProduct(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const category = categories.find((c) => c.id === form.categoryId);
    const payload = { ...form, categoryName: category?.name || '' };
    setSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        showFeedback('Producto actualizado correctamente.');
      } else {
        await createProduct(payload);
        showFeedback('Producto creado correctamente.');
      }
      closeForm();
    } catch (err) {
      console.error('save product failed:', err);
      showFeedback('Error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      if (editingId === deleteTarget.id) closeForm();
      showFeedback('Producto eliminado.');
    } catch (err) {
      console.error('delete product failed:', err);
      showFeedback('Error al eliminar el producto.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="crud-root">
      <header className="crud-header crud-header--row">
        <div>
          <Link to="/dashboard" className="crud-back" aria-label="Volver al dashboard">← Dashboard</Link>
          <h1 className="crud-title">Productos</h1>
          <p className="crud-subtitle">Suplementos y ropa deportiva disponibles en la tienda</p>
        </div>
        <button className="crud-btn-primary" onClick={openCreate}>+ Nuevo producto</button>
      </header>

      {feedback && <div className="crud-feedback" role="status">{feedback}</div>}

      {loading ? (
        <p className="crud-empty">Cargando productos...</p>
      ) : products.length === 0 ? (
        <div className="crud-empty-state">
          <p className="crud-empty-icon" aria-hidden="true">📦</p>
          <p>No hay productos todavía.</p>
          <button className="crud-btn-primary" onClick={openCreate}>Crear el primero</button>
        </div>
      ) : (
        <div className="crud-grid" aria-label="Listado de productos">
          {products.map((prod) => (
            <article className="crud-card" key={prod.id}>
              {prod.imageUrl
                ? <img src={prod.imageUrl} alt={prod.name} className="crud-card-img" />
                : <div className="crud-card-img crud-card-img--placeholder" aria-hidden="true">📦</div>}
              <div className="crud-card-body">
                {prod.categoryName && <span className="crud-badge">{prod.categoryName}</span>}
                <h3 className="crud-card-title">{prod.name}</h3>
                <p className="crud-card-desc">{prod.description}</p>
                <div className="crud-card-meta">
                  <span className="crud-card-price">{formatPrice(prod.price)}</span>
                  <span className="crud-card-stock">Stock: {prod.stock}</span>
                </div>
                <div className="crud-card-actions">
                  <button className="crud-btn-sm" onClick={() => openEdit(prod)} aria-label={`Editar ${prod.name}`}>Editar</button>
                  <button className="crud-btn-sm crud-btn-danger" onClick={() => setDeleteTarget(prod)} aria-label={`Eliminar ${prod.name}`}>Eliminar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="crud-modal-overlay" onClick={closeForm} role="dialog" aria-modal="true" aria-labelledby="form-title">
          <div className="crud-modal crud-modal--form" onClick={(e) => e.stopPropagation()}>
            <h3 id="form-title">{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="crud-fields-row">
                <div className="crud-field">
                  <label htmlFor="name">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Ej: Proteína Whey 2lb"
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? 'input-error' : ''}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <span className="crud-error" id="name-error" role="alert">{errors.name}</span>}
                </div>

                <div className="crud-field">
                  <label htmlFor="categoryId">Categoría</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className={errors.categoryId ? 'input-error' : ''}
                    aria-describedby={errors.categoryId ? 'category-error' : undefined}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <span className="crud-error" id="category-error" role="alert">{errors.categoryId}</span>}
                </div>
              </div>

              <div className="crud-fields-row">
                <div className="crud-field">
                  <label htmlFor="price">Precio (COP)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    placeholder="Ej: 120000"
                    min="1"
                    value={form.price}
                    onChange={handleChange}
                    className={errors.price ? 'input-error' : ''}
                    aria-describedby={errors.price ? 'price-error' : undefined}
                  />
                  {errors.price && <span className="crud-error" id="price-error" role="alert">{errors.price}</span>}
                </div>

                <div className="crud-field">
                  <label htmlFor="stock">Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    placeholder="Ej: 25"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    className={errors.stock ? 'input-error' : ''}
                    aria-describedby={errors.stock ? 'stock-error' : undefined}
                  />
                  {errors.stock && <span className="crud-error" id="stock-error" role="alert">{errors.stock}</span>}
                </div>
              </div>

              <div className="crud-field">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe el producto"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className={errors.description ? 'input-error' : ''}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                />
                {errors.description && <span className="crud-error" id="description-error" role="alert">{errors.description}</span>}
              </div>

              <div className="crud-field">
                <label htmlFor="imageUrl">Imagen (opcional)</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={form.imageUrl}
                  onChange={handleChange}
                />
                <span className="crud-hint">Pega el enlace de una imagen (clic derecho → Copiar dirección de la imagen).</span>
                {form.imageUrl && <img src={form.imageUrl} alt="Vista previa del producto" className="crud-img-preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} onLoad={(e) => { e.currentTarget.style.display = ''; }} />}
              </div>

              <div className="crud-form-actions">
                <button type="submit" className="crud-btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
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
            <h3 id="delete-title">¿Eliminar producto?</h3>
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
