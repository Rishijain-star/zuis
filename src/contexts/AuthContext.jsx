// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function saveUserDataToLocalStorage({ token, id, name, email, role, plan }) {
  if (token) localStorage.setItem('token', token);
  if (id) localStorage.setItem('userId', id);
  if (name) localStorage.setItem('username', name);
  if (email) localStorage.setItem('email', email);
  if (role) localStorage.setItem('role', role);
  if (plan) localStorage.setItem('plan', plan);
}

function clearUserDataFromLocalStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  localStorage.removeItem('plan');
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      if (!token) {
        if (isMounted) {
          setLoading(false);
          setCurrentUser(null);
        }
        return;
      }

      try {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          const user = {
            id: response.data.data._id,
            email: response.data.data.email,
            name: response.data.data.name,
            role: response.data.data.role,
            plan: response.data.data.plan,
          };
          // Only update if user data has changed
          setCurrentUser((prev) =>
            JSON.stringify(prev) !== JSON.stringify(user) ? user : prev
          );
          saveUserDataToLocalStorage(user);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        if (isMounted) {
          clearUserDataFromLocalStorage();
          setToken(null);
          setCurrentUser(null);
          if (window.location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkUser();
    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      saveUserDataToLocalStorage({ token, ...user });
      setToken(token);
      setCurrentUser(user);
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const googleLogin = useCallback(async () => {
    try {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    } catch (error) {
      throw error;
    }
  }, []);

  const handleGoogleCallback = useCallback(
    async (token, userData) => {
      try {
        saveUserDataToLocalStorage({ token, ...userData });
        setToken(token);
        setCurrentUser((prev) =>
          JSON.stringify(prev) !== JSON.stringify(userData) ? userData : prev
        );
        navigate(userData.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } catch (error) {
        console.error('Google auth callback failed:', error);
        throw error;
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    clearUserDataFromLocalStorage();
    setToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = {
    currentUser,
    login,
    register,
    googleLogin,
    handleGoogleCallback,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext };