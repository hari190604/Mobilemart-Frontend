import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockProducts } from '../utils/mockProducts';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Active Tab: STATS, PRODUCTS, ORDERS, USERS
  const [activeTab, setActiveTab] = useState('STATS');

  // Admin lists states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Modals visibility toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    price: '',
    category: 'Smartphones',
    stockQuantity: '',
    description: '',
    screen: '',
    processor: '',
    camera: '',
    battery: ''
  });

  // Load inventory, order queues, and seed user lists on startup
  useEffect(() => {
    // Sync products
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      localStorage.setItem('products', JSON.stringify(mockProducts));
      setProducts(mockProducts);
    }

    // Sync orders
    const savedOrders = localStorage.getItem('orders') || '[]';
    setOrders(JSON.parse(savedOrders));

    // Seed mock users if not present
    const savedUsers = localStorage.getItem('admin_users');
    if (savedUsers) {
      setUsersList(JSON.parse(savedUsers));
    } else {
      const seededUsers = [
        { id: 1, name: 'John Customer', email: 'john@mobilemart.com', role: 'ROLE_CUSTOMER', phoneNumber: '+1234567890' },
        { id: 2, name: 'Admin Controller', email: 'admin@mobilemart.com', role: 'ROLE_ADMIN', phoneNumber: '+1112223333' },
        { id: 3, name: 'Jane Smith', email: 'jane@mobilemart.com', role: 'ROLE_CUSTOMER', phoneNumber: '+9876543210' }
      ];
      localStorage.setItem('admin_users', JSON.stringify(seededUsers));
      setUsersList(seededUsers);
    }
  }, []);

  // Guarantee Admin Role
  if (!user || !isAdmin()) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px', maxWidth: '600px', margin: '40px auto' }}>
        <span style={{ fontSize: '64px' }}>🛡️</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0', color: 'var(--danger)' }}>403 Unauthorized Access</h2>
        <p className="text-muted">You do not have administrative permissions to view store dashboards controller terminals.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: '24px' }}>
          Log In with Admin Account
        </button>
      </div>
    );
  }

  // Analytics math
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total : 0), 0);
  const lowStockItems = products.filter((p) => p.stockQuantity < 10);
  const pendingOrdersCount = orders.filter((o) => o.status === 'PAID').length;

  const handleStatusChange = (orderId, nextStatus) => {
    const updatedOrders = orders.map((o) => 
      o.orderId === orderId ? { ...o, status: nextStatus } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const id = Date.now();
    const productToAdd = {
      id,
      name: newProduct.name,
      brand: newProduct.brand,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stockQuantity: parseInt(newProduct.stockQuantity),
      description: newProduct.description,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
      rating: 5.0,
      reviewsCount: 0,
      specs: {
        Screen: newProduct.screen || '6.1 inches OLED',
        Processor: newProduct.processor || 'Fast Core Octa',
        Camera: newProduct.camera || '48 MP main',
        Battery: newProduct.battery || '4000 mAh'
      }
    };

    const updated = [productToAdd, ...products];
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
    setShowAddModal(false);
    setNewProduct({
      name: '',
      brand: '',
      price: '',
      category: 'Smartphones',
      stockQuantity: '',
      description: '',
      screen: '',
      processor: '',
      camera: '',
      battery: ''
    });
  };

  const handleEditProductSubmit = (e) => {
    e.preventDefault();
    const updated = products.map((p) => {
      if (p.id === editingProduct.id) {
        return {
          ...editingProduct,
          price: parseFloat(editingProduct.price),
          stockQuantity: parseInt(editingProduct.stockQuantity)
        };
      }
      return p;
    });
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Delete this product from catalog?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem('products', JSON.stringify(updated));
    }
  };

  const toggleUserRole = (userId) => {
    const updatedUsers = usersList.map((u) => {
      if (u.id === userId) {
        const nextRole = u.role === 'ROLE_ADMIN' ? 'ROLE_CUSTOMER' : 'ROLE_ADMIN';
        return { ...u, role: nextRole };
      }
      return u;
    });
    setUsersList(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
  };

  return (
    <div className="animate-fade-in admin-container" style={{ textAlign: 'left' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '32px' }}>Admin Dashboard Terminal</h1>
        <p className="text-muted">Manage product catalog, monitor payments, update shipping records, and manage user roles.</p>
      </div>

      {/* Tab Selectors */}
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('STATS')}
          className={`admin-tab-btn ${activeTab === 'STATS' ? 'active' : ''}`}
        >
          📊 Stats & Analytics
        </button>
        <button 
          onClick={() => setActiveTab('PRODUCTS')}
          className={`admin-tab-btn ${activeTab === 'PRODUCTS' ? 'active' : ''}`}
        >
          📱 Catalog Inventory ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('ORDERS')}
          className={`admin-tab-btn ${activeTab === 'ORDERS' ? 'active' : ''}`}
        >
          📦 Orders Registry ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('USERS')}
          className={`admin-tab-btn ${activeTab === 'USERS' ? 'active' : ''}`}
        >
          👤 User Accounts ({usersList.length})
        </button>
      </div>

      {/* 1. Analytics tab */}
      {activeTab === 'STATS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Stats Cards Grid */}
          <div className="admin-metrics">
            <div className="metric-card">
              <span style={{ fontSize: '36px' }}>💰</span>
              <h4 className="text-muted" style={{ fontSize: '13px', marginTop: '8px', fontWeight: '700' }}>TOTAL STORE SALES</h4>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--success)' }}>
                ${totalSales.toFixed(2)}
              </h2>
            </div>
            <div className="metric-card">
              <span style={{ fontSize: '36px' }}>📦</span>
              <h4 className="text-muted" style={{ fontSize: '13px', marginTop: '8px', fontWeight: '700' }}>TOTAL SYSTEM ORDERS</h4>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>
                {orders.length}
              </h2>
            </div>
            <div className="metric-card">
              <span style={{ fontSize: '36px' }}>⚠️</span>
              <h4 className="text-muted" style={{ fontSize: '13px', marginTop: '8px', fontWeight: '700' }}>LOW STOCK ALARMS</h4>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: lowStockItems.length > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                {lowStockItems.length}
              </h2>
            </div>
            <div className="metric-card">
              <span style={{ fontSize: '36px' }}>⏳</span>
              <h4 className="text-muted" style={{ fontSize: '13px', marginTop: '8px', fontWeight: '700' }}>PENDING DISPATCH</h4>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--accent)' }}>
                {pendingOrdersCount}
              </h2>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)', padding: '20px' }}>
              <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', marginBottom: '12px' }}>
                🚨 Warning: Low Stock Catalog Items
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lowStockItems.map((p) => (
                  <div key={p.id} className="flex justify-between" style={{ fontSize: '14px' }}>
                    <span>{p.name} ({p.brand})</span>
                    <span style={{ fontWeight: '700', color: 'var(--danger)' }}>Only {p.stockQuantity} remaining!</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Catalog Products Inventory Manager */}
      {activeTab === 'PRODUCTS' && (
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px' }}>Product Catalog List</h3>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
              + Add Catalog Product
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Device Info</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>In Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex align-center gap-2">
                        <div style={{ width: '40px', height: '40px', background: 'rgba(241, 245, 249, 0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <img src={p.imageUrl} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontWeight: '600' }}>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.brand}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: '700' }}>${p.price.toFixed(2)}</td>
                    <td style={{ fontWeight: '700', color: p.stockQuantity < 10 ? 'var(--danger)' : 'var(--text-main)' }}>
                      {p.stockQuantity}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingProduct(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Orders Audit Hub */}
      {activeTab === 'ORDERS' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
            System Orders Log
          </h3>

          {orders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Code</th>
                    <th>Date</th>
                    <th>Billing Address</th>
                    <th>Total Settle</th>
                    <th>Status Record</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.orderId}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{o.orderId}</td>
                      <td>{o.date}</td>
                      <td style={{ fontSize: '13px' }}>
                        {o.shippingAddress.street}, {o.shippingAddress.city}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--accent)' }}>${o.total.toFixed(2)}</td>
                      <td>
                        <select 
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                          className="form-input"
                          style={{ width: 'fit-content', padding: '6px 10px', fontSize: '13px' }}
                        >
                          <option value="PAID">PAID</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted" style={{ padding: '40px 0', textAlign: 'center' }}>
              No store checkouts processed yet.
            </p>
          )}
        </div>
      )}

      {/* 4. User Accounts manager tab */}
      {activeTab === 'USERS' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
            User Account Registries
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Permission Badge</th>
                  <th>Action Toggle</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phoneNumber}</td>
                    <td>
                      <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-warning' : 'badge-success'}`}>
                        {u.role === 'ROLE_ADMIN' ? 'Admin ⚙️' : 'Customer 👤'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleUserRole(u.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--accent)' }}
                        disabled={u.email === user.email} // Prevent admin de-privileging themselves
                      >
                        🔄 Switch Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Product Form */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card animate-fade-in">
            <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Add New Product</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-1" style={{ marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Brand *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input" 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Tablets">Tablets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1" style={{ marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Stock Quantity *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>Specifications</h4>
                <div className="grid grid-cols-2 gap-1" style={{ marginBottom: 0 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Screen</label>
                    <input type="text" className="form-input" placeholder="6.7-inch OLED" value={newProduct.screen} onChange={(e) => setNewProduct({...newProduct, screen: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Processor</label>
                    <input type="text" className="form-input" placeholder="Snapdragon 8 Gen 3" value={newProduct.processor} onChange={(e) => setNewProduct({...newProduct, processor: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1" style={{ marginTop: '8px', marginBottom: 0 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Camera</label>
                    <input type="text" className="form-input" placeholder="50MP triple lens" value={newProduct.camera} onChange={(e) => setNewProduct({...newProduct, camera: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Battery</label>
                    <input type="text" className="form-input" placeholder="5000 mAh" value={newProduct.battery} onChange={(e) => setNewProduct({...newProduct, battery: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0, marginTop: '8px' }}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="2"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="flex gap-1" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add Catalog Item
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product Form */}
      {editingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card animate-fade-in">
            <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>Edit Product details</h3>
            <form onSubmit={handleEditProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-1" style={{ marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Brand</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input" 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Tablets">Tablets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1" style={{ marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Stock Quantity *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="flex gap-1" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Product Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
