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
    
    const backendUser = response?.data?.data?.user || {};
    const actualToken = response?.data?.data?.token || response?.data?.data?.accessToken;
    
    // Map with a fallback for backwards compatibility
    const actualRole = backendUser.role || response?.data?.data?.role;
    const userData = { 
      id: backendUser.userId || response?.data?.data?.userId, 
      email, 
      name: backendUser.username || response?.data?.data?.username, 
      role: actualRole 
    };
    
    // Setup Local Profiles
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('optinova_user', JSON.stringify(userData));
    
    localStorage.setItem('token', actualToken);
    localStorage.setItem('optinova_token', actualToken);
    
    localStorage.setItem('role', actualRole);
    localStorage.setItem('optinova_role', actualRole);
    
    // Cookie mapping for session integrity 
    document.cookie = `authToken=${actualToken}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `token=${actualToken}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `role=${actualRole}; path=/; max-age=86400; SameSite=Lax`;

    setUser(userData);
    setToken(actualToken);
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
    const response = await api.post('/auth/verify-otp', { identifier: email, otp });
    
    if (response?.data?.data?.user) {
        const backendUser = response.data.data.user;
        const actualToken = response.data.data.token || response.data.data.accessToken;
        const actualRole = backendUser.role || response.data.data.role;
        
        const userData = { 
          id: backendUser.userId || response.data.data.userId, 
          email: backendUser.email || email, 
          name: backendUser.username || response.data.data.username, 
          role: actualRole 
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('optinova_user', JSON.stringify(userData));
        
        localStorage.setItem('token', actualToken);
        localStorage.setItem('optinova_token', actualToken);
        
        localStorage.setItem('role', actualRole);
        localStorage.setItem('optinova_role', actualRole);
        
        document.cookie = `authToken=${actualToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `token=${actualToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `role=${actualRole}; path=/; max-age=86400; SameSite=Lax`;

        setUser(userData);
        setToken(actualToken);
    }
    
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { identifier: email });
    return response.data;
  };

  const logout = async () => {
    try {
      if (token || localStorage.getItem('token')) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      // LocalStorage purge
      localStorage.removeItem('user');
      localStorage.removeItem('optinova_user');
      
      localStorage.removeItem('token');
      localStorage.removeItem('optinova_token');
      
      localStorage.removeItem('role');
      localStorage.removeItem('optinova_role');
      
      localStorage.removeItem('mobilemart_wishlist');
      
      // Cookie invalidations explicitly via requirements
      document.cookie = 'authToken=null; path=/; max-age=86400; SameSite=Lax';
      document.cookie = 'token=null; path=/; max-age=86400; SameSite=Lax';
      document.cookie = 'role=null; path=/; max-age=86400; SameSite=Lax';

      setUser(null);
      setToken(null);
    }
  };

  const isAdmin = () => {
    return user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, verifyOtp, forgotPassword, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
