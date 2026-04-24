import { useCallback, useMemo } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { useFacebookAuth } from './useFacebookAuth';
import { useGitHubAuth } from './useGitHubAuth';
import { useAuth } from '../context/AuthContext';

export function useSocialAuth() {
  const { loading, error, clearError } = useAuth();

  const googleAuth = useGoogleAuth();
  const facebookAuth = useFacebookAuth();
  const githubAuth = useGitHubAuth();

  const signInWithProvider = useCallback(async (provider) => {
    clearError();

    try {
      switch (provider) {
        case 'google':
          return await googleAuth.signInWithPopup();
        case 'facebook':
          return await facebookAuth.signInWithPopup();
        case 'github':
          return await githubAuth.signInWithPopup();
        default:
          throw new Error(`Proveedor "${provider}" no soportado`);
      }
    } catch (err) {
      throw err;
    }
  }, [googleAuth, facebookAuth, githubAuth, clearError]);

  const signInWithRedirect = useCallback((provider) => {
    switch (provider) {
      case 'google':
        googleAuth.signInWithRedirect();
        break;
      case 'facebook':
        facebookAuth.signInWithRedirect();
        break;
      case 'github':
        githubAuth.signInWithRedirect();
        break;
      default:
        throw new Error(`Proveedor "${provider}" no soportado`);
    }
  }, [googleAuth, facebookAuth, githubAuth]);

  const handleCallback = useCallback(async (provider, code, state) => {
    switch (provider) {
      case 'google':
        return await googleAuth.handleCallback(code, state);
      case 'facebook':
        return await facebookAuth.handleCallback(code, state);
      case 'github':
        return await githubAuth.handleCallback(code, state);
      default:
        throw new Error(`Proveedor "${provider}" no soportado`);
    }
  }, [googleAuth, facebookAuth, githubAuth]);

  const signOut = useCallback(() => {
    googleAuth.signOut();
    facebookAuth.signOut();
    githubAuth.signOut();
  }, [googleAuth, facebookAuth, githubAuth]);

  const providers = useMemo(() => [
    {
      id: 'google',
      name: 'Google',
      icon: 'google',
      color: '#4285F4',
      lightColor: '#fff',
      darkColor: '#1a1a24',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'facebook',
      color: '#1877F2',
      lightColor: '#fff',
      darkColor: '#1a1a24',
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: 'github',
      color: '#333333',
      lightColor: '#fff',
      darkColor: '#f0ede8',
    },
  ], []);

  return {
    providers,
    signInWithProvider,
    signInWithRedirect,
    handleCallback,
    signOut,
    isLoading: loading,
    error,
    clearError,
  };
}