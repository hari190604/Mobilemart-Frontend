import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockProducts } from '../utils/mockProducts';
import { useCart } from '../contexts/CartContext';
import './ProductDetails.css';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const saved = localStorage.getItem('mobilemart_wishlist');
      const wishlist = saved ? JSON.parse(saved) : [];
      return wishlist.includes(parseInt(id));
    } catch {
      return false;
    }
  });
  const [wishlistToast, setWishlistToast] = useState('');

  // Retrieve the requested product
  const product = mockProducts.find((p) => p.id === parseInt(id));

  // Reset states and scroll to top when product ID transitions
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    try {
      const saved = localStorage.getItem('mobilemart_wishlist');
      const wishlist = saved ? JSON.parse(saved) : [];
      setIsWishlisted(wishlist.includes(parseInt(id)));
    } catch {
      setIsWishlisted(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Sync state if changed externally
  useEffect(() => {
    const syncWishlist = () => {
      try {
        const saved = localStorage.getItem('mobilemart_wishlist');
        const wishlist = saved ? JSON.parse(saved) : [];
        setIsWishlisted(wishlist.includes(parseInt(id)));
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('wishlist-updated', syncWishlist);
    return () => window.removeEventListener('wishlist-updated', syncWishlist);
  }, [id]);

  // Handle toast timeout cleanup
  useEffect(() => {
    if (wishlistToast) {
      const timer = setTimeout(() => {
        setWishlistToast('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [wishlistToast]);

  if (!product) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <span style={{ fontSize: '64px' }}>⚠️</span>
        <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0', color: 'var(--text-main)' }}>Product Not Found</h2>
        <p className="text-muted">The device you are looking for does not exist or has been removed from our stocks.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Back to Store Catalog
        </Link>
      </div>
    );
  }

  // Create simulated multi-angle thumbnails
  const galleryImages = [
    product.imageUrl,
    product.imageUrl + "?sig=angle2",
    product.imageUrl + "?sig=angle3"
  ];

  // Calculate 15% crossed out original price to render discount badges
  const originalPrice = product.price * 1.15;

  // Retrieve products in the same category (excluding current)
  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleQtyChange = (val) => {
    if (val < 1) return;
    if (val > product.stockQuantity) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Display standard overlay feedback
    alert(`Added ${quantity}x ${product.name} to your shopping cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    setIsWishlisted((prev) => {
      const nextState = !prev;
      try {
        const saved = localStorage.getItem('mobilemart_wishlist');
        let wishlist = saved ? JSON.parse(saved) : [];
        const numId = parseInt(id);
        if (nextState) {
          if (!wishlist.includes(numId)) {
            wishlist.push(numId);
          }
        } else {
          wishlist = wishlist.filter((x) => x !== numId);
        }
        localStorage.setItem('mobilemart_wishlist', JSON.stringify(wishlist));
        window.dispatchEvent(new Event('wishlist-updated'));
      } catch (err) {
        console.error(err);
      }
      
      setWishlistToast(nextState ? 'Added to Wishlist! ❤️' : 'Removed from Wishlist. 💔');
      return nextState;
    });
  };

  // Mock list of reviews
  const mockReviews = [
    {
      author: 'Sophia L.',
      rating: 5,
      date: '3 days ago',
      title: 'Amazing device!',
      text: `Absolutely outstanding flagship experience. The screen resolution is magnificent, and battery life easily carries through the day. Highly recommend this brand!`,
      verified: true
    },
    {
      author: 'Ethan W.',
      rating: 4,
      date: '2 weeks ago',
      title: 'Solid build quality',
      text: `Highly resilient chassis and incredible software customization. Camera is stellar but noticed minor temperature increases during intensive gaming.`,
      verified: true
    },
    {
      author: 'Maya J.',
      rating: 5,
      date: '1 month ago',
      title: 'Value for Money',
      text: `A stellar purchase. The design feels super premium, and it has a long-lasting battery life. Deliveries from MobileMart were extremely fast!`,
      verified: false
    }
  ];

  return (
    <div className="product-details-container font-sans">
      
      {/* Navigation history track */}
      <div className="breadcrumb-trail">
        <Link to="/">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/products">Catalog</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to={`/products?category=${product.category}`}>{product.category}</Link>
        <span className="breadcrumb-separator">/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Main split grid details */}
      <div className="details-split-layout">
        
        {/* Left Side: Product Gallery component */}
        <div className="gallery-wrapper">
          <div className="gallery-main-preview">
            <img 
              src={galleryImages[activeImageIndex]} 
              alt={`${product.name} detail view`} 
              className="gallery-main-img"
            />
          </div>
          <div className="gallery-thumbnails-row">
            {galleryImages.map((image, idx) => (
              <div 
                key={idx}
                className={`gallery-thumbnail-card ${activeImageIndex === idx ? 'active' : ''}`}
                onMouseEnter={() => setActiveImageIndex(idx)}
                onClick={() => setActiveImageIndex(idx)}
              >
                <img src={image} alt={`thumbnail ${idx + 1}`} className="gallery-thumbnail-img" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Product Details info panel */}
        <div className="details-info-panel">
          <div>
            <div className="product-brand-badge">{product.brand} Flagship</div>
            <h1 className="product-details-title">{product.name}</h1>
            
            <div className="product-rating-stars-row">
              <span className="stars-rating-glow">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
              </span>
              <span className="rating-numerical">{product.rating}</span>
              <span className="rating-count-reviews">({product.reviewsCount} verified customer reviews)</span>
            </div>

            {/* Price display with discount details */}
            <div className="price-display-wrapper">
              <span className="active-discount-price">${product.price.toFixed(0)}</span>
              <span className="original-price-crossed">${originalPrice.toFixed(0)}</span>
              <span className="discount-tag-badge">15% OFF</span>
            </div>
          </div>

          <p className="product-description-para">
            {product.description}
          </p>

          <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

          {/* Configuration details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14.5px' }}>
            <div>🎨 <strong>Color Option:</strong> {product.color || 'Standard Slate'}</div>
            <div>💾 <strong>Storage Capacity:</strong> {product.storage || '128GB'}</div>
            <div>
              📦 <strong>Availability:</strong>{' '}
              {product.stockQuantity > 0 ? (
                <span style={{ color: '#10b981', fontWeight: 700 }}>In stock ({product.stockQuantity} units left)</span>
              ) : (
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Out of stock</span>
              )}
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

          {/* Action section */}
          {product.stockQuantity > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Quantity selectors */}
              <div className="quantity-modifier-section">
                <span className="qty-lbl">Select Quantity</span>
                <div className="qty-control-wrapper">
                  <button 
                    type="button" 
                    className="qty-btn" 
                    onClick={() => handleQtyChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-indicator">{quantity}</span>
                  <button 
                    type="button" 
                    className="qty-btn" 
                    onClick={() => handleQtyChange(quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="buying-buttons-row">
                <button 
                  type="button" 
                  onClick={handleAddToCart}
                  className="btn btn-primary"
                  style={{ flex: '1.2', padding: '14px', fontSize: '15px' }}
                >
                  🛒 Add to Cart
                </button>
                <button 
                  type="button" 
                  onClick={handleBuyNow}
                  className="btn-buy-now"
                >
                  ⚡ Buy Now
                </button>
                <button 
                  type="button" 
                  onClick={handleToggleWishlist}
                  className="wishlist-toggle-btn"
                  title="Add to Wishlist"
                >
                  <span style={{ color: isWishlisted ? 'var(--danger)' : 'var(--text-muted)', fontSize: '18px' }}>
                    {isWishlisted ? '❤️' : '🤍'}
                  </span>
                </button>
              </div>

              {/* Toast notifier */}
              {wishlistToast && (
                <div style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--accent)', 
                  color: 'var(--text-main)', 
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  textAlign: 'center',
                  alignSelf: 'flex-start',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  {wishlistToast}
                </div>
              )}

            </div>
          ) : (
            <div style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '15px' }}>
              🚫 Currently out of stock. Contact customer support to request notifications.
            </div>
          )}

        </div>

      </div>

      {/* Tabs segment logic */}
      <div>
        <div className="tabs-control-container">
          <button 
            type="button"
            className={`details-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Technical Specifications
          </button>
          <button 
            type="button"
            className={`details-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Customer Reviews ({product.reviewsCount})
          </button>
        </div>

        <div className="tabs-content-card">
          {activeTab === 'specs' ? (
            <div className="specifications-table">
              {product.specs && Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="specification-cell">
                  <span className="spec-cell-label">{key.replace(/_/g, ' ')}</span>
                  <span className="spec-cell-value">{val}</span>
                </div>
              ))}
              <div className="specification-cell">
                <span className="spec-cell-label">Brand</span>
                <span className="spec-cell-value">{product.brand}</span>
              </div>
              <div className="specification-cell">
                <span className="spec-cell-label">Category</span>
                <span className="spec-cell-value">{product.category}</span>
              </div>
            </div>
          ) : (
            <div className="reviews-tab-list">
              {mockReviews.map((rev, index) => (
                <div key={index} className="review-item-block">
                  <div className="review-header-row">
                    <span className="review-author-name">
                      {rev.author} {rev.verified && <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold', marginLeft: '6px' }}>✓ Verified Buyer</span>}
                    </span>
                    <span className="review-post-date">{rev.date}</span>
                  </div>
                  <div className="review-stars-count">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                  <strong style={{ display: 'block', marginBottom: '6px', fontSize: '14.5px', color: 'var(--text-main)' }}>{rev.title}</strong>
                  <p className="review-item-comment">{rev.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="related-products-row-wrapper">
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>
            Related Products
          </h2>
          <div className="related-grid">
            {relatedProducts.map((item) => (
              <div key={item.id} className="related-card">
                <Link to={`/products/${item.id}`} className="related-card-image-link">
                  <img src={item.imageUrl} alt={item.name} className="related-card-img" />
                </Link>
                <span className="related-card-brand">{item.brand}</span>
                <Link to={`/products/${item.id}`} className="related-card-title">
                  {item.name}
                </Link>
                <div className="related-card-bottom">
                  <span className="related-card-price">${item.price.toFixed(0)}</span>
                  <button 
                    type="button" 
                    onClick={() => addToCart(item, 1)}
                    className="btn btn-primary btn-sm font-sans"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
