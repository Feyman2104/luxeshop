import { useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID';
const FACEBOOK_REDIRECT_URI = import.meta.env.VITE_FACEBOOK_REDIRECT_URI || `${window.location.origin}/auth/facebook/callback`;

const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const FACEBOOK_SCOPES = ['email', 'public_profile'].join(',');

export function useFacebookAuth() {
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
      client_id: FACEBOOK_APP_ID,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      state,
      scope: FACEBOOK_SCOPES,
      response_type: 'code',
    });
    return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
  }, []);

  const loadFacebookSDK = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.FB) {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
        resolve();
      };

      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.onerror = (event) => {
        console.error('Facebook SDK failed to load', event);
        reject(new Error('Failed to load Facebook SDK'));
      };
      document.body.appendChild(script);
    });
  }, []);

  const fbLogin = useCallback((permissions) => {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK no cargado'));
        return;
      }

      window.FB.login((response) => {
        if (response.authResponse) {
          resolve(response);
        } else {
          reject(new Error('User cancelled or auth error'));
        }
      }, { scope: permissions });
    });
  }, []);

  const fbGetUserProfile = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK no cargado'));
        return;
      }

      window.FB.api('/me', { fields: 'id,name,email,picture' }, (response) => {
        if (!response || response.error) {
          reject(response?.error || new Error('Failed to get user profile'));
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  const signInWithPopup = useCallback(async () => {
    clearError();
    setLoading(true);

    try {
      await loadFacebookSDK();

      const response = await fbLogin(FACEBOOK_SCOPES);

      if (!response.authResponse) {
        throw new Error('Autenticación cancelada');
      }

      const profile = await fbGetUserProfile();

      signIn('facebook', {
        id: profile.id,
        name: profile.name,
        email: profile.email || `${profile.id}@facebook.user`,
        picture: profile.picture?.data?.url || null,
      });

      setLoading(false);
      return profile;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [loadFacebookSDK, fbLogin, fbGetUserProfile, signIn, setLoading, setError, clearError]);

  const signInWithRedirect = useCallback(() => {
    clearError();
    setLoading(true);
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', 'facebook');
    window.location.href = getAuthUrl(state);
  }, [getAuthUrl, clearError, setLoading]);

  const handleCallback = useCallback(async (code, state) => {
    const storedState = sessionStorage.getItem('oauth_state');
    const provider = sessionStorage.getItem('oauth_provider');

    if (state !== storedState || provider !== 'facebook') {
      throw new Error('Estado de OAuth inválido');
    }

    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_provider');

    try {
      const response = await fetch('/api/auth/facebook/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Error en el intercambio de código');
      }

      const data = await response.json();

      signIn('facebook', {
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
    if (window.FB) {
      window.FB.logout();
    }
  }, []);

  return {
    signInWithPopup,
    signInWithRedirect,
    handleCallback,
    signOut,
    loadFacebookSDK,
  };
}