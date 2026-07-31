import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockProducts } from '../utils/mockProducts';

/**
 * TODO: FRONTEND DEVELOPER 2 - Admin Back-Office Panel API Integration
 * 
 * 1. Interface with backend aggregate metrics endpoints: `GET /api/v1/admin/dashboard/stats`.
 * 2. Connect management lists (Users list, Order list):
 *    - Users audit: `GET /api/v1/admin/users`, `PUT /api/v1/admin/users/{id}/role`
 *    - Orders audit: `GET /api/v1/admin/orders`, `PUT /api/v1/admin/orders/{id}/status`
 * 3. Connect inventory catalog actions:
 *    - Add item: `POST /api/v1/products`
 *    - Modify details: `PUT /api/v1/products/{id}`
 *    - Take offline: `DELETE /api/v1/products/{id}`
 * 4. Only allow authenticated users with JWT token and ROLE_ADMIN role metrics.
 */
export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Admin states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    price: '',
    category: 'Smartphones',
    stockQuantity: '',
    description: ''
  });

  // Load backend states
  useEffect(() => {
    // Sync catalog list
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      localStorage.setItem('products', JSON.stringify(mockProducts));
      setProducts(mockProducts);
    }

    // Sync order list
    const savedOrders = localStorage.getItem('orders') || '[]';
    setOrders(JSON.parse(savedOrders));
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

  // Sales aggregation math
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total : 0), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity < 10).length;

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
      ...newProduct,
      id,
      price: parseFloat(newProduct.price),
      stockQuantity: parseInt(newProduct.stockQuantity),
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
      rating: 5.0,
      reviewsCount: 0,
      specs: { Screen: 'Not specified', Processor: 'Not specified', Camera: 'Not specified', Battery: 'Not specified' }
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
      description: ''
    });
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Delete this product from catalog?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem('products', JSON.stringify(updated));
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '32px' }}>Admin Dashboard Terminal</h1>
        <p className="text-muted">Manage product catalog, monitor payments, and update dispatcher status records.</p>
      </div>

      {/* Stats row widget */}
      <div className="grid grid-cols-4 gap-2">
        
        <div className="card text-center" style={{ padding: '20px' }}>
          <span style={{ fontSize: '32px' }}>💰</span>
          <h4 className="text-muted" style={{ fontSize: '13px', marginTop: '8px' }}>TOTAL MOCK SALES</h4>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--success)' }}>
            ${totalSales.toFixed(2)}
          </h2>
        </div>

        <div className="card text-center" style={{ padding: '20px' }}>
          <span style={{ fontSize: '32px' }}>📦</span>
          <h4 className="text-muted" style={{ fontSize: '13px', marginTop: '8px' }}>TOTAL SYSTEM ORDERS</h4>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>
            {orders.length}
          </h2>
        </div>

        <div className="card text-center" style={{ padding: '20px' }}>
          <span style={{ fontSize: '32px' }}>📱</span>
          <h4 className="text-muted" style={{ fontSize: '13px', marginTop: '8px' }}>CATALOG SIZE</h4>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>
            {products.length}
          </h2>
        </div>

        <div className="card text-center" style={{ padding: '20px' }}>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <h4 className="text-muted" style={{ fontSize: '13px', marginTop: '8px' }}>LOW STOCK ITEMS</h4>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: lowStockCount > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
            {lowStockCount}
          </h2>
        </div>

      </div>

      {/* Catalog & Orders Grid details tables */}
      <div className="grid grid-cols-2 gap-3" style={{ alignItems: 'start' }}>
        
        {/* Left Card: Products catalog managers */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>Catalog Products</h3>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
              + Add Product
            </button>
          </div>

          {/* Simple Products List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {products.map((p) => (
              <div 
                key={p.id} 
                className="flex align-center justify-between"
                style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}
              >
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {p.brand} | Stock: <span style={{ fontWeight: 'bold', color: p.stockQuantity < 10 ? 'var(--danger)' : 'var(--text-main)' }}>{p.stockQuantity}</span>
                  </div>
                </div>
                
                <div className="flex align-center gap-2">
                  <span style={{ fontWeight: 'bold', marginRight: '8px' }}>${p.price.toFixed(2)}</span>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)', padding: '4px 8px', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Card: Orders status manager */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            Orders Hub
          </h3>

          {orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {orders.map((o) => (
                <div 
                  key={o.orderId} 
                  className="flex flex-col gap-1"
                  style={{ padding: '12px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}
                >
                  <div className="flex justify-between align-center">
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{o.orderId}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.date}</span>
                  </div>
                  
                  <div className="flex justify-between align-center" style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '14px' }}>Amount: <strong>${o.total.toFixed(2)}</strong></span>
                    <select 
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                      className="form-input"
                      style={{ width: 'fit-content', padding: '4px 8px', fontSize: '13px' }}
                    >
                      <option value="PAID">PAID</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ padding: '40px 0', textAlign: 'center' }}>
              No checkouts completed dynamically yet.
            </p>
          )}

        </div>

      </div>

      {/* Modal dialog for adding products */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '30px' }}>
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
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

    </div>
  );
};
export default AdminDashboard;
