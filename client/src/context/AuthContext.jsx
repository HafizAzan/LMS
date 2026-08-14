import { createContext, useContext, useMemo, useState } from 'react';
import {
  getStoredAuth,
  loginUser,
  logoutUser,
  persistUser,
  registerUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [{ token, user }, setAuth] = useState(() => getStoredAuth());

  const login = async (data) => {
    const result = await loginUser(data);
    setAuth({ token: result.token, user: result.user });
    return result;
  };

  const register = async (data) => {
    const result = await registerUser(data);
    setAuth({ token: result.token, user: result.user });
    return result;
  };

  const logout = () => {
    logoutUser();
    setAuth({ token: null, user: null });
  };

  const updateUser = (nextUser) => {
    persistUser(nextUser);
    setAuth((prev) => ({ ...prev, user: nextUser }));
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      updateUser,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
