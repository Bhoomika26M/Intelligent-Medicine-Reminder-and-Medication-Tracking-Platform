import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const res = await api.get('/profile');
          setUser(res.data);
        } catch (err) {
          console.error("Auth initialization failed:", err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      const profileRes = await api.get('/profile');
      setUser(profileRes.data);
      return profileRes.data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (email, password, role) => {
    try {
      await api.post('/auth/register', { email, password, role });
      return await login(email, password);
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn("Stateless logout API warning:", err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const updateProfileState = (updatedProfile) => {
    setUser((prev) => (prev ? { ...prev, ...updatedProfile } : updatedProfile));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
