import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockProducts } from '../utils/mockProducts';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/common/ProductCard/ProductCard';

export const Wishlist = () => {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);

  // Fetch wishlisted products from local storage on component mount
  const loadWishlist = () => {
    try {
      const saved = localStorage.getItem('mobilemart_wishlist');
      const wishlistIds = saved ? JSON.parse(saved) : [];
      const items = mockProducts.filter((product) => wishlistIds.includes(product.id));
      setWishlistItems(items);
    } catch (err) {
      console.error('Error loading wishlist items from localStorage:', err);
    }
  };

  useEffect(() => {
    loadWishlist();

    // Listen for wishlist updates that happen on this page or other components
    const handleWishlistUpdate = () => {
      loadWishlist();
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`Successfully added ${product.name} to your shopping cart! 🛒`);
  };

  const handleClearWishlist = () => {
    try {
      localStorage.setItem('mobilemart_wishlist', JSON.stringify([]));
      setWishlistItems([]);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (err) {
      console.error(err);
    }
  };

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
        <button 
          onClick={handleClearWishlist} 
          className="btn btn-secondary" 
          style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          Clear All Favorites 💔
        </button>
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
