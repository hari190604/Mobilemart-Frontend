import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

export const Payment = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [pendingOrder, setPendingOrder] = useState(null);
  
  // Form input parameters
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  
  const [upiVpa, setUpiVpa] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');

  useEffect(() => {
    const savedPending = localStorage.getItem('pending_order');
    if (savedPending) {
      setPendingOrder(JSON.parse(savedPending));
    } else {
      navigate('/cart');
    }
  }, [navigate]);

  if (!pendingOrder) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="shimmer" style={{ width: '120px', height: '40px', borderRadius: 'var(--radius-sm)' }}></div>
      </div>
    );
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces every 4 digits
    if (name === 'number') {
      const sanitized = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = sanitized.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length > 0) {
        setCardDetails({ ...cardDetails, [name]: parts.join(' ') });
      } else {
        setCardDetails({ ...cardDetails, [name]: sanitized });
      }
    } 
    // Format expiry date as MM/YY
    else if (name === 'expiry') {
      const sanitized = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (sanitized.length >= 2) {
        setCardDetails({ ...cardDetails, [name]: sanitized.substring(0, 2) + '/' + sanitized.substring(2, 4) });
      } else {
        setCardDetails({ ...cardDetails, [name]: sanitized });
      }
    } else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processTransaction = async (e) => {
    if (e) e.preventDefault();
    
    if (pendingOrder.paymentMethod === 'COD') {
      localStorage.removeItem('pending_order');
      clearCart();
      navigate('/payment-success');
      return;
    }

    setLoading(true);
    setLoaderMessage('Initializing Secure Razorpay Checkout...');
    
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      setLoading(false);
      return;
    }

    const options = {
      key: 'rzp_test_TKaXvvDaeNBx3Y', // Provided from backend config
      amount: Math.round(pendingOrder.total * 100), // Amount in paise
      currency: "INR",
      name: "MobileMart",
      description: "Secure Checkout",
      order_id: pendingOrder.razorpayOrderId,
      handler: async function (response) {
        setLoaderMessage('Verifying payment signature...');
        setLoading(true);
        try {
          await api.post('/orders/verify-payment', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          
          localStorage.removeItem('pending_order');
          clearCart();
          setLoading(false);
          navigate('/payment-success');
        } catch (error) {
          console.error("Verification failed", error);
          setLoading(false);
          navigate('/payment-failed');
        }
      },
      prefill: {
        name: cardDetails.name || "Customer",
        email: "customer@example.com",
        contact: "9999999999"
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
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left', position: 'relative' }}>
      
      {/* Loading Overlays overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(9, 13, 22, 0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          color: 'white',
          textAlign: 'center',
          padding: '24px'
        }}>
          <div className="shimmer" style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%',
            border: '4px solid var(--accent)',
            borderTopColor: 'transparent',
            animation: 'loading 1s linear infinite',
            marginBottom: '24px'
          }} />
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>Processing Payment</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>{loaderMessage}</p>
        </div>
      )}

      <div>
        <h1 style={{ fontSize: '32px' }}>Secure Payment Gateway</h1>
        <p className="text-muted">Finalize your payment safely using our PCI-DSS compliant checkout terminal.</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Interactive forms */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {pendingOrder.paymentMethod === 'CARD' ? (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
                💳 Credit / Debit Card Details
              </h3>

              {/* Credit Card Graphic Card Mockup */}
              <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', opacity: 0.8 }}>SECURE DEBIT CARD</div>
                  <img src="/mobilemart-logo.png" alt="Card Brand" style={{ height: '24px', filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.4))' }} />
                </div>

                <div style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '0.15em', fontFamily: 'monospace', margin: '20px 0 10px 0' }}>
                  {cardDetails.number || '•••• •••• •••• ••••'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '2px' }}>Card Holder</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {cardDetails.name || 'JOHN CUSTOMER'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '2px' }}>Expires</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>
                      {cardDetails.expiry || 'MM/YY'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '2px' }}>CVV</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>
                      {cardDetails.cvv ? '•••' : '000'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <form onSubmit={processTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input 
                    type="text" 
                    name="number"
                    className="form-input" 
                    placeholder="4111 2222 3333 4444"
                    maxLength="19"
                    value={cardDetails.number}
                    onChange={handleCardInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input 
                    type="text" 
                    name="name"
                    className="form-input" 
                    placeholder="John Customer"
                    value={cardDetails.name}
                    onChange={handleCardInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-1" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input 
                      type="text" 
                      name="expiry"
                      className="form-input" 
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardDetails.expiry}
                      onChange={handleCardInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV / Security Code</label>
                    <input 
                      type="password" 
                      name="cvv"
                      className="form-input" 
                      placeholder="•••"
                      maxLength="3"
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      required
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Use 000 to test failed payment redirect)</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                  Authorize Settlement Amount of ${pendingOrder.total.toFixed(2)} 💳
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
                📱 UPI Online Payment
              </h3>

              {/* QR Scanner layout mockup */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '180px',
                  height: '180px',
                  border: '2px solid var(--accent)',
                  borderRadius: 'var(--radius-md)',
                  margin: '0 auto 16px auto',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-main)',
                  position: 'relative'
                }}>
                  {/* Scanner lines */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    height: '2px',
                    background: 'var(--accent)',
                    boxShadow: '0 0 8px var(--accent)',
                    animation: 'scannerLine 2s linear infinite'
                  }} />
                  <div style={{ fontSize: '96px', opacity: 0.85 }}>📱</div>
                </div>
                <p className="text-muted text-sm">Scan code with any UPI app (GPay, PhonePe, Paytm) to settle the bill amount.</p>
              </div>

              <form onSubmit={processTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Or enter your UPI VPA Address ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="username@upi"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Use fail@upi to test failed payment redirect)</span>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                  Verify & Pay ${pendingOrder.total.toFixed(2)} 📲
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Side: Order summary sidebar */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="card bg-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Order Billing Summary</h3>

            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="flex justify-between">
                <span className="text-muted">Order ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{pendingOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Items Count:</span>
                <span style={{ fontWeight: '600' }}>{pendingOrder.items.reduce((acc, i) => acc + i.quantity, 0)} devices</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping details:</span>
                <span style={{ fontWeight: '600', maxWidth: '160px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pendingOrder.shippingAddress.street}, {pendingOrder.shippingAddress.city}
                </span>
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            <div className="flex justify-between" style={{ fontSize: '20px', fontWeight: '800' }}>
              <span>Total Settle</span>
              <span style={{ color: 'var(--accent)' }}>${pendingOrder.total.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="btn btn-secondary" style={{ width: '100%', fontSize: '14px', padding: '10px' }}>
              ← Return to Checkout details
            </Link>
          </div>
        </div>

      </div>

      {/* Adding custom keyframes style inside jsx */}
      <style>{`
        @keyframes scannerLine {
          0% { top: 10px; }
          50% { top: 168px; }
          100% { top: 10px; }
        }
      `}</style>

    </div>
  );
};

export default Payment;
