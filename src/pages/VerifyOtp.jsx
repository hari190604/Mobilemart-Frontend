import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !otp) {
      setError('Please provide validation details.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email, otp);
      setSuccess(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex justify-center" style={{ marginTop: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px', textAlign: 'center' }}>
        
        <span style={{ fontSize: '40px' }}>✉️</span>
        <h2 style={{ fontSize: '28px', color: 'var(--text-main)', marginTop: '8px' }}>Security Verification</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Confirm your identity with the OTP code sent to your email.</p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--success)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Digit Verification Code</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 123456"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Activating Profile...' : 'Confirm OTP Code 🔒'}
          </button>

        </form>

        <div className="card" style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: 'var(--bg-main)', 
          textAlign: 'left',
          fontSize: '13px',
          boxShadow: 'none',
          border: '1px dotted var(--border)' 
        }}>
          💡 <strong>Prototyping Notice:</strong>
          <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
            Enter any 6-digit code or type `123456` to pass activation checks.
          </div>
        </div>

      </div>
    </div>
  );
};
export default VerifyOtp;
