import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      // Fetch latest profile to ensure token is still valid
      api.get('/users/profile')
        .then(response => {
          const freshUser = { ...JSON.parse(savedUser), ...response.data.data };
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch(() => {
          logout();
        });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { identifier:email, password });
    const { token, userId, username, role } = response?.data?.data;
    const userData = { id: userId, email, name: username, role: role };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setToken(token);
    return userData;
  };

  const register = async (email, password, fullName, mobileNumber, confirmPassword) => {
    // Generate a username from the email
    const username = email.split('@')[0];
    
    const response = await api.post('/auth/register', { 
      username,
      fullName,
      mobileNumber,
      email, 
      password,
      confirmPassword
    });
    return response.data;
  };

  const verifyOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const isAdmin = () => {
    return user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, verifyOtp, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
