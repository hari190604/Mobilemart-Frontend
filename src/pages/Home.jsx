import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockProducts } from '../utils/mockProducts';
import { useCart } from '../contexts/CartContext';
import './Home.css';

export const Home = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Simulate loading delay for shimmer effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Filter products
  const featuredMobiles = mockProducts.filter(p => p.category === 'Smartphones');
  const bestSellers = mockProducts.filter(p => p.category !== 'Smartphones').slice(0, 4);

  const handleBrandSelect = (brandName) => {
    navigate(`/products?brand=${encodeURIComponent(brandName)}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      alert(`Welcome to the inner circle! Mock subscription saved for: ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  const renderShimmers = () => {
    return Array(4).fill(0).map((_, idx) => (
      <div key={idx} className="shimmer-skeleton-card" role="status" aria-busy="true">
        <div className="shimmer-element" />
        <div className="shimmer-image" />
        <div className="shimmer-line brand" />
        <div className="shimmer-line title" />
        <div className="shimmer-line sub" />
        <div className="shimmer-footer">
          <div className="shimmer-price" />
          <div className="shimmer-button" />
        </div>
      </div>
    ));
  };

  return (
    <div className="home-page-container">
      
      {/* 1. Hero Banner */}
      <section className="hero-promo-banner">
        <div className="hero-glow-element" />
        <div className="hero-left-content">
          <span className="hero-tag">⚡ Next-Gen Flagships Available</span>
          <h1 className="hero-title">Experience Modern Innovation</h1>
          <p className="hero-desc">
            Explore our curated catalog of elite smartphones, smart wearables, and professional accessories. High performance, verified warranties, and global express shipping.
          </p>
          <div className="hero-btn-group font-sans">
            <Link to="/products" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Shop Catalog 📱
            </Link>
            <Link to="/products?category=Wearables" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px', color: 'var(--text-main)' }}>
              Explore Watches ⌚
            </Link>
          </div>
        </div>
        
        {/* Floating Hero image SVG placeholder */}
        <div className="hero-right-image" aria-hidden="true">
          <svg width="340" height="340" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="gradientSphere" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--accent)" />
                <stop offset="1" stopColor="var(--accent-hover)" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#gradientSphere)" opacity="0.15" />
            <rect x="60" y="30" width="80" height="140" rx="16" stroke="var(--accent)" strokeWidth="4" fill="rgba(15, 23, 42, 0.6)" />
            <circle cx="100" cy="155" r="8" fill="var(--accent)" />
            <rect x="85" y="40" width="30" height="6" rx="3" fill="var(--accent)" opacity="0.6" />
            {/* Interactive screen elements */}
            <circle cx="100" cy="90" r="24" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M90 90 L97 97 L112 82" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* 2. Shop by Brand */}
      <section>
        <div className="section-header-block">
          <h2 className="section-main-title">Shop by Brand</h2>
          <p className="section-sub-desc">Click a manufacturer to filter our flagships catalog.</p>
        </div>
        <div className="brand-section-grid font-sans">
          {[
            { name: 'Apple', code: 'Ap' },
            { name: 'Samsung', code: 'S' },
            { name: 'OnePlus', code: '1+' },
            { name: 'Vivo', code: 'V' },
            { name: 'Xiaomi', code: 'Mi' },
            { name: 'Realme', code: 'R' }
          ].map((brand) => (
            <div 
              key={brand.name} 
              onClick={() => handleBrandSelect(brand.name)} 
              className="brand-card-link"
              title={`View ${brand.name} products`}
            >
              <div className="brand-avatar-circle">{brand.code}</div>
              <span className="brand-name">{brand.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Popular Categories */}
      <section>
        <div className="section-header-block">
          <h2 className="section-main-title">Browse Categories</h2>
          <p className="section-sub-desc">Explore premium mobile tech categories.</p>
        </div>
        <div className="grid grid-cols-4 gap-2 font-sans">
          {[
            { name: 'Smartphones', icon: '📱', desc: 'Premium phones' },
            { name: 'Wearables', icon: '⌚', desc: 'Smartwatches & monitors' },
            { name: 'Accessories', icon: '🔌', desc: 'Chargers & audio buds' },
            { name: 'Tablets', icon: '📁', desc: 'Next-gen iPads & tabs' }
          ].map((cat) => (
            <Link 
              key={cat.name} 
              to={`/products?category=${cat.name}`} 
              className="card flex align-center gap-2" 
              style={{ padding: '20px', textDecoration: 'none', justifyContent: 'flex-start' }}
            >
              <span style={{ fontSize: '36px' }}>{cat.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)' }}>{cat.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Mobiles */}
      <section>
        <div className="section-header-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="section-main-title">Featured Mobiles</h2>
            <p className="section-sub-desc">Top tier smartphones with maximum specs.</p>
          </div>
          <Link to="/products?category=Smartphones" className="btn btn-secondary btn-sm font-sans" style={{ color: 'var(--text-main)' }}>
            View All Mobiles →
          </Link>
        </div>

        <div className="products-cards-grid">
          {loading ? (
            renderShimmers()
          ) : (
            featuredMobiles.map((product) => (
              <div key={product.id} className="product-item-card">
                <span className="product-badge-tag">Flagship</span>
                
                <Link to={`/products/${product.id}`} className="product-image-container">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-img"
                  />
                </Link>

                <div style={{ textAlign: 'left' }}>
                  <span className="product-brand-lbl">{product.brand}</span>
                  <Link to={`/products/${product.id}`} className="product-title-lkn">
                    <h3 className="product-title-txt">{product.name}</h3>
                  </Link>
                  
                  <div className="stars-rating-row">
                    <div className="star-string">
                      {'★'.repeat(Math.round(product.rating))}
                      {'☆'.repeat(5 - Math.round(product.rating))}
                    </div>
                    <span className="reviews-cnt">({product.reviewsCount} reviews)</span>
                  </div>

                  <div className="product-bottom-row">
                    <span className="product-card-price">${product.price.toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)} 
                      className="btn btn-primary btn-sm font-sans"
                      style={{ display: 'inline-flex', padding: '6px 12px' }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      🛒 Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Latest Offers */}
      <section>
        <div className="section-header-block">
          <h2 className="section-main-title">Latest Promotional Offers</h2>
          <p className="section-sub-desc">Take advantage of limited deals and code claims.</p>
        </div>
        <div className="offers-grid font-sans">
          <div 
            className="offer-promo-card" 
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=40')` }}
          >
            <div className="offer-bg-overlay" />
            <div className="offer-content-box">
              <span className="offer-badge">Discount Claim</span>
              <h3 className="offer-title">Save 10% on Flagships</h3>
              <p className="offer-desc">Apply code at checkout on any smartphone models purchase.</p>
              <div className="offer-coupon">MOBILEMART10</div>
            </div>
          </div>
          <div 
            className="offer-promo-card" 
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=40')` }}
          >
            <div className="offer-bg-overlay" />
            <div className="offer-content-box">
              <span className="offer-badge">Free Shipping</span>
              <h3 className="offer-title">Free Courier Express</h3>
              <p className="offer-desc">Complimentary shipping on orders exceeding $199.</p>
              <div className="offer-coupon">FREESHIP2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Best Sellers */}
      <section>
        <div className="section-header-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="section-main-title">Featured Best Sellers</h2>
            <p className="section-sub-desc">Highly requested gear, wearables, and essential accessories.</p>
          </div>
          <Link to="/products" className="btn btn-secondary btn-sm font-sans" style={{ color: 'var(--text-main)' }}>
            View All Catalog →
          </Link>
        </div>

        <div className="products-cards-grid">
          {loading ? (
            renderShimmers()
          ) : (
            bestSellers.map((product) => (
              <div key={product.id} className="product-item-card">
                <span className="product-badge-tag" style={{ backgroundColor: 'var(--text-main)', color: 'var(--bg-card)' }}>
                  Hot
                </span>
                
                <Link to={`/products/${product.id}`} className="product-image-container">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-img"
                  />
                </Link>

                <div style={{ textAlign: 'left' }}>
                  <span className="product-brand-lbl">{product.brand}</span>
                  <Link to={`/products/${product.id}`} className="product-title-lkn">
                    <h3 className="product-title-txt">{product.name}</h3>
                  </Link>
                  
                  <div className="stars-rating-row">
                    <div className="star-string">
                      {'★'.repeat(Math.round(product.rating))}
                      {'☆'.repeat(5 - Math.round(product.rating))}
                    </div>
                    <span className="reviews-cnt">({product.reviewsCount} reviews)</span>
                  </div>

                  <div className="product-bottom-row">
                    <span className="product-card-price">${product.price.toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)} 
                      className="btn btn-primary btn-sm font-sans"
                      style={{ display: 'inline-flex', padding: '6px 12px' }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      🛒 Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 7. Customer Testimonials */}
      <section>
        <div className="section-header-block">
          <h2 className="section-main-title">What Our Customers Say</h2>
          <p className="section-sub-desc">Customer satisfaction is our bottom line.</p>
        </div>
        <div className="testimonials-view-grid font-sans">
          {[
            {
              text: "The delivery speed is incredible! I ordered my iPhone 15 Pro Max, and it arrived in pristine condition within 24 hours. Phenomenal packaging as well.",
              name: "Marcus Aurelius",
              role: "Developer",
              initials: "MA"
            },
            {
              text: "Unbeatable prices on chargers and earbud accessories. The S24 Ultra is a powerhouse. Customer support handled my warranty activation code query in 3 minutes.",
              name: "Sophia Martinez",
              role: "Creative Director",
              initials: "SM"
            },
            {
              text: "Extremely clean web dashboard layout. Toggling theme modes is satisfyingly fast and the checkout layout works beautifully. MobileMart is my favorite supplier.",
              name: "Liam O'Connor",
              role: "Tech Analyst",
              initials: "LO"
            }
          ].map((item, idx) => (
            <div key={idx} className="testimonial-card-block">
              <div className="star-string" style={{ marginBottom: '16px' }}>★ ★ ★ ★ ★</div>
              <p className="testimonial-client-text">"{item.text}"</p>
              
              <div className="testimonial-client-group">
                <div className="testimonial-client-avatar">{item.initials}</div>
                <div>
                  <h4 className="testimonial-client-name">{item.name}</h4>
                  <span className="testimonial-client-role">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Newsletter Card Section */}
      <section className="newsletter-card-banner">
        <div className="newsletter-card-box">
          <h2 className="newsletter-card-title">Join the MobileMart Circle</h2>
          <p className="newsletter-card-desc font-sans">
            Subscribe to receive priority product drop notifications, exclusive coupon code codes, and weekly gadget launches analysis.
          </p>
          <form className="newsletter-inline-form font-sans" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              className="newsletter-inline-input" 
              placeholder="Enter your email address..."
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button type="submit" className="newsletter-inline-btn">Subscribe</button>
          </form>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
