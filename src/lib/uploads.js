import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { validateImageFile } from './profile';

// Sube una imagen validada a Storage en `${folder}/${timestamp}.${ext}` y
// devuelve su URL de descarga. Reutilizado por productos y categorías.
export async function uploadImage(file, folder) {
  validateImageFile(file);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder}/${Date.now()}.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}
