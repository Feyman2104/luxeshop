import { useState, useEffect, useRef } from 'react';
import { setProfilePhoto } from '../lib/profile';

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

function resizeToBase64(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('No se pudo leer la imagen.')); };
    img.src = objectUrl;
  });
}

export default function EditPhotoModal({ open, onClose, user, refreshUser }) {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState('');
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) { setFile(null); setPreview(''); setError(''); setBusy(false); }
  }, [open]);

  if (!open) return null;

  const handleFileChange = (e) => {
    setError('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('El archivo debe ser una imagen.'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('La imagen no puede pesar más de 5 MB.'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setError(''); setBusy(true);
    try {
      if (!file) throw new Error('Selecciona una imagen primero.');
      const base64 = await resizeToBase64(file, 256);
      await setProfilePhoto(user, base64);
      await refreshUser();
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la foto.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-photo-title">
      <div className="modal-box edit-photo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="edit-photo-close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </button>

        <div className="modal-header">
          <h3 id="edit-photo-title">Cambiar foto de perfil</h3>
        </div>

        <div className="modal-body edit-photo-body">
          <div className="modal-photo-preview">
            {preview
              ? <img src={preview} alt="Vista previa" />
              : <span className="modal-photo-placeholder">Vista previa</span>
            }
          </div>

          <input
            ref={inputRef}
            id="photo-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={busy}
            style={{ display: 'none' }}
          />

          <label htmlFor="photo-file-input" className="modal-upload-btn">
            <UploadIcon />
            <span>{file ? file.name : 'Elegir foto desde mi computador'}</span>
          </label>

          {error && <p className="modal-error">{error}</p>}
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={busy || !file}>
          {busy ? <span className="spinner" aria-hidden="true" /> : null}
          {busy ? 'Guardando...' : 'Guardar foto'}
        </button>
      </div>
    </div>
  );
}
