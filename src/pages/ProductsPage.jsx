import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  productsRef,
  createProduct,
  updateProduct,
  deleteProduct,
  validateProduct,
  uploadProductImage,
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
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef(null);

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

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      console.error('upload product image failed:', err);
      showFeedback(err.message || 'Error al subir la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const startEdit = (prod) => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      cancelEdit();
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
      if (editingId === deleteTarget.id) cancelEdit();
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
      <header className="crud-header">
        <Link to="/dashboard" className="crud-back" aria-label="Volver al dashboard">← Dashboard</Link>
        <div>
          <h1 className="crud-title">Productos</h1>
          <p className="crud-subtitle">Suplementos y ropa deportiva disponibles en la tienda</p>
        </div>
      </header>

      {feedback && <div className="crud-feedback" role="status">{feedback}</div>}

      <section className="crud-form-card" aria-label={editingId ? 'Editar producto' : 'Nuevo producto'}>
        <h2 className="crud-form-title">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
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
            {form.imageUrl && <img src={form.imageUrl} alt="Vista previa del producto" className="crud-img-preview" />}
          </div>

          <div className="crud-form-actions">
            <button type="submit" className="crud-btn-primary" disabled={saving || uploadingImage}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
            </button>
            {editingId && (
              <button type="button" className="crud-btn-ghost" onClick={cancelEdit}>Cancelar</button>
            )}
          </div>
        </form>
      </section>

      <section className="crud-list-card" aria-label="Listado de productos">
        <h2 className="crud-form-title">Listado ({products.length})</h2>
        {loading ? (
          <p className="crud-empty">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="crud-empty">No hay productos todavía. Crea el primero con el formulario.</p>
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th className="crud-col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      {prod.imageUrl
                        ? <img src={prod.imageUrl} alt={prod.name} className="crud-thumb" />
                        : <div className="crud-thumb-placeholder" aria-hidden="true">📦</div>}
                    </td>
                    <td className="crud-cell-strong">{prod.name}</td>
                    <td>{prod.categoryName ? <span className="crud-badge">{prod.categoryName}</span> : '—'}</td>
                    <td>{formatPrice(prod.price)}</td>
                    <td>{prod.stock}</td>
                    <td className="crud-col-actions">
                      <button className="crud-btn-sm" onClick={() => startEdit(prod)} aria-label={`Editar ${prod.name}`}>Editar</button>
                      <button className="crud-btn-sm crud-btn-danger" onClick={() => setDeleteTarget(prod)} aria-label={`Eliminar ${prod.name}`}>Eliminar</button>
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
