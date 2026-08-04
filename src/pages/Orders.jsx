import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const Orders = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        if (response.data && response.data.orders && response.data.orders.products) {
          setProducts(response.data.orders.products);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };
    fetchOrders();
  }, []);

  if (products.length === 0) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <span style={{ fontSize: '64px' }}>📦</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0' }}>No Orders Found</h2>
        <p className="text-muted">You have not completed any device checkouts on MobileMart yet.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  // Handle filtering and search
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.order_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const orderedList = [...filteredProducts].reverse();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      
      {/* Page Title */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px' }}>My Orders History</h1>
          <p className="text-muted">Monitor delivery tracking stages and view order receipts.</p>
        </div>
        <Link to="/products" className="btn btn-secondary btn-sm">
          Continue Shopping
        </Link>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Search Input */}
          <div style={{ minWidth: '300px', position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Order ID or Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
            <span style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }}>🔍</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3">
        {orderedList.length > 0 ? (
          orderedList.map((product, idx) => (
            <div key={idx} className="card animate-fade-in" style={{ padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              
              <div style={{ flexShrink: 0 }}>
                 {product.image_url ? (
                   <img src={product.image_url} alt={product.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                 ) : (
                   <div style={{ width: '120px', height: '120px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <span style={{ fontSize: '32px' }}>📱</span>
                   </div>
                 )}
              </div>

              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '12px' }}>ORDER ID: {product.order_id}</span>
                    <h3 style={{ fontSize: '20px', margin: '4px 0 8px 0' }}>{product.name}</h3>
                    <p className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>{product.description}</p>
                    <span className="badge badge-primary" style={{ marginBottom: '12px', display: 'inline-block' }}>{product.category || 'Category'}</span>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ORDER DATE</div>
                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>
                      {product.order_date ? new Date(product.order_date).toLocaleDateString() : 'N/A'}
                    </div>
                    <span className="badge badge-success">{product.order_status || 'SUCCESS'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PRICE PER UNIT</div>
                    <div style={{ fontWeight: '600' }}>₹{product.price_per_unit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>QUANTITY</div>
                    <div style={{ fontWeight: '600' }}>x{product.quantity}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TOTAL PRICE</div>
                    <div style={{ fontWeight: '800', color: 'var(--accent)', fontSize: '18px' }}>₹{product.total_price}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center text-muted" style={{ padding: '40px 0' }}>
            No products match the search.
          </div>
        )}
      </div>

    </div>
  );
};

export default Orders;
