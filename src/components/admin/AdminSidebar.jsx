import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = ({ activeSection, setActiveSection, isCollapsed, toggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: '▦' },
    { id: 'PRODUCTS', label: 'Products', icon: '📱' },
    { id: 'USERS', label: 'Users', icon: '👥' },
    { id: 'ORDERS', label: 'Orders', icon: '📦' },
    { id: 'ANALYTICS', label: 'Analytics', icon: '📊' },
    { id: 'SETTINGS', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo brand-logo-container" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <img src="/mobilemart-logo.png" alt="Logo" className="brand-logo-img" style={{ height: '36px', marginRight: isCollapsed ? '0' : '8px' }} />
          {!isCollapsed && <span className="logo-text" style={{ fontSize: '18px' }}>Mobile<span style={{ color: 'var(--primary)' }}>Mart</span></span>}
        </div>
        {!isCollapsed && <div className="sidebar-badge">ADMIN CONSOLE</div>}
        <button className="collapse-btn" onClick={toggleCollapse}>
          {isCollapsed ? '❯' : '❮'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="admin-profile-pill">
            <div className="avatar">A</div>
            <div className="admin-info">
              <span className="admin-name">{user?.name || user?.fullName || 'Admin'}</span>
              <span className="admin-role">System Admin</span>
            </div>
          </div>
        )}
        <button className="exit-store-btn" onClick={() => { logout(); navigate('/login', { replace: true }); }}>
          <span className="btn-icon">←</span>
          {!isCollapsed && <span className="btn-text">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
