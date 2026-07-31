import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

/**
 * TODO: FRONTEND DEVELOPER 2 - Profile Details API Integration
 * 
 * 1. Interface with backend user info endpoint: `GET /api/v1/users/me` on load.
 * 2. Connect profile updates API endpoint: `PUT /api/v1/users/update`.
 * 3. Add validations for fields (Name length, correct phone number layout, secure password modifier inputs).
 * 4. Coordinate state context changes or sync with AuthContext hooks.
 */
export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phoneNumber: user ? user.phoneNumber : '',
    role: user ? user.role : 'ROLE_CUSTOMER'
  });

  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <span style={{ fontSize: '64px' }}>🔒</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0' }}>Access Restricted</h2>
        <p className="text-muted">You must be logged in to view your user profile details.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: '24px' }}>
          Go to Sign In
        </button>
      </div>
    );
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setError('');

    if (!profileData.name.trim()) {
      setError('Name is required.');
      return;
    }

    // Save mock updates back to Context/localStorage
    const updatedUser = {
      ...user,
      name: profileData.name,
      phoneNumber: profileData.phoneNumber
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setSaveSuccess('User profile details updated successfully!');
    
    // Auto clear success tag
    setTimeout(() => {
      setSaveSuccess('');
    }, 3000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left', maxWidth: '720px', margin: '0 auto' }}>
      
      <div>
        <h1 style={{ fontSize: '32px' }}>Account Settings</h1>
        <p className="text-muted">Update your customer profile details and manage your account settings.</p>
      </div>

      {saveSuccess && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--success)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px'
        }}>
          ✅ {saveSuccess}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--danger)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2" style={{ alignItems: 'start' }}>
        
        {/* Left Side: Avatar Card */}
        <div className="card text-center profile-avatar-card">
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--accent)',
            fontSize: '32px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {user.name.charAt(0)}
          </div>
          <h3 style={{ fontSize: '18px', textTransform: 'capitalize' }}>{user.name}</h3>
          <p className="text-muted text-sm" style={{ marginBottom: '16px' }}>{user.role === 'ROLE_ADMIN' ? '⚙️ Store Admin' : '👤 Customer Partner'}</p>
          
          <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

          <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-secondary btn-sm" style={{ width: '100%', color: 'var(--danger)' }}>
            Logout Profile
          </button>
        </div>

        {/* Right Side: Account Forms */}
        <form onSubmit={handleUpdate} className="card profile-form-card">
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Personal Profile</h3>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input 
              type="email" 
              className="form-input" 
              value={profileData.email}
              disabled
              style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email address cannot be changed after registration.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="text" 
              className="form-input" 
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', alignSelf: 'flex-start', marginTop: '10px' }}>
            Save Profile Updates 💾
          </button>
        </form>

      </div>

    </div>
  );
};
export default Profile;
