import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * TODO: FRONTEND DEVELOPER 2 - Checkout & Billing Integration
 * 
 * 1. Interface with backend order creation API: `POST /api/v1/orders`.
 * 2. Send transaction payload containing:
 *    - shippingAddress: { street, city, state, zipCode, country, addressType }
 *    - billingAddress: same or separate
 *    - paymentMethod: CARD / UPI / COD
 *    - orderItems: mapped list of items and quantities from state
 * 3. Validate user authentication token headers: Ensure auth Bearer intercepts are utilized.
 * 4. Coordinate transition states: Redirect directly to /payment for Credit Card charges.
 */
export const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Address parameters
  const [address, setAddress] = useState({
    street: '123 Tech Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    addressType: 'SHIPPING'
  });

  // Payment params
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardDetails, setCardDetails] = useState({
    number: '4111 2222 3333 4444',
    name: user ? user.name : 'John Customer',
    expiry: '12/28',
    cvv: '123'
  });

  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  if (cartItems.length === 0 && !orderResult) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <span style={{ fontSize: '64px' }}>🛒</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0' }}>Your Checkout is Empty</h2>
        <p className="text-muted">There are no items in your cart. Add products before checking out.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  const shippingCost = cartTotal > 500 ? 0.00 : 10.00;
  const grandTotal = cartTotal + shippingCost;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate database write
    setTimeout(() => {
      const generatedOrderId = 'MM-' + Math.floor(100000 + Math.random() * 900000);
      const transactionId = 'TXN_MM' + Math.random().toString(36).substring(2, 9).toUpperCase();
      
      const newOrder = {
        orderId: generatedOrderId,
        transactionId: transactionId,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: [...cartItems],
        total: grandTotal,
        shippingAddress: { ...address },
        paymentMethod: paymentMethod,
        status: 'PAID'
      };

      // Push to orders list in localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      // Resolve state
      clearCart();
      setOrderResult(newOrder);
      setLoading(false);
    }, 1200);
  };

  if (orderResult) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '64px' }}>🎉</div>
        <h2 style={{ fontSize: '28px', color: 'var(--success)', margin: '16px 0 12px 0' }}>Order Placed Successfully!</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Thank you for choosing MobileMart. We have processed your order successfully.
        </p>

        {/* Order Details Voucher */}
        <div className="card" style={{ textAlign: 'left', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', marginBottom: '24px', boxShadow: 'none' }}>
          <div style={{ padding: '4px 0', fontSize: '15px' }}>🧾 <strong>Order Reference:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{orderResult.orderId}</span></div>
          <div style={{ padding: '4px 0', fontSize: '15px' }}>🗝️ <strong>Transaction ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{orderResult.transactionId}</span></div>
          <div style={{ padding: '4px 0', fontSize: '15px' }}>📅 <strong>Order Date:</strong> {orderResult.date}</div>
          <div style={{ padding: '4px 0', fontSize: '15px' }}>💰 <strong>Total Settled:</strong> ${orderResult.total.toFixed(2)}</div>
          <div style={{ padding: '4px 0', fontSize: '15px' }}>📍 <strong>Ship to:</strong> {orderResult.shippingAddress.street}, {orderResult.shippingAddress.city}</div>
        </div>

        <div className="flex gap-2 justify-center">
          <Link to="/orders" className="btn btn-primary">
            Track My Orders 📦
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Back to Mobile Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      <h1 style={{ fontSize: '32px' }}>Checkout Order Details</h1>

      <form onSubmit={handlePlaceOrder} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Left column: forms details */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Shipping addresses panel */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>📦 Shipping Address</h3>
            
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input 
                type="text" 
                className="form-input" 
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-1" style={{ marginBottom: '0px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1" style={{ marginBottom: '0px' }}>
              <div className="form-group">
                <label className="form-label">ZIP / Postal Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={address.zipCode}
                  onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={address.country}
                  onChange={(e) => setAddress({...address, country: e.target.value})}
                  required
                />
              </div>
            </div>

          </div>

          {/* Payment information panel */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>💳 Settlement Payment Method</h3>
            
            <div className="flex gap-2" style={{ marginBottom: '24px' }}>
              {[
                { id: 'CARD', label: 'Credit Card', icon: '💳' },
                { id: 'UPI', label: 'UPI / Online', icon: '📱' },
                { id: 'COD', label: 'Cash on Delivery', icon: '💵' }
              ].map((method) => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  style={{
                    flex: '1',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid',
                    borderColor: paymentMethod === method.id ? 'var(--accent)' : 'var(--border)',
                    background: paymentMethod === method.id ? 'rgba(245,158,11,0.05)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    fontWeight: '700',
                    color: "var(--text-main)"
                  }}
                >
                  <div style={{ fontSize: '20px' }}>{method.icon}</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>{method.label}</div>
                </button>
              ))}
            </div>

            {paymentMethod === 'CARD' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Name on Card</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-1" style={{ marginBottom: '0px' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="•••"
                      maxLength="3"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="card text-center animate-fade-in" style={{ padding: '20px', backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none' }}>
                📲 Enter your Virtual Payment Address (e.g. name@upi) on checkout to receive a push notification for checkout processing.
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="card text-center animate-fade-in" style={{ padding: '20px', backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none' }}>
                💵 Deliver fees and device amounts directly to our dispatch rider on arrival.
              </div>
            )}

          </div>

        </div>

        {/* Right column: order details sidebar */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="card bg-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Order Items</h3>
            
            {/* Products catalog tracker list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between align-center" style={{ fontSize: '14px' }}>
                  <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {item.quantity}x {item.name}
                  </div>
                  <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            {/* Price layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            <div className="flex justify-between" style={{ fontSize: '18px', fontWeight: '800' }}>
              <span>Total cost</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'Processing Order...' : 'Confirm Order Payment 💳'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
export default Checkout;
