import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/common/ProductCard/ProductCard';

import api from '../services/api';

import { useAuth } from '../contexts/AuthContext';

export const Wishlist = () => {
  const { addToCart, wishlistItems: contextWishlistIds, clearWishlist } = useCart();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlisted products from API
  const loadWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get('/cart/wishlist');
      const items = response.data.data || [];
      
      const mapped = items.map(p => ({
        id: p.productId,
        name: p.productName,
        price: p.price,
        stockQuantity: p.quantity, // Quantity field here might not map directly to stock but for Wishlist it's ok
        brand: 'MobileMart',
        rating: 4.5,
        reviewsCount: 120,
        imageUrl: p.productImageUrl || 'https://via.placeholder.com/200'
      }));
      
      setWishlistItems(mapped);
    } catch (err) {
      console.error('Error loading wishlist items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user, contextWishlistIds]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);

  };

  const handleClearWishlist = async () => {
    await clearWishlist();
    setWishlistItems([]);
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading your wishlist...</div>;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <span style={{ fontSize: '64px' }}>❤️</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0', color: 'var(--text-main)' }}>Your Wishlist is Empty</h2>
        <p className="text-muted">You have not marked any devices or accessories as favorites yet.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '24.px', display: 'inline-block' }}>
          Explore Products Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in font-sans" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      
      {/* Header section */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', margin: 0 }}>My Wishlist Favorites</h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            Keep track of the smartphones and accessories you are interested in.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleClearWishlist} 
            className="btn btn-secondary" 
            style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            Clear All Favorites 💔
          </button>
          <Link to="/cart" className="btn btn-primary">
            Proceed to Cart 🛒
          </Link>
        </div>
      </div>

      {/* Recommended Grid Layout */}
      <div className="catalog-cards-responsive-grid" style={{ marginTop: '10px' }}>
        {wishlistItems.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

    </div>
  );
};

export default Wishlist;
