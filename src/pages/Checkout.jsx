import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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
  const [loading, setLoading] = useState(false);

  if (cartItems.length === 0) {
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Address
      const addressPayload = {
        fullName: user?.name || 'Customer',
        mobileNumber: user?.phoneNumber || '+1234567890',
        streetAddress: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
        country: address.country,
        isDefault: true
      };

      const addressRes = await api.post('/addresses', addressPayload);
      const addressId = addressRes.data.data.addressId;

      // 2. Place Order
      const orderRes = await api.post('/orders', { 
        addressId: addressId,
        paymentMethod: paymentMethod 
      });
      const placedOrder = orderRes.data.data;

      // The backend will clear the cart eventually.
      // We will only clear frontend cart for COD now, and for Online after payment verify succeeds.
      
      if (paymentMethod === 'COD') {
        clearCart();
        placedOrder.isCOD = true;
        localStorage.setItem('lastOrder', JSON.stringify(placedOrder));
        window.open('/payment-success', '_blank');
        navigate('/');
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      const options = {
        key: 'rzp_test_TKaXvvDaeNBx3Y',
        amount: Math.round(placedOrder.totalAmount * 100),
        currency: "INR",
        name: "MobileMart",
        description: "Secure Checkout",
        order_id: placedOrder.razorpayOrderId,
        handler: async function (response) {
          setLoading(true);
          try {
            const verifyRes = await api.post('/orders/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            
            if (verifyRes.data && verifyRes.data.success) {
              localStorage.setItem('lastOrder', JSON.stringify(verifyRes.data.data));
              clearCart();
            }
            
            setLoading(false);
            navigate('/payment-success');
          } catch (error) {
            console.error("Verification failed", error);
            setLoading(false);
            navigate('/payment-failed');
          }
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@example.com",
          contact: user?.phoneNumber || "9999999999"
        },
        theme: {
          color: "#3b82f6"
        }
      };

      setLoading(false);
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response){
        console.error(response.error);
        navigate('/payment-failed');
      });
      paymentObject.open();
    } catch (error) {
      console.error("Failed to place order", error);
      alert(error.response?.data?.message || error.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

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
              <div className="card text-center animate-fade-in" style={{ padding: '20px', backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none' }}>
                💳 You will be redirected to our secure payment gateway to input your card details and complete the transaction.
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="card text-center animate-fade-in" style={{ padding: '20px', backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none' }}>
                📱 You will be redirected to our online terminal to process your payment using UPI QR code or VPA ID verification.
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="card text-center animate-fade-in" style={{ padding: '20px', backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none' }}>
                💵 Deliver fees and device amounts directly to our dispatch rider on arrival. No pre-payment is required!
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
                  <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            {/* Price layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            <div className="flex justify-between" style={{ fontSize: '18px', fontWeight: '800' }}>
              <span>Total cost</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'Processing Checkout...' : paymentMethod === 'COD' ? 'Place Order (COD) 💵' : 'Proceed to Payment 💳'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
