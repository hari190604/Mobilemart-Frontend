import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import './MiniCart.css';

export const MiniCart = () => {
  const { isCartDrawerOpen, closeCartDrawer, cartItems, cartTotal, cartCount, updateQuantity, removeFromCart } = useCart();

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  return (
    <>
      <div 
        className={`minicart-backdrop ${isCartDrawerOpen ? 'open' : ''}`} 
        onClick={closeCartDrawer}
      ></div>

      <div className={`minicart-drawer ${isCartDrawerOpen ? 'open' : ''} font-sans`}>
        <div className="minicart-header">
          <h2 className="minicart-title">
            🛒 Shopping Cart
          </h2>
          <button className="minicart-close-btn" onClick={closeCartDrawer} aria-label="Close cart">
            ✕
          </button>
        </div>

        {cartItems.length > 0 ? (
          <>
            <div className="minicart-body">
              {cartItems.map((item) => (
                <div key={item.id} className="minicart-item">
                  <img src={item.imageUrl} alt={item.name} className="minicart-item-img" />
                  <div className="minicart-item-details">
                    <span className="minicart-item-brand">{item.brand || 'MobileMart'}</span>
                    <Link 
                      to={`/products/${item.id}`} 
                      className="minicart-item-name" 
                      onClick={closeCartDrawer}
                    >
                      {item.name}
                    </Link>
                    <span className="minicart-item-price">₹{item.price.toFixed(0)}</span>
                    <div className="minicart-qty-controls">
                      <button 
                        className="minicart-qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >-</button>
                      <span className="minicart-qty-val">{item.quantity}</span>
                      <button 
                        className="minicart-qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                  </div>
                  <button 
                    className="minicart-item-remove" 
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="minicart-footer">
              <div className="minicart-summary-row">
                <span>Total Items</span>
                <span>{cartCount}</span>
              </div>
              <div className="minicart-total-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              
              <div className="minicart-actions">
                <Link to="/cart" className="btn btn-secondary glass-panel" onClick={closeCartDrawer}>
                  View Cart
                </Link>
                <Link to="/checkout" className="btn btn-primary" onClick={closeCartDrawer}>
                  Checkout
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="minicart-empty">
            <span style={{ fontSize: '48px', opacity: 0.5 }}>🛒</span>
            <h3>Your cart is empty.</h3>
            <p style={{ marginBottom: '24px', fontSize: '14.5px' }}>Looks like you haven't added any premium gadgets to your cart yet.</p>
            <button className="btn btn-primary" onClick={closeCartDrawer} style={{ padding: '12px 32px' }}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MiniCart;
