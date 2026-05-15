import { useState, useEffect } from 'react';
import { uploadProfilePhoto, setProfilePhoto, validateImageFile } from '../lib/profile';

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

export default function EditPhotoModal({ open, onClose, user, refreshUser }) {
  const [tab, setTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setFile(null); setFilePreview(''); setUrl(''); setError(''); setBusy(false); setTab('upload');
    }
  }, [open]);

  if (!open) return null;

  const handleFileChange = (e) => {
    setError('');
    const f = e.target.files?.[0];
    if (!f) { setFile(null); setFilePreview(''); return; }
    try {
      validateImageFile(f);
      setFile(f);
      setFilePreview(URL.createObjectURL(f));
    } catch (err) {
      setError(err.message);
      setFile(null); setFilePreview('');
    }
  };

  const handleSave = async () => {
    setError(''); setBusy(true);
    try {
      let photoURL;
      if (tab === 'upload') {
        if (!file) throw new Error('Selecciona una imagen primero.');
        photoURL = await uploadProfilePhoto(file, user.uid);
      } else {
        if (!url.trim()) throw new Error('Pega una URL válida.');
        try { new URL(url); } catch { throw new Error('La URL no es válida.'); }
        photoURL = url.trim();
      }
      await setProfilePhoto(user, photoURL);
      await refreshUser();
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la foto.');
    } finally {
      setBusy(false);
    }
  };

  const preview = tab === 'upload' ? filePreview : url;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-photo-title">
      <div className="modal-box edit-photo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="edit-photo-close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </button>
        <div className="modal-header">
          <h3 id="edit-photo-title">Cambiar foto de perfil</h3>
        </div>

        <div className="modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'upload'}
            className={`modal-tab ${tab === 'upload' ? 'modal-tab--active' : ''}`}
            onClick={() => { setTab('upload'); setError(''); }}
          >
            <UploadIcon /> Subir archivo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'url'}
            className={`modal-tab ${tab === 'url' ? 'modal-tab--active' : ''}`}
            onClick={() => { setTab('url'); setError(''); }}
          >
            <LinkIcon /> Pegar URL
          </button>
        </div>

        <div className="modal-body edit-photo-body">
          <div className="modal-photo-preview">
            {preview ? (
              <img src={preview} alt="Vista previa" referrerPolicy="no-referrer" />
            ) : (
              <span className="modal-photo-placeholder">Sin imagen</span>
            )}
          </div>

          {tab === 'upload' ? (
            <label className="modal-file-input">
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={busy} />
              <span>{file ? file.name : 'Elegir imagen (máx. 2 MB)'}</span>
            </label>
          ) : (
            <input
              type="url"
              className="modal-url-input"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              disabled={busy}
            />
          )}

          {error && <p className="modal-error">{error}</p>}
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={busy}>
          {busy ? <span className="spinner" aria-hidden="true" /> : null}
          {busy ? 'Guardando...' : 'Guardar foto'}
        </button>
      </div>
    </div>
  );
}
