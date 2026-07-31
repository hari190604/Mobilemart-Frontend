import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

/**
 * TODO: FRONTEND DEVELOPER 2 - Cart Backend Integration
 * 
 * 1. Connect update quantity actions to database APIs: `PUT /api/v1/cart/items/{itemId}?quantity={qty}`.
 * 2. Connect item deletion actions: `DELETE /api/v1/cart/items/{itemId}`.
 * 3. Connect clear checkout cart actions: `DELETE /api/v1/cart/clear`.
 * 4. Keep local CartContext functions synchronized with API payloads.
 */
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

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Left: Cart Items lists */}
        <div style={{ flex: '3 1 600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card" style={{ padding: '20px' }}>
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                className="flex align-center justify-between"
                style={{ 
                  padding: '20px 0', 
                  borderBottom: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                {/* Product spec preview */}
                <div className="flex align-center gap-2" style={{ flex: '1 1 300px' }}>
                  <div style={{ minWidth: '80px', height: '80px', background: '#f1f5f9', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContents: 'center' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{item.brand}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{item.name}</h3>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Unit: ${item.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Modifiers & controls */}
                <div className="flex align-center gap-3">
                  {/* Quantity increments */}
                  <div className="flex align-center" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ border: 'none', padding: '6px 12px', background: 'var(--bg-main)', cursor: 'pointer', fontWeight: '700' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '6px 14px', fontWeight: '750', minWidth: '35px', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ border: 'none', padding: '6px 12px', background: 'var(--bg-main)', cursor: 'pointer', fontWeight: '700' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Calculations */}
                  <div style={{ minWidth: '95px', textAlign: 'right', fontWeight: '700', fontSize: '16px' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Trash delete */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart control */}
            <div className="flex justify-between" style={{ marginTop: '20px' }}>
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
        <div style={{ flex: '1 1 300px' }}>
          <div className="card bg-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
              <div className="flex justify-between">
                <span className="text-muted">Subtotal Items</span>
                <span style={{ fontWeight: '650' }}>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
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

            <div className="flex justify-between" style={{ fontSize: '20px', fontWeight: '800' }}>
              <span>Total Price</span>
              <span style={{ color: 'var(--text-main)' }}>${grandTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckoutNav} 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
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
