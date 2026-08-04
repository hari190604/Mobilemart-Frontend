import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get('/orders');
        if (response.data && response.data.success) {
          const orders = response.data.data.content || [];
          const matched = orders.find((o) => o.orderId === id);
          setOrder(matched);
        }
      } catch (error) {
        console.error("Failed to fetch order details", error);
      }
    };
    fetchOrder();
  }, [id]);

  if (!order) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <span style={{ fontSize: '64px' }}>❓</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0' }}>Order Not Found</h2>
        <p className="text-muted">We could not locate any order records with ID "{id}".</p>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Back to My Orders
        </Link>
      </div>
    );
  }

  // Est Delivery Date calculation
  const getDeliveryDateStr = () => {
    const d = new Date(order.date);
    if (isNaN(d.getTime())) return '3-5 business days';
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusMessage = () => {
    switch (order.status) {
      case 'DELIVERED': return '📦 Delivered successfully at your address.';
      case 'SHIPPED': return '🚚 Order package is currently on route to your location.';
      case 'CANCELLED': return '✕ Order has been cancelled and funds reverted.';
      default: return '📝 Order validated. Package preparing at dispatch center.';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Header and Print Invoice controls */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Link to="/orders" style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '600', display: 'inline-block', marginBottom: '8px' }}>
            ← Back to Orders list
          </Link>
          <h1 style={{ fontSize: '32px' }}>Order details</h1>
          <p className="text-muted">Tracking and invoice records for reference <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{order.orderId}</span></p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          🖨️ Print Invoice
        </button>
      </div>

      {/* Timeline Tracking Status */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
          📦 Delivery Tracking Timeline
        </h3>
        
        {order.status === 'CANCELLED' ? (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '15px',
            fontWeight: '600'
          }}>
            ✕ This order has been CANCELLED. Refunds are processed back to the original payment source.
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', position: 'relative' }}>
            {/* Background progress bar line */}
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '10%',
              width: '80%',
              height: '4px',
              backgroundColor: 'var(--border)',
              zIndex: 1
            }} />

            {/* Tracking checkpoints */}
            {[
              { label: 'Placed', info: order.date, active: true },
              { label: 'Shipped', info: 'Courier Partner', active: order.status === 'SHIPPED' || order.status === 'DELIVERED' },
              { label: 'Out for Delivery', info: 'Delivery Driver', active: order.status === 'DELIVERED' },
              { label: 'Delivered', info: getDeliveryDateStr(), active: order.status === 'DELIVERED' }
            ].map((step, index) => (
              <div key={index} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%', minWidth: '100px', textAlign: 'center' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: step.active ? 'var(--accent)' : 'var(--bg-main)',
                  border: `3px solid ${step.active ? 'var(--accent)' : 'var(--border)'}`,
                  color: step.active ? '#0f172a' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '14px',
                  boxShadow: '0 0 0 6px var(--bg-card)'
                }}>
                  {step.active ? '✓' : index + 1}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '10px', color: step.active ? 'var(--text-main)' : 'var(--text-muted)' }}>{step.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{step.info}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Items Purchased list */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              🛍️ Items in Shipment
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex align-center justify-between"
                  style={{
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div className="flex align-center gap-2">
                    <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', background: 'rgba(241, 245, 249, 0.05)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase' }}>{item.brand}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{item.name}</h4>
                      <span className="text-muted" style={{ fontSize: '13px' }}>
                        Qty: {item.quantity} x ₹{item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Shipping & Cost breakdown */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card bg-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              Receipt Details
            </h3>

            {/* Address */}
            <div style={{ fontSize: '14px' }}>
              <span className="text-muted" style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Shipping Address</span>
              <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            {/* Payment Method details */}
            <div style={{ fontSize: '14px' }}>
              <span className="text-muted" style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Payment Mode</span>
              <span style={{ fontWeight: '600', color: 'var(--accent)' }}>
                {order.paymentMethod === 'CARD' ? '💳 Credit/Debit Card' : order.paymentMethod === 'UPI' ? '📱 UPI Online Wallet' : '💵 Cash on Delivery'}
              </span>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            {/* Billing calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>₹{(order.total - (order.total > 500 ? 0 : 10)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{order.total > 500 ? 'FREE' : '₹10.00'}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: '18px', fontWeight: '800', marginTop: '8px' }}>
                <span>Final Billed Amount</span>
                <span style={{ color: 'var(--text-main)' }}>₹{order.total.toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderDetails;
