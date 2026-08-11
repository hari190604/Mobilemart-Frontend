import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopBar from '../components/admin/AdminTopBar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [activeSection, setActiveSection] = useState('DASHBOARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(false);
  const [currentRange, setCurrentRange] = useState('30d');
  
  const [summaryData, setSummaryData] = useState({ revenue: 0, orders: 0 });
  const [loading, setLoading] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Initial silent loads for Dashboard summary
    fetchProducts();
    fetchUsers();
    
    // Silently fetch overall analytics for the hero stat cards
    api.get('/admin/revenue/overall').then(res => {
        setSummaryData({
            revenue: res.data.data?.totalRevenue || 0,
            orders: res.data.data?.totalOrders || 0
        });
    }).catch(err => console.error("Initial analytics load failed", err));
  }, []);

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

  const loadAnalytics = async (range) => {
    setLoading(true);
    setAnalyticsError(false);
    setCurrentRange(range);
    setAnalyticsData(null);
    try {
      const res = await api.get(`/admin/revenue?range=${range}`);
      setAnalyticsData(res.data.data);
      if (activeModal !== 'ANALYTICS') setActiveModal('ANALYTICS');
    } catch (err) {
      setSystemAlert('Failed to load analytics.');
      setAnalyticsError(true);
      if (activeModal !== 'ANALYTICS') setActiveModal('ANALYTICS');
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
    const [formData, setFormData] = useState({ name: '', categoryId: '', price: '', stock: '', imageUrl: '', description: '', featured: false, displayPriority: 0 });
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          categoryId: parseInt(formData.categoryId),
          imageUrls: formData.imageUrl ? [formData.imageUrl] : [],
          featured: formData.featured,
          displayPriority: parseInt(formData.displayPriority) || 0
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

                <div className="form-group">
                  <label>Display Priority</label>
                  <input type="number" value={formData.displayPriority} onChange={e => setFormData({...formData, displayPriority: e.target.value})} className="form-control" placeholder="1 = High, 2, 3..." />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'column' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                    Flag as Featured Product
                  </label>
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

    const handleToggleFeatured = async (product) => {
      try {
        const payload = {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.category.categoryId,
          imageUrls: product.images ? product.images.map(i => i.imageUrl) : [],
          featured: !product.featured, // flip it
          displayPriority: product.displayPriority || 0
        };
        await api.put(`/admin/products/${product.productId}`, payload);
        showToast(`Product ${!product.featured ? 'Featured' : 'Unfeatured'}`);
        fetchProducts();
      } catch (err) {
        alert("Failed to update featured status.");
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
                <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Stock</th><th>Price</th><th>Featured</th><th>Action</th></tr></thead>
                <tbody>
                  {products.length === 0 ? <tr><td colSpan="8" className="text-center py-4 text-muted">No products found in the catalog.</td></tr> :
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
                      <td>
                        <button 
                          className={`btn btn-sm ${p.featured ? 'btn-primary' : 'btn-secondary'}`} 
                          onClick={() => handleToggleFeatured(p)}
                          style={{ minWidth: '80px', padding: '4px 10px' }}
                        >
                          {p.featured ? '★ Yes' : 'No'}
                        </button>
                      </td>
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
    const [selectedMetric, setSelectedMetric] = useState('REVENUE');

    const handleRetry = () => {
       loadAnalytics(currentRange);
    };

    const renderChart = () => {
       if (analyticsError) {
          return (
             <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--danger)' }}>
                 <h4>Unable to load analytics data.</h4>
                 <button className="btn btn-secondary mt-3" onClick={handleRetry}>Retry Connection</button>
             </div>
          );
       }
       if (!analyticsData || !analyticsData.graphData || analyticsData.graphData.length === 0) {
          return (
             <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                 <h4>No transaction data available yet.</h4>
             </div>
          );
       }

       // Map strictly requested variables to y-axes dynamically
       let dataKey = 'revenue';
       let colorStr = '#3b82f6';
       let formatterStr = (val) => [`₹${val.toLocaleString()}`, 'Revenue'];
       
       if (selectedMetric === 'ORDERS') {
           dataKey = 'ordersCount';
           colorStr = '#06b6d4';
           formatterStr = (val) => [`${val} Units`, 'Total Orders'];
       } else if (selectedMetric === 'UNITS') {
           dataKey = 'unitsSold';
           colorStr = '#10b981';
           formatterStr = (val) => [`${val} Units`, 'Units Sold'];
       }

       const CustomTooltip = ({ active, payload, label }) => {
          if (active && payload && payload.length) {
             const data = payload[0].payload;
             return (
               <div style={{
                 background: 'var(--bg-card)', border: '1px solid var(--border)',
                 padding: '12px', borderRadius: '8px', fontSize: '13px',
                 boxShadow: '0 8px 16px rgba(0,0,0,0.5)', color: 'var(--text-main)', zIndex: 10
               }}>
                 <div style={{ color: 'var(--text-muted)', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                    📅 {label}
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'4px' }}>
                   <span>💰 Revenue:</span> <strong style={{color: '#3b82f6'}}>₹{data.revenue?.toLocaleString() || 0}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'4px' }}>
                   <span>🛒 Orders:</span> <strong>{data.ordersCount || 0}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span>📦 Units Sold:</span> <strong>{data.unitsSold || 0}</strong>
                 </div>
               </div>
             );
          }
          return null;
       };

       return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.graphData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorStr} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={colorStr} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickFormatter={(val) => selectedMetric === 'REVENUE' ? `₹${val>=1000 ? (val/1000)+'k' : val}` : val} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey={dataKey} stroke={colorStr} fillOpacity={1} fill="url(#colorMetric)" strokeWidth={3} activeDot={{ r: 6, fill: 'var(--bg-card)', stroke: colorStr, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
       );
    };

    return (
      <div className="admin-modal-overlay" onClick={() => setActiveModal(null)}>
        <div className="admin-modal-content analytics-modal" style={{ maxWidth: '1000px', width: '95%' }} onClick={e => e.stopPropagation()}>
          <div className="admin-modal-header" style={{ borderBottom: 'none' }}>
            <div>
              <h3>📈 {analyticsData ? analyticsData.period : 'BUSINESS ANALYTICS'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Track revenue, orders and units sold over time</p>
            </div>
            <button type="button" className="admin-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">×</button>
          </div>
          
          <div className="admin-modal-body" style={{ paddingTop: 0 }}>
            {/* Header controls layout */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
              <div className="time-range-filters" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding:'4px', borderRadius:'8px' }}>
                 {['7d', '30d', '90d', '1y', 'lifetime'].map(r => (
                    <button key={r} onClick={() => loadAnalytics(r)} className="btn btn-sm" style={{ 
                        background: currentRange === r ? 'var(--primary)' : 'transparent', 
                        border: 'none', 
                        color: currentRange === r ? '#fff' : 'var(--text-muted)',
                        fontWeight: currentRange === r ? 'bold' : 'normal'
                    }}>
                       {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : r === '1y' ? '1 Year' : 'Lifetime'}
                    </button>
                 ))}
              </div>
              
              <div className="metric-toggles" style={{ display: 'flex', gap: '8px' }}>
                 <button onClick={() => setSelectedMetric('REVENUE')} className={`btn btn-sm ${selectedMetric === 'REVENUE' ? 'btn-primary' : 'btn-secondary'}`}>Revenue</button>
                 <button onClick={() => setSelectedMetric('ORDERS')} className={`btn btn-sm ${selectedMetric === 'ORDERS' ? 'btn-primary' : 'btn-secondary'}`}>Orders</button>
                 <button onClick={() => setSelectedMetric('UNITS')} className={`btn btn-sm ${selectedMetric === 'UNITS' ? 'btn-primary' : 'btn-secondary'}`}>Units Sold</button>
              </div>
            </div>
            
            {loading && !analyticsData && !analyticsError ? (
               <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner">Analyzing vectors...</div>
               </div>
            ) : (
               <>
                 <div className="analytics-metrics-grid mt-3 mb-4">
                   <div className="metric-box">
                     <h4>Total Revenue</h4>
                     <h2>₹{analyticsData?.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2}) || 0}</h2>
                   </div>
                   <div className="metric-box">
                     <h4>Total Orders</h4>
                     <h2>{analyticsData?.totalOrders || 0}</h2>
                   </div>
                   <div className="metric-box">
                     <h4>Total Units Sold</h4>
                     <h2>{analyticsData?.totalUnitsSold || 0}</h2>
                   </div>
                 </div>

                 {/* Dynamic React SVG Graphical Matrix */}
                 <div className="analytics-graph-container mt-4" style={{ 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    backdropFilter: 'blur(24px)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '24px', 
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                 }}>
                    <h4 className="mb-4" style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Revenue & Transaction Analytics</h4>
                    {renderChart()}
                 </div>

                 <h4 className="mt-4 mb-2">Selected Range Transactions & Orders</h4>
                 <div className="analytics-orders-list">
                   {(!analyticsData || !analyticsData.orders || analyticsData.orders.length === 0) ? <p className="text-muted py-4 text-center">No successful transactions mapped in this timeframe.</p> :
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
                               <small>{item.category}</small>
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
               </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    if (section === 'PRODUCTS') setActiveModal('DELETE_PRODUCT');
    else if (section === 'USERS') setActiveModal('VIEW_USERS');
    else if (section === 'ORDERS') setActiveModal('VIEW_USERS'); // fallback until complete orders mapped
    else if (section === 'ANALYTICS') loadAnalytics('overall');
  };

  return (
    <div className="admin-layout-wrapper">
      {systemAlert && <div className="admin-global-toast">{systemAlert}</div>}
      
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionClick} 
        isCollapsed={isSidebarCollapsed} 
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <main className="admin-main-view">
        <AdminTopBar activeSection={activeSection} />
        
        <div className="admin-content-inner animate-fade-in">
          
          {/* Quick Stats Overview */}
          <div className="admin-overview-stats">
            <div className="stat-card blue-glow">
              <span className="stat-icon">💰</span>
              <div className="stat-info">
                <h4>Total Revenue</h4>
                <h2>₹{summaryData.revenue.toLocaleString()}</h2>
              </div>
            </div>
            <div className="stat-card cyan-glow">
              <span className="stat-icon">📦</span>
              <div className="stat-info">
                <h4>Total Orders</h4>
                <h2>{summaryData.orders}</h2>
              </div>
            </div>
            <div className="stat-card green-glow">
              <span className="stat-icon">📱</span>
              <div className="stat-info">
                <h4>Available Products</h4>
                <h2>{products.length}</h2>
              </div>
            </div>
            <div className="stat-card purple-glow">
              <span className="stat-icon">👥</span>
              <div className="stat-info">
                <h4>Registered Users</h4>
                <h2>{users.length}</h2>
              </div>
            </div>
          </div>

          <h3 className="section-label mt-4 mb-3">Quick Management Controls</h3>
          
          <div className="admin-dashboard-grid">
            <div className="admin-card blue-gradient" onClick={() => setActiveModal('ADD_PRODUCT')}>
              <div className="card-icon">➕</div>
              <div className="card-body">
                <h3>Add Product</h3>
                <p>Register new inventory to the database</p>
              </div>
            </div>
            
            <div className="admin-card cyan-gradient" onClick={() => setActiveModal('DELETE_PRODUCT')}>
              <div className="card-icon">⚙️</div>
              <div className="card-body">
                <h3>Manage Products</h3>
                <p>Edit or securely delete products</p>
              </div>
            </div>

            <div className="admin-card green-gradient" onClick={() => setActiveModal('VIEW_USERS')}>
              <div className="card-icon">👥</div>
              <div className="card-body">
                <h3>View Users</h3>
                <p>Monitor registered platform users</p>
              </div>
            </div>

            <div className="admin-card purple-gradient" onClick={() => setActiveModal('MODIFY_USER')}>
              <div className="card-icon">🛡️</div>
              <div className="card-body">
                <h3>Modify Access</h3>
                <p>Manage system roles and blocks</p>
              </div>
            </div>

            <div className="admin-card dark-gradient" onClick={() => loadAnalytics('30d')} style={{ gridColumn: 'span 1' }}>
              <div className="card-icon">📊</div>
              <div className="card-body">
                <h3>Business Analytics</h3>
                <p>Track overall revenue metrics</p>
              </div>
            </div>
          </div>

          {loading && <div className="admin-global-loader">Processing metrics...</div>}
        </div>
      </main>

      {/* Global Modals overlaying the entire wrapper securely */}
      {activeModal === 'ADD_PRODUCT' && <AddProductModal />}
      {activeModal === 'DELETE_PRODUCT' && <DeleteProductModal />}
      {activeModal === 'VIEW_USERS' && <ViewUsersModal />}
      {activeModal === 'MODIFY_USER' && <ModifyUserModal />}
      {activeModal === 'ANALYTICS' && <BusinessAnalyticsModal />}
    </div>
  );
};

export default AdminDashboard;
