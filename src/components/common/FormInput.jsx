import React, { useState } from 'react';
import './FormInput.css';

export const FormInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  onBlur, 
  placeholder, 
  error, 
  required = false, 
  name, 
  ...rest 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Manage password visibility toggle
  const isPasswordField = type === 'password';
  const getRenderType = () => {
    if (isPasswordField) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const renderLeftIcon = () => {
    switch (type) {
      case 'email':
        return (
          <svg className="input-left-icon" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        );
      case 'password':
        return (
          <svg className="input-left-icon" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        );
      case 'tel':
        return (
          <svg className="input-left-icon" viewBox="0 0 24 24">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        );
      default:
        return (
          <svg className="input-left-icon" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        );
    }
  };

  return (
    <div className={`form-input-container ${error ? 'has-error' : ''}`}>
      {label && (
        <label className="form-input-label" htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div className="input-field-wrapper">
        {renderLeftIcon()}
        
        <input
          id={name}
          name={name}
          type={getRenderType()}
          className="input-control"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          {...rest}
        />

        {isPasswordField && (
          <button
            type="button"
            className="input-right-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <span className="form-input-error-msg">
          <span style={{ fontSize: '11px' }}>⚠️</span> {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
