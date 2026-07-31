import React, { createContext, useState, useEffect, useContext } from 'react';

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
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulated backend check
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password.length < 6) {
          reject(new Error('Password must be at least 6 characters.'));
          return;
        }

        let userRole = 'ROLE_CUSTOMER';
        let name = 'John Customer';
        
        if (email.toLowerCase() === 'admin@mobilemart.com' || email.toLowerCase().includes('admin')) {
          userRole = 'ROLE_ADMIN';
          name = 'Admin Controller';
        }

        const mockUser = {
          email: email,
          name: name,
          role: userRole,
          phoneNumber: '+1234567890',
        };
        const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(7);

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockToken);
        setUser(mockUser);
        setToken(mockToken);
        resolve(mockUser);
      }, 800);
    });
  };

  const register = async (_email, _password, _firstName, _lastName, _phoneNumber) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Registration initiated. OTP code sent to mail.' });
      }, 800);
    });
  };

  const verifyOtp = async (email, otp) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456' || otp.length === 6) {
          resolve({ message: 'Account activated successfully.' });
        } else {
          reject(new Error('Invalid OTP code. Use 123456 for testing.'));
        }
      }, 800);
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const isAdmin = () => {
    return user && user.role === 'ROLE_ADMIN';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyOtp, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
