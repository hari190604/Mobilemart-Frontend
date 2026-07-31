import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './Cart.css';

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckoutNav = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <span style={{ fontSize: '64px' }}>🛒</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0' }}>Your Shopping Cart is Empty</h2>
        <p className="text-muted">You have not added any mobile devices or accessories to your cart yet.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Explore Products Catalog
        </Link>
      </div>
    );
  }

  const shippingCost = cartTotal > 500 ? 0.00 : 10.00;
  const grandTotal = cartTotal + shippingCost;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      <h1 style={{ fontSize: '32px' }}>Shopping Cart Bag</h1>

      <div className="cart-container">
        {/* Left: Cart Items lists */}
        <div className="cart-items-section">
          <div className="card" style={{ padding: '20px' }}>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                {/* Product spec preview */}
                <div className="cart-item-media">
                  <div className="cart-item-img-wrapper">
                    <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div className="cart-item-details">
                    <span className="cart-item-brand">{item.brand}</span>
                    <h3 className="cart-item-name">{item.name}</h3>
                    <span className="cart-item-price">Unit: ${item.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Modifiers & controls */}
                <div className="cart-item-actions">
                  {/* Quantity increments */}
                  <div className="quantity-selector">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-display">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  {/* Calculations */}
                  <div className="item-total-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Trash delete */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="remove-item-btn"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart control */}
            <div className="cart-controls-footer">
              <Link to="/products" className="btn btn-secondary btn-sm">
                ← Continue Shopping
              </Link>
              <button onClick={clearCart} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                Clear Cart Bag
              </button>
            </div>
          </div>
        </div>

        {/* Right: Cart Summary total panel */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
              <div className="summary-row">
                <span className="text-muted">Subtotal Items</span>
                <span style={{ fontWeight: '650' }}>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Estimated Shipping</span>
                <span style={{ fontWeight: '650' }}>
                  {shippingCost === 0 ? (
                    <span style={{ color: 'var(--success)' }}>FREE</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-8px' }}>
                (Free shipping for order amounts over $500.00)
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            <div className="summary-row total">
              <span>Total Price</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckoutNav} 
              className="checkout-btn"
            >
              Proceed to Checkout 💰
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
