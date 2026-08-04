import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import './ProductCard.css';

export const ProductCard = ({ product, onAddToCart }) => {
  const { wishlistItems, toggleWishlist, cartItems, removeFromCart } = useCart();
  const productId = product?.id;
  
  const isWishlisted = wishlistItems?.includes(productId);
  const isInCart = cartItems?.some(item => item.id === productId);

  if (!product) return null;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (productId) {
      toggleWishlist(productId);
    }
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      removeFromCart(productId);
    } else if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const isInStock = product.stockQuantity > 0;

  return (
    <div className="premium-product-card font-sans">
      
      {/* Badges Container */}
      <div className="product-card-badges-container">
        <span className={`card-stock-tag ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
          {isInStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      {/* Wishlist Icon top-right */}
      <button 
        type="button" 
        className="card-wishlist-toggle-action"
        onClick={handleWishlistToggle}
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        aria-label="Wishlist"
      >
        <span style={{ color: isWishlisted ? '#ef4444' : 'var(--text-muted)', fontSize: '15px' }}>
          {isWishlisted ? '❤️' : '🤍'}
        </span>
      </button>

      {/* Product Image Link */}
      <Link to={`/products/${product.id}`} className="product-card-thumbnail-anchor">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="product-card-thumbnail-img" 
        />
      </Link>

      {/* Brand & Title */}
      <div style={{ textAlign: 'left', marginTop: 'auto' }}>
        <span className="product-card-brand-lbl">{product.brand}</span>
        
        <Link to={`/products/${product.id}`} className="product-card-title-link">
          {product.name}
        </Link>

        {/* Rating Stars row */}
        <div className="product-card-stars-row">
          <span className="product-card-stars-glow">
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
          </span>
          <span className="product-card-reviews-lbl">
            {product.rating.toFixed(1)} ({product.reviewsCount})
          </span>
        </div>

        {/* Pricing Layout */}
        <div className="product-card-price-overlay" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="product-card-price-current">₹{product.price.toFixed(0)}</span>
          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '13px' }}>
            ₹{(product.price / (1 - [15, 23, 27][(product.id || 0) % 3] / 100)).toFixed(0)}
          </span>
          <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>
            {[15, 23, 27][(product.id || 0) % 3]}% OFF
          </span>
        </div>

        {/* Buying Button rows */}
        <div className="product-card-actions-wrapper">
          
          <button 
            type="button" 
            className="product-card-btn-action add-cart"
            onClick={handleAddClick}
            disabled={!isInStock && !isInCart}
          >
            {isInCart ? '🗑️ Remove' : (isInStock ? '🛒 Add' : 'Out of Stock')}
          </button>

          <Link 
            to={`/products/${product.id}`} 
            className="product-card-btn-action view-details"
          >
            Specs 👁️
          </Link>

        </div>

      </div>

    </div>
  );
};

export default ProductCard;
