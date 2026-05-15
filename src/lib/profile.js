import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from './firebase';

const MAX_BYTES = 2 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) throw new Error('No se seleccionó ningún archivo.');
  if (!file.type?.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen (JPG, PNG, WebP, etc.).');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('La imagen no puede pesar más de 2 MB.');
  }
}

export async function uploadProfilePhoto(file, uid) {
  validateImageFile(file);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `avatars/${uid}/${Date.now()}.${ext}`;
  const r = ref(storage, path);
  try {
    await uploadBytes(r, file, { contentType: file.type });
  } catch (err) {
    if (err?.code === 'storage/unauthorized') {
      throw new Error('Firebase Storage rechazó la subida. Habilita Storage en la consola y publica las reglas (ver docs/README-Storage.md).');
    }
    if (err?.code === 'storage/unknown' || err?.code === 'storage/object-not-found') {
      throw new Error('No se pudo conectar con Firebase Storage. Verifica que esté habilitado en tu proyecto.');
    }
    throw new Error('No se pudo subir la imagen: ' + (err?.message || 'error desconocido'));
  }
  return getDownloadURL(r);
}

export async function setProfilePhoto(user, photoURL) {
  if (!user) throw new Error('No hay un usuario autenticado.');
  await updateProfile(user, { photoURL });
  await setDoc(
    doc(db, 'users', user.uid),
    { photoURL, updatedAt: serverTimestamp() },
    { merge: true }
  );
  await user.reload();
}
