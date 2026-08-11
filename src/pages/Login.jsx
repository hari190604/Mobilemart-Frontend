import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormInput from '../components/common/FormInput';
import './AuthCommon.css';

export const Login = () => {
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.from?.pathname + (location.state?.from?.hash || '') || '/';
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [backendError, setBackendError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prefill email if "Remember Me" was previously selected
  useEffect(() => {
    const savedEmail = localStorage.getItem('mobilemart_remembered_email');
    const isRemembered = localStorage.getItem('mobilemart_remember_me') === 'true';
    if (isRemembered && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Format validation helpers
  const validateEmail = (val) => {
    if (!val.trim()) {
      return 'Email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required.';
    }
    if (val.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  };

  // Input change state sync handlers
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
    }
  };

  // Blur validation handlers
  const handleEmailBlur = () => {
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');

    // Pre-submit validation scan
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }

    try {
      setLoading(true);
      const userData = await login(email, password);

      // Handle "Remember Me" persistence
      if (rememberMe) {
        localStorage.setItem('mobilemart_remembered_email', email);
        localStorage.setItem('mobilemart_remember_me', 'true');
      } else {
        localStorage.removeItem('mobilemart_remembered_email');
        localStorage.setItem('mobilemart_remember_me', 'false');
      }

      // Route completely decoupled paths depending on Role
      if (userData?.role === 'ROLE_ADMIN' || userData?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate(returnUrl, { replace: true });
      }
    } catch (err) {
      setBackendError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder actions
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setBackendError('');
    
    if (!email) {
      setBackendError('Please enter your Email Address below to request a verification OTP.');
      return;
    }
    
    try {
      setLoading(true);
      await forgotPassword(email);
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setBackendError(err?.response?.data?.message || err.message || 'Failed to dispatch verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-abstract-phone"></div>
      
      <div className="auth-card">
        
        {/* MobileMart Logo */}
        <Link to="/" className="auth-logo-container brand-logo-container">
          <img src="/mobilemart-logo.png" alt="MobileMart Logo" className="brand-logo-img" style={{ height: '72px', marginBottom: '16px' }} />
        </Link>

        {/* Heading */}
        <h2 className="auth-heading">Welcome Back</h2>
        <p className="auth-subheading">Sign in to access your dashboard, orders, and cart assets.</p>

        {/* Global validation / backend errors */}
        {backendError && (
          <div className="auth-alert-danger" role="alert">
            <span>⚠️</span> {backendError}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} noValidate>
          
          {/* Email input field */}
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="e.g. customer@mobilemart.com"
            error={errors.email}
            required
            autoComplete="email"
          />

          {/* Password input field */}
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            placeholder="••••••••"
            error={errors.password}
            required
            autoComplete="current-password"
          />

          {/* Remember Me and Forgot Password Group */}
          <div className="auth-helper-row">
            <label className="auth-remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <a 
              href="#forgot-password" 
              onClick={handleForgotPassword} 
              className="auth-forgot-link"
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-primary-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-loader"></span> Authenticating...
              </>
            ) : (
              <>Sign In <span style={{fontSize: '18px', filter:'grayscale(1)'}}>→</span></>
            )}
          </button>
        </form>

        {/* Link to register page */}
        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Register Now</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
