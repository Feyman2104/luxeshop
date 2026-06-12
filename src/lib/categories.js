import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage } from './uploads';

export const CATEGORIES_COLLECTION = 'categories';

export function categoriesRef() {
  return collection(db, CATEGORIES_COLLECTION);
}

export async function uploadCategoryImage(file) {
  return uploadImage(file, 'categories');
}

export async function createCategory({ name, description, imageUrl }) {
  return addDoc(categoriesRef(), {
    name: name.trim(),
    description: description.trim(),
    imageUrl: imageUrl || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCategory(id, { name, description, imageUrl }) {
  return updateDoc(doc(db, CATEGORIES_COLLECTION, id), {
    name: name.trim(),
    description: description.trim(),
    imageUrl: imageUrl || '',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
}

export function validateCategory({ name, description }) {
  const errors = {};
  if (!name?.trim()) errors.name = 'El nombre es obligatorio.';
  else if (name.trim().length < 3) errors.name = 'Mínimo 3 caracteres.';
  else if (name.trim().length > 50) errors.name = 'Máximo 50 caracteres.';
  if (!description?.trim()) errors.description = 'La descripción es obligatoria.';
  else if (description.trim().length > 200) errors.description = 'Máximo 200 caracteres.';
  return errors;
}
