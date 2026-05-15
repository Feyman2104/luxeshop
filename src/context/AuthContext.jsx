import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { endSession } from '../lib/sessions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signOutUser = useCallback(async () => {
    await endSession();
    await fbSignOut(auth);
    setUser(null);
    setError(null);
  }, []);

  const setErrorState = useCallback((err) => {
    setError(err);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signOut: signOutUser,
    setLoading,
    setError: setErrorState,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
