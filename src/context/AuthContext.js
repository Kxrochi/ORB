import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

/**
 * AuthContext
 *
 * Provides authenticated Firebase user state and auth helpers across the app.
 * - Subscribes to Firebase Auth state changes once on mount
 * - Exposes `user`, `loading`, and `signOut()` via `useAuth()`
 */

const AuthContext = createContext();

/**
 * useAuth
 *
 * Hook to access the current auth context. Must be used under `AuthProvider`.
 * @returns {{ user: import('firebase/auth').User|null, loading: boolean, signOut: () => Promise<void> }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider
 *
 * Wraps the application and provides Firebase authentication state.
 * Children are rendered only after the initial auth state is resolved to
 * avoid flicker on protected routes.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Signs out the current user.
   * Propagates any thrown error to callers so UI can surface failures.
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      // console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 