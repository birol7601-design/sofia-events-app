import { useState, useEffect } from 'react';
import { getUser, isLoggedIn, clearAuth } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState(getUser);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);

  const refresh = () => {
    setUser(getUser());
    setLoggedIn(isLoggedIn());
  };

  const logout = () => {
    clearAuth();
    refresh();
  };

  // re-sync if localStorage changes in another tab
  useEffect(() => {
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  return { user, loggedIn, refresh, logout };
}
