import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * TODO: FRONTEND DEVELOPER 2 - Order History & Tracking Integration
 * 
 * 1. Interface with backend order retrieval API: `GET /api/v1/orders/user`.
 * 2. Connect individual order tracking requests: `GET /api/v1/orders/{orderId}/status`.
 * 3. Render list elements matching API database states dynamically instead of local storage pools.
 * 4. Implement search filters to isolate orders by date ranges or completion states.
 */
export const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

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

  // Reverse list order to display latest orders at top
  const orderedList = [...orders].reverse();

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
      <div>
        <h1 style={{ fontSize: '32px' }}>My Orders History</h1>
        <p className="text-muted">Monitor delivery tracking stages and view order receipts.</p>
      </div>

      <div className="flex flex-col gap-3">
        {orderedList.map((order, idx) => (
          <div key={idx} className="card" style={{ padding: '24px' }}>
            
            {/* Order Header metadata details */}
            <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '13px' }}>ORDER NUMBER</span>
                <h4 style={{ fontFamily: 'monospace', fontSize: '16px' }}>{order.orderId}</h4>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '13px' }}>DATE PLACED</span>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{order.date}</div>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '13px' }}>TOTAL COST</span>
                <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>${order.total.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>STATUS</span>
                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Tracking Progress Node Graph */}
            <div className="flex justify-between" style={{ 
              maxWidth: '500px', 
              margin: '0 auto 24px auto', 
              padding: '10px 0', 
              position: 'relative'
            }}>
              {/* Line in Background */}
              <div style={{
                position: 'absolute',
                top: '22px',
                left: '10%',
                width: '80%',
                height: '4px',
                background: 'var(--border)',
                zIndex: 1
              }} />

              {/* Status Nodes */}
              {[
                { name: 'Order Confirmed', icon: '📝', reached: true },
                { name: 'Dispatched', icon: '🚚', reached: order.status === 'SHIPPED' || order.status === 'DELIVERED' },
                { name: 'Delivered', icon: '🏠', reached: order.status === 'DELIVERED' }
              ].map((step, sIdx) => (
                <div key={sIdx} className="flex flex-col align-center text-center" style={{ zIndex: 2, position: 'relative', width: '80px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: step.reached ? 'var(--accent)' : 'var(--border)',
                    color: step.reached ? '#0f172a' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 0 0 4px var(--bg-card)'
                  }}>
                    {step.reached ? '✓' : sIdx + 1}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginTop: '6px', color: step.reached ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {step.name} {step.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Products inside order table preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h5 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>PURCHASED DEVICES</h5>
              {order.items.map((item) => (
                <div key={item.id} className="flex align-center justify-between" style={{ fontSize: '15px', padding: '6px 0', borderBottom: '1px dotted var(--border)' }}>
                  <div className="flex align-center gap-1">
                    <span style={{ fontSize: '18px' }}>📱</span>
                    <span>{item.name} <span className="text-muted" style={{ fontSize: '13px' }}>(Qty: {item.quantity})</span></span>
                  </div>
                  <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Receipt Footer Transaction code */}
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' }}>
              Transaction Receipt: {order.transactionId}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
export default Orders;
