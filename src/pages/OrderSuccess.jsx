import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Attempt to load order from location state or retrieve the latest order from localStorage
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      if (savedOrders.length > 0) {
        setOrder(savedOrders[savedOrders.length - 1]);
      } else {
        // Fallback redirection if no orders exist
        navigate('/');
      }
    }
  }, [location, navigate]);

  if (!order) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="shimmer" style={{ width: '120px', height: '40px', borderRadius: 'var(--radius-sm)' }}></div>
      </div>
    );
  }

  // Delivery estimate logic: 3 days after purchase
  const estimateDate = new Date();
  estimateDate.setDate(estimateDate.getDate() + 3);
  const formattedEstimate = estimateDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '40px auto', textAlign: 'left' }}>
      
      {/* Success Badge Banner */}
      <div className="card text-center" style={{ 
        padding: '40px 30px', 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ 
          fontSize: '72px', 
          animation: 'bounce 1s infinite alternate', 
          marginBottom: '16px',
          display: 'inline-block'
        }}>
          🎉
        </div>
        
        <h1 style={{ 
          fontSize: '32px', 
          color: 'var(--success)', 
          fontWeight: '800',
          fontFamily: 'var(--font-title)',
          marginBottom: '12px'
        }}>
          Order Placed Successfully!
        </h1>
        
        <p className="text-muted" style={{ fontSize: '16px', maxWidth: '500px', margin: '0 auto 30px auto' }}>
          Thank you for shopping with MobileMart. Your transaction has been approved and dispatch logistics are in progress.
        </p>

        {/* Voucher Invoice Details */}
        <div className="card" style={{ 
          backgroundColor: 'var(--bg-main)', 
          border: '1px solid var(--border)', 
          boxShadow: 'none',
          padding: '24px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Purchase Invoice Summary</h3>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted">🧾 Order Reference:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-main)' }}>{order.orderId}</span>
          </div>

          {order.transactionId && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">🗝️ Transaction ID:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-main)' }}>{order.transactionId}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted">📅 Purchase Date:</span>
            <span style={{ fontWeight: '600' }}>{order.date}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted">💳 Payment Method:</span>
            <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
              {order.paymentMethod === 'CARD' ? '💳 Credit Card' : order.paymentMethod === 'UPI' ? '📱 UPI Online' : '💵 Cash on Delivery'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted">🚚 Expected Delivery:</span>
            <span style={{ fontWeight: '700', color: 'var(--success)' }}>{formattedEstimate}</span>
          </div>

          <hr style={{ border: '0', borderTop: '1px dotted var(--border)' }} />

          {/* Shipping Address Recap */}
          <div style={{ fontSize: '14px' }}>
            <span className="text-muted" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>📍 Shipping Address:</span>
            <div style={{ fontWeight: '600', paddingLeft: '8px', borderLeft: '2px solid var(--accent)' }}>
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

          {/* Total Cost */}
          <div className="flex justify-between" style={{ fontSize: '20px', fontWeight: '800' }}>
            <span>Total Settled:</span>
            <span style={{ color: 'var(--accent)' }}>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons footer */}
        <div className="flex gap-2 justify-center" style={{ marginTop: '30px', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn btn-primary" style={{ padding: '12px 30px' }}>
            Track My Orders 📦
          </Link>
          <Link to="/products" className="btn btn-secondary" style={{ padding: '12px 30px' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
      
    </div>
  );
};

export default OrderSuccess;
