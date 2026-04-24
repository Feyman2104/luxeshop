import { useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_SCOPES = ['openid', 'email', 'profile'].join(' ');

export function useGoogleAuth() {
  const { signIn, setLoading, setError, clearError } = useAuth();
  const popupRef = useRef(null);
  const abortControllerRef = useRef(null);

  const generateState = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  const getAuthUrl = useCallback((state) => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_SCOPES,
      state,
      access_type: 'offline',
      prompt: 'select_account',
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }, []);

  const signInWithPopup = useCallback(() => {
    clearError();
    setLoading(true);
    const state = generateState();

    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        getAuthUrl(state),
        'google-auth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      popupRef.current = popup;

      if (!popup) {
        setError('No se pudo abrir la ventana emergente. Asegúrate de permitir ventanas emergentes.');
        setLoading(false);
        reject(new Error('Popup blocked'));
        return;
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setLoading(false);
          reject(new Error('User cancelled'));
        }
      }, 1000);

      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data || {};

        if (type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', handleMessage);

          signIn('google', {
            id: data.id,
            name: data.name,
            email: data.email,
            picture: data.picture,
          });
          setLoading(false);
          resolve(data);
        } else if (type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', handleMessage);
          setError(data.message || 'Error en autenticación con Google');
          setLoading(false);
          reject(new Error(data.message));
        }
      };

      window.addEventListener('message', handleMessage);

      abortControllerRef.current = { state, checkClosed, handleMessage };
    });
  }, [getAuthUrl, signIn, setLoading, setError, clearError]);

  const signInWithRedirect = useCallback(() => {
    clearError();
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', 'google');
    window.location.href = getAuthUrl(state);
  }, [getAuthUrl, clearError]);

  const handleCallback = useCallback(async (code, state) => {
    const storedState = sessionStorage.getItem('oauth_state');
    const provider = sessionStorage.getItem('oauth_provider');

    if (state !== storedState || provider !== 'google') {
      throw new Error('Estado de OAuth inválido');
    }

    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_provider');

    try {
      const response = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Error en el intercambio de código');
      }

      const data = await response.json();

      signIn('google', {
        id: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture,
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [signIn, setError]);

  const signOut = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.close();
    }
    if (abortControllerRef.current) {
      clearInterval(abortControllerRef.current.checkClosed);
      window.removeEventListener('message', abortControllerRef.current.handleMessage);
    }
  }, []);

  return {
    signInWithPopup,
    signInWithRedirect,
    handleCallback,
    signOut,
  };
}