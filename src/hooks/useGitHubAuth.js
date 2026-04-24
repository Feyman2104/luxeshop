import { useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/github/callback`;

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_SCOPES = ['read:user', 'user:email'].join(' ');

export function useGitHubAuth() {
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
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: GITHUB_SCOPES,
      state,
    });
    return `${GITHUB_AUTH_URL}?${params.toString()}`;
  }, []);

  const signInWithPopup = useCallback(() => {
    clearError();
    setLoading(true);
    const state = generateState();

    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        getAuthUrl(state),
        'github-auth',
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

        if (type === 'GITHUB_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', handleMessage);

          signIn('github', {
            id: data.id,
            name: data.name || data.login,
            email: data.email,
            picture: data.avatar_url,
            username: data.login,
          });
          setLoading(false);
          resolve(data);
        } else if (type === 'GITHUB_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', handleMessage);
          setError(data.message || 'Error en autenticación con GitHub');
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
    sessionStorage.setItem('oauth_provider', 'github');
    window.location.href = getAuthUrl(state);
  }, [getAuthUrl, clearError]);

  const handleCallback = useCallback(async (code, state) => {
    const storedState = sessionStorage.getItem('oauth_state');
    const provider = sessionStorage.getItem('oauth_provider');

    if (state !== storedState || provider !== 'github') {
      throw new Error('Estado de OAuth inválido');
    }

    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_provider');

    try {
      const response = await fetch('/api/auth/github/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Error en el intercambio de código');
      }

      const data = await response.json();

      signIn('github', {
        id: data.id,
        name: data.name || data.login,
        email: data.email,
        picture: data.avatar_url,
        username: data.login,
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