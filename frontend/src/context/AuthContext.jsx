import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('phuquy_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('phuquy_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('phuquy_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('phuquy_token', jwtToken);
      localStorage.setItem('phuquy_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Đăng nhập thất bại');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      const { token: jwtToken, user: newUser } = res.data;
      setToken(jwtToken);
      setUser(newUser);
      localStorage.setItem('phuquy_token', jwtToken);
      localStorage.setItem('phuquy_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.message || 'Đăng ký thất bại');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('phuquy_token');
    localStorage.removeItem('phuquy_user');
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/users/profile', profileData);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('phuquy_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Cập nhật thất bại');
  };

  const isAdmin = user && user.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
