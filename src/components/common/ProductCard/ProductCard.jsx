import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

export const ProductCard = ({ product, onAddToCart }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  // Calculate simulated 15% discount pricing
  const originalPrice = product.price * 1.15;
  const discountPercentage = 15;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const isInStock = product.stockQuantity > 0;

  return (
    <div className="premium-product-card font-sans">
      
      {/* Badges Container */}
      <div className="product-card-badges-container">
        <span className="card-discount-tag">{discountPercentage}% OFF</span>
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
        <div className="product-card-price-overlay">
          <span className="product-card-price-current">${product.price.toFixed(0)}</span>
          <span className="product-card-price-crossed">${originalPrice.toFixed(0)}</span>
        </div>

        {/* Buying Button rows */}
        <div className="product-card-actions-wrapper">
          
          <button 
            type="button" 
            className="product-card-btn-action add-cart"
            onClick={handleAddClick}
            disabled={!isInStock}
          >
            {isInStock ? '🛒 Add' : 'Out of Stock'}
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
