import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await apiService.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load user', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      // Backend returns { access_token, token_type }
      const newToken = response.data.access_token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Fetch user profile with the new token
      const userRes = await apiService.getMe();
      setUser(userRes.data);
      
      return { success: true, user: userRes.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      await apiService.register(name, email, password);
      // After registration, log the user in
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
