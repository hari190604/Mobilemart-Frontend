import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Read the latest order from the localStorage order history
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (savedOrders.length > 0) {
      setOrderDetails(savedOrders[savedOrders.length - 1]);
    } else {
      // Redirection if no order was processed
      navigate('/');
    }
  }, [navigate]);

  if (!orderDetails) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="shimmer" style={{ width: '120px', height: '40px', borderRadius: 'var(--radius-sm)' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
      <div className="card" style={{ 
        padding: '50px 30px', 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Animated Check Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '3px solid var(--success)',
          color: 'var(--success)',
          fontSize: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          animation: 'pulse 2s infinite'
        }}>
          ✓
        </div>

        <h1 style={{ 
          fontSize: '30px', 
          fontWeight: '800', 
          color: 'var(--success)',
          marginBottom: '10px',
          fontFamily: 'var(--font-title)'
        }}>
          Payment Authorized!
        </h1>
        
        <p className="text-muted" style={{ fontSize: '15px', marginBottom: '32px' }}>
          Your digital funds transaction has been cleared. Thank you for your purchase.
        </p>

        {/* Payment Summary */}
        <div style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div className="flex justify-between" style={{ fontSize: '14px' }}>
            <span className="text-muted">Transaction ID</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-main)' }}>{orderDetails.transactionId}</span>
          </div>

          <div className="flex justify-between" style={{ fontSize: '14px' }}>
            <span className="text-muted">Order ID</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-main)' }}>{orderDetails.orderId}</span>
          </div>

          <div className="flex justify-between" style={{ fontSize: '14px' }}>
            <span className="text-muted">Date</span>
            <span style={{ fontWeight: '600' }}>{orderDetails.date}</span>
          </div>

          <div className="flex justify-between" style={{ fontSize: '14px' }}>
            <span className="text-muted">Payment Mode</span>
            <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
              {orderDetails.paymentMethod === 'CARD' ? '💳 Credit Card' : '📱 UPI / Wallet'}
            </span>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

          <div className="flex justify-between" style={{ fontSize: '18px', fontWeight: '800' }}>
            <span>Amount Charged</span>
            <span style={{ color: 'var(--text-main)' }}>${orderDetails.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex gap-2 justify-center" style={{ flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            Track Order Status 📦
          </Link>
          <Link to="/products" className="btn btn-secondary" style={{ padding: '12px 28px' }}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;
