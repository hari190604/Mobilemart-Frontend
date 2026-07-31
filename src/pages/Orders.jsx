import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders from localStorage on load
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  if (orders.length === 0) {
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
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filter === 'ALL' || o.status === filter;
    return matchesSearch && matchesStatus;
  });

  const orderedList = [...filteredOrders].reverse();

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID': return 'badge-success';
      case 'SHIPPED': return 'badge-warning';
      case 'DELIVERED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

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
          {/* Status filter tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: filter === status ? 'var(--accent)' : 'var(--border)',
                  background: filter === status ? 'rgba(245,158,11,0.08)' : 'transparent',
                  color: filter === status ? 'var(--accent)' : 'var(--text-main)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {status === 'ALL' ? 'All Orders' : status}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ minWidth: '240px', position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Order reference..."
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
          orderedList.map((order, idx) => (
            <div key={idx} className="card animate-fade-in" style={{ padding: '24px' }}>
              
              {/* Order Header metadata details */}
              <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <span className="text-muted" style={{ fontSize: '12px' }}>ORDER NUMBER</span>
                  <h4 style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>{order.orderId}</h4>
                </div>
                <div>
                  <span className="text-muted" style={{ fontSize: '12px' }}>DATE PLACED</span>
                  <div style={{ fontWeight: '600', fontSize: '15px' }}>{order.date}</div>
                </div>
                <div>
                  <span className="text-muted" style={{ fontSize: '12px' }}>TOTAL COST</span>
                  <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>${order.total.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>STATUS</span>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Simple inline progress bar */}
              <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '20px' }}>
                
                {/* Brief description of items */}
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Contains: {order.items.map((i) => `${i.quantity}x ${i.name.split(' ')[0]}`).join(', ')}
                </div>

                {/* View Details Redirect CTA */}
                <button 
                  onClick={() => navigate(`/orders/${order.orderId}`)} 
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '13px', padding: '6px 16px', color: 'var(--accent)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                >
                  Track & View Receipt →
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="card text-center text-muted" style={{ padding: '40px 0' }}>
            No orders match the selected filters.
          </div>
        )}
      </div>

    </div>
  );
};

export default Orders;
