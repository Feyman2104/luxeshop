import { useCallback } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, providers } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export function useSocialAuth() {
  const { error, clearError, setError } = useAuth();

  const signInWithProvider = useCallback(async (providerId) => {
    clearError();
    const provider = providers[providerId];
    if (!provider) throw new Error(`Proveedor "${providerId}" no soportado`);

    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err) {
      const msg =
        err.code === 'auth/popup-closed-by-user'
          ? 'Inicio cancelado.'
        : err.code === 'auth/cancelled-popup-request'
          ? 'Solicitud cancelada.'
        : err.code === 'auth/popup-blocked'
          ? 'El navegador bloqueó la ventana emergente. Permítela e inténtalo de nuevo.'
        : err.code === 'auth/account-exists-with-different-credential'
          ? 'Esa cuenta ya está vinculada a otro proveedor.'
        : err.code === 'auth/network-request-failed'
          ? 'Error de red. Verifica tu conexión.'
        : err.message;
      setError(msg);
      throw err;
    }
  }, [clearError, setError]);

  return { signInWithProvider, error, clearError };
}
