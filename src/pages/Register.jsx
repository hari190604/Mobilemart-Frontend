import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FormInput } from '../components/common/FormInput';
import './AuthCommon.css';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [errorAlert, setErrorAlert] = useState('');
  const [successAlert, setSuccessAlert] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate individual input properties
  const validateField = (name, value) => {
    let errorMsg = '';
    
    if (name === 'fullName') {
      if (!value.trim()) {
        errorMsg = 'Full Name is required.';
      } else if (value.trim().split(' ').length < 2) {
        errorMsg = 'Please enter both your first and last name.';
      }
    } 
    
    else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        errorMsg = 'Email is required.';
      } else if (!emailRegex.test(value)) {
        errorMsg = 'Please enter a valid email address.';
      }
    } 
    
    else if (name === 'phoneNumber') {
      if (!value.trim()) {
        errorMsg = 'Phone number is required.';
      } else {
        const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
        if (!phoneRegex.test(value)) {
          errorMsg = 'Invalid phone number format. Use digits, workspaces, or dash dashes.';
        }
      }
    } 
    
    else if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required.';
      } else if (value.length < 6) {
        errorMsg = 'Password must be at least 6 characters.';
      }
    } 
    
    else if (name === 'confirmPassword') {
      if (!value) {
        errorMsg = 'Please confirm your password.';
      } else if (value !== formData.password) {
        errorMsg = 'Passwords do not match.';
      }
    } 
    
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear validation error on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    const errorMsg = validateField(name, fieldValue);
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert('');
    setSuccessAlert('');

    // Trigger full form validation
    const validationErrors = {};
    Object.keys(formData).forEach(key => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) {
        validationErrors[key] = errorMsg;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorAlert('Please resolve all validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      await register(formData.email, formData.password, formData.fullName, formData.phoneNumber, formData.confirmPassword);
      setSuccessAlert('Account created successfully! Redirecting to login page...');
      
      // Delay navigation to let the user review confirmation
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
const errorMessage =
    err?.response?.data?.message ||
    err?.message ||
    "Registration failed. Please try again.";

  setErrorAlert(errorMessage);    
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

        <h2 className="auth-heading">Create Account</h2>
        <p className="auth-subheading">Join MobileMart and start shopping smarter.</p>

        {/* Global feedbacks */}
        {errorAlert && (
          <div className="auth-alert-danger" role="alert">
            <span>⚠️</span> 
            <p className='error_alert_tag' style={{ margin:0 }}>{errorAlert}</p>
          </div>
        )}

        {successAlert && (
          <div className="auth-alert-success" role="alert">
            <span>✅</span> {successAlert}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          
          {/* Full Name */}
          <FormInput
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
            required
            disabled={loading}
          />

          {/* Email Address */}
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            required
            disabled={loading}
          />

          {/* Phone Number */}
          <FormInput
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            placeholder="+1 555 123 4567"
            value={formData.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phoneNumber}
            required
            disabled={loading}
          />

          {/* Password */}
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="•••••••• (Min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            required
            disabled={loading}
          />

          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            required
            disabled={loading}
          />

          {/* Submit register */}
          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-loader" style={{ marginRight: '8px' }} />
                Creating Account...
              </>
            ) : (
              <>Create Account <span style={{fontSize: '18px', filter:'grayscale(1)'}}>→</span></>
            )}
          </button>

        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login">
            Sign In Here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
