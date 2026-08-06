import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (activeModal === 'VIEW_USERS' || activeModal === 'MODIFY_USER') {
      fetchUsers();
    }
    if (activeModal === 'ADD_PRODUCT') {
      fetchCategories();
    }
    if (activeModal === 'DELETE_PRODUCT') {
      fetchProducts();
    }
  }, [activeModal]);

  // Modal UI Effects (Scroll lock & Escape Key)
  useEffect(() => {
    if (!activeModal) return;

    // Body scroll locking
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // ESC key mapping
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveModal(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load users from the server. Check your backend status.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/public/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/public/products?size=1000');
      // Backend paginated responses wrap items inside "content"
      setProducts(res.data.data.content || res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAnalytics = async (type) => {
    setLoading(true);
    setAnalyticsData(null);
    try {
      const res = await api.get(`/admin/revenue/${type}`);
      setAnalyticsData(res.data.data);
      setActiveModal('ANALYTICS');
    } catch (err) {
      setSystemAlert('Failed to load ' + type + ' analytics.');
      setTimeout(() => setSystemAlert(null), 3000);
      setActiveModal('ANALYTICS');
      // For fallback empty rendering rather than a complete blockout
      setAnalyticsData({
          period: type.toUpperCase(),
          label: "Error generating analytics",
          totalRevenue: 0,
          totalOrders: 0,
          totalUnitsSold: 0,
          orders: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className="admin-lock-screen" style={{ textAlign:'center', marginTop:'100px' }}>
        <span style={{ fontSize: '64px' }}>🛡️</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0', color: 'var(--danger)' }}>Administrator Access Required</h2>
        <p className="text-muted">You do not have administrative permissions.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: '24px' }}>
          Verify Credentials
        </button>
      </div>
    );
  }

  const showToast = (msg) => {
    setSystemAlert(msg);
    setTimeout(() => setSystemAlert(null), 3000);
  };

  const AddProductModal = () => {
    const [formData, setFormData] = useState({ name: '', categoryId: '', price: '', stock: '', imageUrl: '', description: '' });
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          categoryId: parseInt(formData.categoryId),
          imageUrls: formData.imageUrl ? [formData.imageUrl] : []
        };
        await api.post('/admin/products', payload);
        showToast("Product successfully added to catalog!");
        setActiveModal(null);
        fetchProducts(); // refresh products in background
      } catch (err) {
        alert("Failed to add product: " + err.response?.data?.message);
      }
    };

    return (
      <div className="admin-modal-overlay">
        <div className="admin-modal-content" style={{ maxWidth: '800px' }}>
          <div className="admin-modal-header">
            <h3>➕ Add New Product</h3>
            <button type="button" className="admin-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">×</button>
          </div>
          <div className="admin-modal-body">
            <form onSubmit={handleSubmit} className="admin-add-product-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-control" placeholder="e.g. iPhone 16 Plus" />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="form-control">
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="form-control" placeholder="e.g. 79999" />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="form-control" placeholder="e.g. 1500" />
                </div>

                <div className="form-group full-width">
                  <label>Image URL</label>
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="form-control" placeholder="https://example.com/image.png" />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-control" rows="4" placeholder="Full product features and description..." />
                </div>
              </div>
              
              <div className="form-actions mt-4">
                <button type="submit" className="btn btn-primary w-100">Publish Product</button>
                <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => setActiveModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const DeleteProductModal = () => {
    
    const handleDelete = async (id) => {
      if(window.confirm('Are you sure you want to delete this product?')) {
        try {
          await api.delete(`/admin/products/${id}`);
          showToast("Product deleted safely.");
          fetchProducts();
        } catch (err) {
          alert("Failed to delete. It might be tied to historical orders.");
        }
      }
    };

    return (
      <div className="admin-modal-overlay" onClick={() => setActiveModal(null)}>
        <div className="admin-modal-content" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h3>🗑️ Manage / Delete Products</h3>
            <button type="button" className="admin-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">×</button>
          </div>
          <div className="admin-modal-body">
            <div className="data-table-container">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Stock</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>
                  {products.length === 0 ? <tr><td colSpan="7" className="text-center py-4 text-muted">No products found in the catalog.</td></tr> :
                  products.map(p => (
                    <tr key={p.productId}>
                      <td>{p.productId}</td>
                      <td>
                        <img src={p.images && p.images.length > 0 ? p.images[0].imageUrl : "https://via.placeholder.com/50x50"} alt={p.name} style={{ width: '40px', height: '40px', objectFit:'cover', borderRadius:'4px' }}/>
                      </td>
                      <td>{p.name}</td>
                      <td>{p.category?.categoryName || 'N/A'}</td>
                      <td>{p.stock}</td>
                      <td>₹{p.price?.toLocaleString()}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.productId)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ViewUsersModal = () => (
    <div className="admin-modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="admin-modal-content" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>👥 View User Directory</h3>
          <button type="button" className="admin-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">×</button>
        </div>
        <div className="admin-modal-body">
          <div className="data-table-container">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {users.length === 0 ? <tr><td colSpan="5" className="text-center py-4 text-muted">No registered users found.</td></tr> : 
                  users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td><td>{u.fullName}</td><td>{u.email}</td>
                    <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.enabled ? 'active' : 'disabled'}`}>{u.enabled ? 'Active' : 'Disabled'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const ModifyUserModal = () => {
    const handleUpdate = async (id, currentRole, currentEnabled) => {
      const nextRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
      const nextStatus = !currentEnabled;
      
      const roleChoice = window.confirm(`Change role to ${nextRole}? Select OK for Role change, Cancel to skip.`);
      const statusChoice = window.confirm(`Toggle access to ${nextStatus ? 'Active' : 'Disabled'}? Select OK to confirm, Cancel to skip.`);
      
      try {
        await api.put(`/admin/users/${id}`, { 
          role: roleChoice ? nextRole : currentRole, 
          enabled: statusChoice ? nextStatus : currentEnabled 
        });
        showToast("User updated successfully!");
        fetchUsers();
      } catch (err) {
        alert("Failed to update user.");
      }
    };

    return (
      <div className="admin-modal-overlay" onClick={() => setActiveModal(null)}>
        <div className="admin-modal-content" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h3>⚙️ Modify Users</h3>
            <button type="button" className="admin-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">×</button>
          </div>
          <div className="admin-modal-body">
            <div className="data-table-container">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.length === 0 ? <tr><td colSpan="4" className="text-center py-4 text-muted">No registered users found.</td></tr> : 
                  users.map(u => (
                    <tr key={u.id}>
                      <td>{u.fullName}<br/><small className="text-muted">{u.email}</small></td>
                      <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                      <td><span className={`badge ${u.enabled ? 'active' : 'disabled'}`}>{u.enabled ? 'Active' : 'Disabled'}</span></td>
                      <td><button className="btn btn-primary btn-sm" onClick={() => handleUpdate(u.id, u.role, u.enabled)}>Modify Settings</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BusinessAnalyticsModal = () => {
    if (!analyticsData) return null;
    return (
      <div className="admin-modal-overlay" onClick={() => setActiveModal(null)}>
        <div className="admin-modal-content analytics-modal" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h3>📈 {analyticsData.period} BUSINESS PERFORMANCE</h3>
            <button type="button" className="admin-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">×</button>
          </div>
          
          <div className="admin-modal-body">
            <div className="analytics-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <span className="analytics-date">📅 Date: {analyticsData.label}</span>
            </div>
            
            <div className="analytics-metrics-grid mt-3">
              <div className="metric-box">
                <h4>Total Revenue</h4>
                <h2>₹{analyticsData.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2}) || 0}</h2>
              </div>
              <div className="metric-box">
                <h4>Total Orders</h4>
                <h2>{analyticsData.totalOrders || 0}</h2>
              </div>
              <div className="metric-box">
                <h4>Total Units Sold</h4>
                <h2>{analyticsData.totalUnitsSold || 0}</h2>
              </div>
            </div>

            <h4 className="mt-4 mb-2">Sold Products & Checkout Orders</h4>
            <div className="analytics-orders-list">
              {(!analyticsData.orders || analyticsData.orders.length === 0) ? <p className="text-muted py-4 text-center">No successful transactions for this period.</p> :
                analyticsData.orders.map(order => (
                  <div key={order.orderId} className="analytics-order-card">
                    <div className="order-header">
                      <span><strong>Order:</strong> #{order.orderId}</span>
                      <span>{order.purchaseDate}</span>
                    </div>
                    <p className="customer-info" style={{ marginBottom: '10px' }}>Customer: {order.customerName} | <span style={{ color: 'var(--success)', fontWeight:'bold' }}>✓ SUCCESS</span></p>
                    
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                        <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.productName} style={{ width:'45px', height:'45px', objectFit:'cover', borderRadius:'4px' }}/>
                        <div className="item-meta" style={{ flexGrow: 1 }}>
                          <strong>{item.productName}</strong><br/>
                          <small>{item.brand}</small>
                        </div>
                        <div className="item-price" style={{ textAlign: 'right' }}>
                          Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString()}<br/>
                          <strong>Total: ₹{item.totalLinePrice?.toLocaleString()}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-container animate-fade-in">
      {systemAlert && <div className="admin-global-toast">{systemAlert}</div>}
      
      <div className="admin-header-strip">
        <h3>🏢 MobileMart Administration Console</h3>
        <div className="admin-header-actions">
          <span>Logged in as: <strong>{user?.name || user?.fullName}</strong></span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>Exit to Store</button>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-card blue-gradient" onClick={() => setActiveModal('ADD_PRODUCT')}>
          <div className="card-icon">➕📱</div>
          <h3>Add Product</h3>
          <p>Product Management</p>
        </div>
        
        <div className="admin-card red-gradient" onClick={() => setActiveModal('DELETE_PRODUCT')}>
          <div className="card-icon">🗑️📱</div>
          <h3>Delete / Manage</h3>
          <p>Product Management</p>
        </div>

        <div className="admin-card green-gradient" onClick={() => setActiveModal('VIEW_USERS')}>
          <div className="card-icon">👥</div>
          <h3>View Users</h3>
          <p>User Management</p>
        </div>

        <div className="admin-card purple-gradient" onClick={() => setActiveModal('MODIFY_USER')}>
          <div className="card-icon">⚙️👤</div>
          <h3>Modify User</h3>
          <p>User Management</p>
        </div>

        <div className="admin-card dark-gradient" onClick={() => loadAnalytics('daily')}>
          <div className="card-icon">📊</div>
          <h3>Daily Business</h3>
          <p>Analytics</p>
        </div>

        <div className="admin-card dark-gradient" onClick={() => loadAnalytics('monthly')}>
          <div className="card-icon">📈</div>
          <h3>Monthly Business</h3>
          <p>Analytics</p>
        </div>

        <div className="admin-card dark-gradient" onClick={() => loadAnalytics('yearly')}>
          <div className="card-icon">📅</div>
          <h3>Yearly Business</h3>
          <p>Analytics</p>
        </div>

        <div className="admin-card dark-gradient" onClick={() => loadAnalytics('overall')}>
          <div className="card-icon">🌐</div>
          <h3>Overall Business</h3>
          <p>Analytics</p>
        </div>
      </div>

      {loading && <div className="admin-global-loader" style={{ textAlign:'center', marginTop:'20px' }}>Processing metrics...</div>}
      {activeModal === 'ADD_PRODUCT' && <AddProductModal />}
      {activeModal === 'DELETE_PRODUCT' && <DeleteProductModal />}
      {activeModal === 'VIEW_USERS' && <ViewUsersModal />}
      {activeModal === 'MODIFY_USER' && <ModifyUserModal />}
      {activeModal === 'ANALYTICS' && <BusinessAnalyticsModal />}
    </div>
  );
};

export default AdminDashboard;
