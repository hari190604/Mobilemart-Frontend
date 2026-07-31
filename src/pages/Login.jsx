import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormInput from '../components/common/FormInput';
import './Login.css';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      await login(email, password);

      // Handle "Remember Me" persistence
      if (rememberMe) {
        localStorage.setItem('mobilemart_remembered_email', email);
        localStorage.setItem('mobilemart_remember_me', 'true');
      } else {
        localStorage.removeItem('mobilemart_remembered_email');
        localStorage.setItem('mobilemart_remember_me', 'false');
      }

      // Redirect to Home page after successful login
      navigate('/');
    } catch (err) {
      setBackendError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder actions
  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Mock Action: Refresher reset link has been mock-dispatched to: ' + (email || 'your email'));
  };


  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        
        {/* MobileMart Logo */}
        <Link to="/" className="login-logo-container">
          <div className="login-logo-icon">⚡</div>
          <span className="login-logo-text">Mobile<span style={{ color: 'var(--accent)' }}>Mart</span></span>
        </Link>

        {/* Heading */}
        <h2 className="login-heading">Welcome Back</h2>
        <p className="login-subheading font-sans">Sign in to access your dashboard, orders, and cart assets.</p>

        {/* Global validation / backend errors */}
        {backendError && (
          <div className="login-alert-danger text-sm font-sans" role="alert">
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
          <div className="form-helper-row font-sans">
            <label className="remember-me-container">
              <input
                type="checkbox"
                className="remember-me-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <a 
              href="#forgot-password" 
              onClick={handleForgotPassword} 
              className="forgot-password-link"
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="btn-loader"></span> Authenticating...
              </span>
            ) : (
              'Sign In 🔑'
            )}
          </button>
        </form>

        {/* Link to register page */}
        <p className="text-muted text-sm font-sans" style={{ marginTop: '24px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '600' }}>Register Now</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
