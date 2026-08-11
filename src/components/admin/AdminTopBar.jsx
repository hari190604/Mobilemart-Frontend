import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminTopBar.css';

const AdminTopBar = ({ activeSection }) => {
  const { user } = useAuth();
  
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'PRODUCTS': return 'Product Directory & Inventory';
      case 'USERS': return 'User Management & Roles';
      case 'ORDERS': return 'Order Fulfillment & History';
      case 'ANALYTICS': return 'Business Revenue & Metrics';
      case 'SETTINGS': return 'System Settings & Config';
      default: return 'Administration Overview';
    }
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <h2>{getSectionTitle()}</h2>
        <div className="topbar-breadcrumb">
          <span>MobileMart Admin</span>
          <span className="separator">/</span>
          <span className="current">{activeSection.charAt(0) + activeSection.slice(1).toLowerCase()}</span>
        </div>
      </div>
      
      <div className="topbar-right">
        <div className="system-status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
        
        <div className="topbar-divider"></div>
        
        <button className="icon-btn notification-btn">
          🔔
          <span className="notif-badge">3</span>
        </button>
        
        <div className="topbar-profile">
          <div className="avatar-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="dropdown-icon">▼</span>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
