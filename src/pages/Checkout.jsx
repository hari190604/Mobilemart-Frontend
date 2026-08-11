import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Checkout.css';

export const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);

  // Address parameters
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    addressType: 'SHIPPING'
  });

  // Payment params
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-seed some default dev values for rapid testing experience
    if (user) {
       setAddress(prev => ({
         ...prev,
         street: '123 Enterprise Block',
         city: 'Bangalore',
         state: 'Karnataka',
         zipCode: '560001'
       }));
    }
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <div className="card text-center animate-fade-in glass-panel" style={{ padding: '80px', marginTop: '40px', maxWidth: '600px', margin: '60px auto' }}>
        <span style={{ fontSize: '70px', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))' }}>🛒</span>
        <h2 style={{ fontSize: '28px', margin: '24px 0 12px 0' }}>Checkout Pipeline Empty</h2>
        <p className="text-muted mb-4">Please stage products into your cart before initiating the checkout sequence.</p>
        <Link to="/products" className="btn btn-primary">
          Return to Catalog
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

      // 2. Place Order payload setup
      const orderRes = await api.post('/orders', { 
        addressId: addressId,
        paymentMethod: paymentMethod 
      });
      const placedOrder = orderRes.data.data;

      // 3. Routing rules
      if (paymentMethod === 'COD') {
        clearCart();
        placedOrder.isCOD = true;
        localStorage.setItem('lastOrder', JSON.stringify(placedOrder));
        window.open('/payment-success', '_blank');
        navigate('/');
        return;
      }

      // Online RazorPay processing
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
        name: "MobileMart Premium",
        description: "Secure AES Encrypted Checkout",
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

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  return (
    <div className="checkout-pipeline-wrapper font-sans animate-fade-up">
      
      {/* 4-Step Visual Tracker */}
      <div className="checkout-stepper-container mb-5">
         <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <span>Shipping</span>
         </div>
         <div className={`step-connector ${step >= 2 ? 'active' : ''}`}></div>
         <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span>Payment</span>
         </div>
         <div className={`step-connector ${step >= 3 ? 'active' : ''}`}></div>
         <div className={`checkout-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span>Review</span>
         </div>
      </div>

      <form onSubmit={step === 3 ? handlePlaceOrder : handleNextStep} className="checkout-grid-layout">
        
        {/* Dynamic Left Column (Conditionally renders based on Step) */}
        <div className="checkout-primary-form">
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            
            {/* STEP 1: SHIPPING */}
            {step === 1 && (
              <div className="checkout-step-content animate-scale-in">
                <h3 className="checkout-step-title mb-4">📦 Dispatch Coordinates</h3>
                <p className="text-muted mb-4">Confirm shipping address to calculate delivery timelines.</p>
                
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input type="text" className="form-input" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} required placeholder="Block/Building/Street" />
                </div>

                <div className="form-grid-2-col">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="form-input" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State / Province</label>
                    <input type="text" className="form-input" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} required />
                  </div>
                </div>

                <div className="form-grid-2-col">
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input type="text" className="form-input" value={address.zipCode} onChange={(e) => setAddress({...address, zipCode: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" className="form-input" value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} required />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-4">Confirm Address →</button>
              </div>
            )}

            {/* STEP 2: PAYMENT */}
            {step === 2 && (
              <div className="checkout-step-content animate-scale-in">
                <h3 className="checkout-step-title mb-4">💳 Settlement Options</h3>
                <p className="text-muted mb-4">Select your preferred transaction layer.</p>
                
                <div className="payment-methods-grid">
                  {[
                    { id: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
                    { id: 'UPI', label: 'UPI Array', icon: '📱' },
                    { id: 'COD', label: 'Pay on Delivery', icon: '💵' }
                  ].map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`payment-option-card ${paymentMethod === method.id ? 'selected' : ''}`}
                    >
                      <div className="pay-icon">{method.icon}</div>
                      <div className="pay-label">{method.label}</div>
                    </button>
                  ))}
                </div>

                <div className="glass-panel text-center p-4 mt-4 text-muted">
                    {paymentMethod === 'CARD' && "💳 AES-256 Validated Secure Gateway"}
                    {paymentMethod === 'UPI' && "📱 Supports GPay, PhonePe, and Paytm"}
                    {paymentMethod === 'COD' && "💵 Direct cash handling strictly to official delivery agents"}
                </div>

                <div className="flex justify-between mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary">Review Order →</button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="checkout-step-content animate-scale-in">
                <h3 className="checkout-step-title mb-4">✅ Final Verification</h3>
                
                <div className="review-summary-block mb-4">
                   <div className="review-block-header">Dispatching To</div>
                   <div className="review-block-value">
                      {address.street}, {address.city}, {address.state} {address.zipCode}, {address.country}
                   </div>
                </div>
                
                <div className="review-summary-block mb-4">
                   <div className="review-block-header">Settlement Via</div>
                   <div className="review-block-value">
                      {paymentMethod === 'CARD' ? 'Credit/Debit Card Terminal' : paymentMethod === 'UPI' ? 'UPI Cloud Gateway' : 'Cash on Delivery'}
                   </div>
                </div>

                <div className="flex justify-between mt-5">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Edit Payment</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#10b981' }} disabled={loading}>
                     {loading ? 'Processing Transaction...' : paymentMethod === 'COD' ? 'Confirm Total Order' : `Pay ₹${grandTotal.toFixed(0)} Now`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Static Right Column: Order Summary (Always visible) */}
        <div className="checkout-sidebar-summary">
          <div className="glass-panel sticky-sidebar" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            <h3 className="checkout-step-title" style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Cart Assessment</h3>
            
            <div className="checkout-sidebar-items-list mt-3">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-sidebar-item flex justify-between py-2">
                  <div className="checkout-item-name" title={item.name}>
                    <span className="text-muted mr-1">{item.quantity}x</span> {item.name}
                  </div>
                  <div className="checkout-item-price font-bold">₹{(item.price * item.quantity).toFixed(0)}</div>
                </div>
              ))}
            </div>

            <hr className="my-4 border-slate-700" />
            
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-muted text-sm">
                <span>Subtotal Costs</span>
                <span>₹{cartTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-muted text-sm">
                <span>Logistics</span>
                <span>{shippingCost === 0 ? 'COMPLIMENTARY' : `₹${shippingCost.toFixed(0)}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-900 rounded-lg p-4 invoice-total-block">
               <span className="font-bold">Grand Total</span>
               <span className="text-xl font-black text-blue-500">₹{grandTotal.toFixed(0)}</span>
            </div>
            {step === 3 && paymentMethod !== 'COD' && (
              <div className="text-center mt-3 text-xs text-muted">
                You will be redirected securely to Razorpay checkout.
              </div>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
