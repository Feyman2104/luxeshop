import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { validateImageFile } from './profile';

export const PRODUCTS_COLLECTION = 'products';

export function productsRef() {
  return collection(db, PRODUCTS_COLLECTION);
}

export async function uploadProductImage(file) {
  validateImageFile(file);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `products/${Date.now()}.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}

export async function createProduct({ name, description, price, stock, categoryId, categoryName, imageUrl }) {
  return addDoc(productsRef(), {
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    categoryId,
    categoryName,
    imageUrl: imageUrl || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(id, { name, description, price, stock, categoryId, categoryName, imageUrl }) {
  return updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    categoryId,
    categoryName,
    imageUrl: imageUrl || '',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id) {
  return deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
}

export function validateProduct({ name, description, price, stock, categoryId }) {
  const errors = {};
  if (!name?.trim()) errors.name = 'El nombre es obligatorio.';
  else if (name.trim().length < 3) errors.name = 'Mínimo 3 caracteres.';
  else if (name.trim().length > 80) errors.name = 'Máximo 80 caracteres.';

  if (!description?.trim()) errors.description = 'La descripción es obligatoria.';
  else if (description.trim().length > 300) errors.description = 'Máximo 300 caracteres.';

  const priceNum = Number(price);
  if (price === '' || price === null || Number.isNaN(priceNum)) errors.price = 'El precio es obligatorio.';
  else if (priceNum <= 0) errors.price = 'El precio debe ser mayor a 0.';

  const stockNum = Number(stock);
  if (stock === '' || stock === null || Number.isNaN(stockNum)) errors.stock = 'El stock es obligatorio.';
  else if (!Number.isInteger(stockNum) || stockNum < 0) errors.stock = 'El stock debe ser un entero ≥ 0.';

  if (!categoryId) errors.categoryId = 'Selecciona una categoría.';

  return errors;
}

export function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
