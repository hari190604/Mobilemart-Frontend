import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FormInput } from '../components/common/FormInput';
import './Register.css';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
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
    
    else if (name === 'acceptTerms') {
      if (!value) {
        errorMsg = 'You must accept the Terms & Conditions to proceed.';
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

    // Split Full Name into firstName and lastName for database context seeder
    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      setLoading(true);
      await register(formData.email, formData.password, firstName, lastName, formData.phoneNumber);
      setSuccessAlert('Account created successfully! Redirecting to login page...');
      
      // Delay navigation to let the user review confirmation
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setErrorAlert(err.message || 'Registration failed. Please check credentials or network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-card">
        
        {/* MobileMart Logo */}
        <Link to="/" className="register-logo-container">
          <div className="register-logo-icon">⚡</div>
          <span className="register-logo-text">MobileMart</span>
        </Link>

        <h2 className="register-heading">Create Account</h2>
        <p className="register-subheading">Join MobileMart and access modern e-commerce flagships deals.</p>

        {/* Global feedbacks */}
        {errorAlert && (
          <div className="register-alert-danger" role="alert">
            <span>⚠️</span> {errorAlert}
          </div>
        )}

        {successAlert && (
          <div className="register-alert-success" role="alert">
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

          {/* Accept Terms & Conditions */}
          <div className="terms-checkbox-wrapper">
            <label className="terms-label-container">
              <input
                type="checkbox"
                name="acceptTerms"
                className="terms-checkbox-input"
                checked={formData.acceptTerms}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              <span>
                I agree to the MobileMart <Link to="/terms" style={{ color: 'var(--accent)', fontWeight: 600 }}>Terms & Conditions</Link> and <Link to="/privacy" style={{ color: 'var(--accent)', fontWeight: 600 }}>Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <span className="terms-error-text">⚠️ {errors.acceptTerms}</span>
            )}
          </div>

          {/* Submit register */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-loader" style={{ marginRight: '8px' }} />
                Creating Account...
              </>
            ) : (
              'Register Now 🚀'
            )}
          </button>

        </form>

        <p className="text-muted text-sm font-sans" style={{ marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
