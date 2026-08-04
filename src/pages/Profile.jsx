import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import FormInput from '../components/common/FormInput';
import api from '../services/api';
import './Profile.css';

export const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab: INFO, EDIT, PASSWORD
  const [activeTab, setActiveTab] = useState('INFO');

  // Load defaults address
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    street: '123 Tech Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States'
  });

  // Password state
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Recent orders list preview
  const [recentOrders, setRecentOrders] = useState([]);

  // Form errors / validation triggers
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  const [addressId, setAddressId] = useState(null);

  useEffect(() => {
    if (user) {
      // Basic profile sync
      setProfileData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      }));

      // Fetch addresses and orders
      const fetchUserData = async () => {
        try {
          const [addrRes, orderRes] = await Promise.all([
            api.get('/addresses'),
            api.get('/orders?page=0&size=5')
          ]);

          if (addrRes.data.data && addrRes.data.data.length > 0) {
            const addr = addrRes.data.data[0];
            setAddressId(addr.addressId);
            setProfileData(prev => ({
              ...prev,
              street: addr.streetAddress,
              city: addr.city,
              state: addr.state,
              zipCode: addr.postalCode,
              country: addr.country
            }));
          }

          if (orderRes.data && orderRes.data.orders && orderRes.data.orders.products) {
            setRecentOrders(orderRes.data.orders.products);
          } else if (orderRes.data && orderRes.data.data && orderRes.data.data.content) {
            setRecentOrders(orderRes.data.data.content); // Fallback for old paginated style if needed
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      };

      fetchUserData();
    }
  }, [user]);

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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setError('');

    if (!profileData.name.trim()) {
      setError('Name is required.');
      return;
    }

    try {
      const addressPayload = {
        fullName: profileData.name,
        mobileNumber: profileData.phoneNumber || '+1234567890',
        streetAddress: profileData.street,
        city: profileData.city,
        state: profileData.state,
        postalCode: profileData.zipCode,
        country: profileData.country,
        isDefault: true
      };

      if (addressId) {
        await api.put(`/addresses/${addressId}`, addressPayload);
      } else {
        const res = await api.post('/addresses', addressPayload);
        setAddressId(res.data.data.addressId);
      }

      const updatedUser = {
        ...user,
        name: profileData.name,
        phoneNumber: profileData.phoneNumber
      };
      
      setUser(updatedUser);
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setError('');

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword,
        confirmPassword: passwordState.confirmPassword
      });

      setSaveSuccess('Password changed successfully!');
      setPasswordState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Make sure it contains uppercase, lowercase, number, and special character.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '32px' }}>User Settings Dashboard</h1>
        <p className="text-muted">View profile details, update address credentials, and secure your account credentials.</p>
      </div>

      {/* Save alerts */}
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

      {/* Main split grid */}
      <div className="profile-dashboard">
        
        {/* Left: Sidebar card */}
        <div className="profile-sidebar">
          
          <div className="profile-avatar-container">
            <div className="profile-avatar-img">
              {profileData.name.charAt(0)}
            </div>
            <h3 style={{ fontSize: '18px', textTransform: 'capitalize', color: 'var(--text-main)' }}>{profileData.name}</h3>
            <span className="badge badge-warning" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
              {user.role === 'ROLE_ADMIN' ? '⚙️ Store Admin' : '👤 Customer Partner'}
            </span>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

          {/* Navigation selectors */}
          <div className="profile-menu">
            <button 
              onClick={() => { setActiveTab('INFO'); setError(''); setSaveSuccess(''); }}
              className={`profile-menu-item ${activeTab === 'INFO' ? 'active' : ''}`}
            >
              👤 Profile Summary
            </button>
            <button 
              onClick={() => { setActiveTab('EDIT'); setError(''); setSaveSuccess(''); }}
              className={`profile-menu-item ${activeTab === 'EDIT' ? 'active' : ''}`}
            >
              ✏️ Edit Profile Info
            </button>
            <button 
              onClick={() => { setActiveTab('PASSWORD'); setError(''); setSaveSuccess(''); }}
              className={`profile-menu-item ${activeTab === 'PASSWORD' ? 'active' : ''}`}
            >
              🔒 Change Password
            </button>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

          <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-secondary btn-sm" style={{ width: '100%', color: 'var(--danger)' }}>
            Logout Profile
          </button>

        </div>

        {/* Right: Active Tab Forms/Displays */}
        <div className="profile-content">
          
          {activeTab === 'INFO' && (
            <div className="card" style={{ padding: '24px' }}>
              <div className="profile-card-header">
                <h3 style={{ fontSize: '20px' }}>Profile Details</h3>
                <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>General credentials registered on your MobileMart account.</p>
              </div>

              <div className="profile-details-grid">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <span className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>FULL NAME</span>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>{profileData.name}</div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <span className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>EMAIL ADDRESS</span>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>{profileData.email}</div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <span className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>CONTACT PHONE</span>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>{profileData.phoneNumber || 'Not specified'}</div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <span className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>DELIVERY LOCATION</span>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)', marginTop: '4px', lineHeight: '1.4' }}>
                    {profileData.street}, {profileData.city},<br />
                    {profileData.state} {profileData.zipCode}, {profileData.country}
                  </div>
                </div>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

              <div>
                <h4 style={{ fontSize: '16px', marginBottom: '16px' }}>📦 Recent Checkouts</h4>
                {recentOrders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentOrders.map((o, idx) => (
                      <div key={`${o.order_id}-${idx}`} className="flex justify-between align-center" style={{ padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{o.order_id}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px' }}>{o.order_date ? new Date(o.order_date).toLocaleDateString() : o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: '700' }}>₹{(o.total_price || o.totalAmount || 0).toFixed(2)}</span>
                          <span style={{ fontSize: '12px', color: (o.order_status || o.status) === 'SUCCESS' ? 'var(--success)' : 'var(--warning)', fontWeight: 'bold', marginLeft: '6px' }}>{o.order_status || o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize: '14px' }}>No purchase transactions completed yet.</p>
                )}
              </div>

            </div>
          )}

          {activeTab === 'EDIT' && (
            <form onSubmit={handleProfileUpdate} className="card" style={{ padding: '24px' }}>
              <div className="profile-card-header">
                <h3 style={{ fontSize: '20px' }}>Edit Profile Information</h3>
                <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Modify billing parameters and shipping locations.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FormInput 
                  label="Full Name"
                  name="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  required
                />

                <FormInput 
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                />

                <div style={{ borderTop: '1px solid var(--border)', paddingComposite: '20px 0', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '16px', margin: '16px 0 12px 0' }}>📍 Shipping Address Defaults</h4>
                  
                  <FormInput 
                    label="Street Address"
                    name="street"
                    type="text"
                    value={profileData.street}
                    onChange={(e) => setProfileData({...profileData, street: e.target.value})}
                    required
                  />

                  <div className="grid grid-cols-2 gap-1" style={{ marginBottom: 0 }}>
                    <FormInput 
                      label="City"
                      name="city"
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      required
                    />
                    <FormInput 
                      label="State"
                      name="state"
                      type="text"
                      value={profileData.state}
                      onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1" style={{ marginBottom: 0 }}>
                    <FormInput 
                      label="ZIP / Postal Code"
                      name="zipCode"
                      type="text"
                      value={profileData.zipCode}
                      onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                      required
                    />
                    <FormInput 
                      label="Country"
                      name="country"
                      type="text"
                      value={profileData.country}
                      onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', alignSelf: 'flex-start', marginTop: '10px' }}>
                  Save Profile Updates 💾
                </button>
              </div>
            </form>
          )}

          {activeTab === 'PASSWORD' && (
            <form onSubmit={handlePasswordChange} className="card" style={{ padding: '24px' }}>
              <div className="profile-card-header">
                <h3 style={{ fontSize: '20px' }}>Security Settings</h3>
                <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Update security credentials and password tags.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FormInput 
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordState.currentPassword}
                  onChange={(e) => setPasswordState({...passwordState, currentPassword: e.target.value})}
                  required
                />

                <FormInput 
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState({...passwordState, newPassword: e.target.value})}
                  required
                />

                <FormInput 
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordState.confirmPassword}
                  onChange={(e) => setPasswordState({...passwordState, confirmPassword: e.target.value})}
                  required
                />

                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', alignSelf: 'flex-start', marginTop: '10px' }}>
                  Change Secure Password 🔐
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
