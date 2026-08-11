import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { inferBrandFromName } from '../utils/brandHelper';
import { BrandLogo } from '../components/common/BrandLogo';
import './Home.css';

export const Home = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [fetchError, setFetchError] = useState(false);

  // Auto Slider States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // 1. Fetch Featured Products for Hero
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const res = await api.get('/public/products/featured');
        setFeaturedProducts(res.data.data || []);
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // Auto Slider Mechanics
  useEffect(() => {
    if (!isPaused && featuredProducts.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [featuredProducts, isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);

  // 2. Fetch All Products
  const fetchEverything = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const [catsRes, prodsRes] = await Promise.all([
        api.get('/public/categories'),
        api.get('/public/products?size=1000')
      ]);
      
      const categories = catsRes.data.data || [];
      setCategoriesList(categories.filter(c => c.categoryName !== 'Camera Phones'));
      
      let items = prodsRes.data.data.content || prodsRes.data.data || [];
      const mapped = items.map(p => ({
        ...p,
        id: p.productId,
        brand: inferBrandFromName(p.name),
        rating: 4.8, 
        reviewsCount: Math.floor(Math.random() * 500) + 120, // UI Mock
        imageUrl: p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://via.placeholder.com/200'
      }));
      setProductsList(mapped);
    } catch (err) {
      console.error("Home elements fallback:", err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEverything();
  }, []);

  // ===============================
  // DYNAMIC "TEN-TIER" LOGIC MAPPING
  // ===============================
  
  // Robust Trending Selection logic
  const getTrendingPhones = () => {
    // 1. Get all smartphones correctly
    const allPhones = productsList.filter(p => p.category?.categoryName === 'Smart Phones' || p.category === 'Smart Phones');
    
    // 2. If NO smartphones exist, fallback to featured or latest products
    if (allPhones.length === 0) {
      if (featuredProducts && featuredProducts.length > 0) return featuredProducts.slice(0, 4);
      return [...productsList].sort((a,b) => b.productId - a.productId).slice(0, 4);
    }
    
    // 3. Otherwise try to get Trending (Featured first, then most expensive as proxy for premium/popular, then newest)
    let trending = allPhones.filter(p => p.featured);
    
    if (trending.length < 4) {
      // fill remaining with highest price ones
      const nonFeatured = allPhones.filter(p => !p.featured).sort((a,b) => b.price - a.price);
      trending = [...trending, ...nonFeatured];
    }
    
    return trending.slice(0, 4);
  };

  const trendingPhones = getTrendingPhones();
  
  const latestLaunches = [...productsList].sort((a,b) => b.productId - a.productId).slice(0, 4); // assume newest ID = latest
  const gamingPhones = productsList.filter(p => p.brand === 'Asus' || p.brand === 'Nothing' || p.description?.toLowerCase().includes('gaming')).slice(0, 4);
  const premiumFlagships = productsList.filter(p => p.price >= 80000).slice(0, 4);
  const budgetSmartphones = productsList.filter(p => p.category?.categoryName === 'Smart Phones' && p.price <= 35000).slice(0, 4);

  const handleBrandSelect = (brandName) => {
    navigate(`/products?brand=${encodeURIComponent(brandName)}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      alert(`Welcome to the inner circle! Exclusive launches will be sent to: ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  // Generic Reusable Product Grid Renderer
  const renderProductGrid = (sectionTitle, products, shimmerCount = 4) => (
    <section className="home-section animate-on-scroll">
      <div className="section-header-block">
        <h2 className="section-main-title">{sectionTitle}</h2>
        <Link to="/products" className="view-all-link">View All <span className="arrow">→</span></Link>
      </div>
      
      <div className="products-cards-grid">
        {loading ? (
          Array(shimmerCount).fill(0).map((_, idx) => (
            <div key={idx} className="shimmer-skeleton-card">
              <div className="shimmer-image skeleton-loader" />
              <div className="shimmer-line title skeleton-loader mt-3" style={{width:'80%', height:'20px'}}/>
              <div className="shimmer-line price skeleton-loader mt-2" style={{width:'40%', height:'24px'}}/>
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="premium-product-card glass-panel" onClick={() => navigate(`/products/${p.id}`)} style={{cursor: 'pointer'}}>
              <div className="product-card-thumbnail-anchor">
                <img src={p.imageUrl} alt={p.name} className="product-card-thumbnail-img" />
              </div>
              <div className="pd-meta">
                <span className="product-card-brand-lbl">{p.brand}</span>
                <h4 className="product-card-title-link">{p.name}</h4>
                <div className="product-card-price-overlay">
                  <span className="product-card-price-current">₹{p.price?.toLocaleString()}</span>
                </div>
              </div>
              <div className="product-card-actions-wrapper">
                <button className="product-card-btn-action add-cart" onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : fetchError ? (
           <div className="empty-section-notice mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span>Unable to load trending products.</span>
              <button className="btn btn-secondary btn-sm" onClick={fetchEverything}>Retry</button>
           </div>
        ) : (
           <div className="empty-section-notice mt-4">No products available in the database.</div>
        )}
      </div>
    </section>
  );

  return (
    <div className="home-page-container">
      
      {/* 1. HERO SECTION (Dynamic Carousel) */}
      <section 
        className="hero-slider-section" 
        onMouseEnter={() => setIsPaused(true)} 
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="hero-glow-element" />
        
        {loadingFeatured ? (
           <div className="skeleton-loader hero-skeleton-placeholder"></div>
        ) : (
          <div className="hero-slider-container">
            {featuredProducts.length > 0 ? (
              <div className="hero-slide active">
                <div className="hero-left-content">
                  <span className="hero-tag">🔥 Featured Flagship</span>
                  <h1 className="hero-title">{featuredProducts[currentSlide]?.name || 'Featured Product'}</h1>
                  <p className="hero-desc">{featuredProducts[currentSlide]?.description?.substring(0, 140) || 'Check out our latest premium mobile offering.'}</p>
                  <h2 className="hero-price-tag">₹{featuredProducts[currentSlide]?.price?.toLocaleString() || 'N/A'}</h2>
                  
                  <div className="hero-btn-group font-sans mt-4">
                    <Link 
                      to={`/products/${featuredProducts[currentSlide].productId}#purchase-section`} 
                      className="btn btn-primary"
                      onClick={() => setIsPaused(true)}
                    >
                      Buy Now
                    </Link>
                    <Link 
                      to={`/products/${featuredProducts[currentSlide].productId}`} 
                      className="btn btn-secondary glass-panel"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                
                <div className="hero-right-image animate-scale-in">
                  <img src={featuredProducts[currentSlide].images?.[0]?.imageUrl || 'https://via.placeholder.com/400'} alt="Featured" className="hero-slide-img" />
                </div>
              </div>
            ) : (
              <div className="hero-left-content">
                  <h1 className="hero-title">Experience Modern Innovation</h1>
                  <p className="hero-desc">Explore our curated catalog of elite smartphones, smart wearables, and professional accessories.</p>
                  <Link to="/products" className="btn btn-primary mt-4">Shop Catalog 📱</Link>
              </div>
            )}
            
            {/* Slider Controls */}
            {featuredProducts.length > 1 && (
              <>
                <button className="slider-control prev glass-panel" onClick={prevSlide}>❮</button>
                <button className="slider-control next glass-panel" onClick={nextSlide}>❯</button>
                <div className="slider-dots">
                  {featuredProducts.map((_, idx) => (
                    <button key={idx} className={`dot ${idx === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(idx)}></button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* 2. Shop by Brand */}
      <section className="animate-on-scroll brand-showcase">
        <div className="section-header-block text-center">
          <h2 className="section-main-title">Premium Partner Brands</h2>
        </div>
        <div className="brand-section-grid font-sans">
          {['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing'].map(brand => (
             <div key={brand} className="brand-card glass-panel" onClick={() => handleBrandSelect(brand)}>
                <BrandLogo brand={brand} />
                <span className="brand-name-hover mt-3">{brand}</span>
             </div>
          ))}
        </div>
      </section>

      {/* 3. Trending Phones */}
      {renderProductGrid("📈 Trending Smartphones", trendingPhones)}

      {/* 4. Latest Launches */}
      {renderProductGrid("🚀 Latest Launches", latestLaunches)}

      {/* 5. Gaming Phones */}
      {renderProductGrid("🎮 Ultimate Gaming Hub", gamingPhones)}

      {/* 6. Premium Flagships */}
      <section className="premium-banner-split animate-on-scroll">
         <div className="banner-left glass-panel">
            <h2>The Pro Experience.</h2>
            <p>Titanium builds, boundary-breaking processing cores, and cinematic lenses.</p>
            <Link to="/products?priceMin=80000" className="btn btn-primary mt-4">Shop Premium</Link>
         </div>
         <div className="banner-right">
            {renderProductGrid("Ultra Flagships", premiumFlagships, 2)}
         </div>
      </section>

      {/* 7. Budget Smartphones */}
      {renderProductGrid("💡 Quality on a Budget", budgetSmartphones)}

      {/* 8. Why Choose MobileMart */}
      <section className="home-section animate-on-scroll">
        <div className="section-header-block text-center">
          <h2 className="section-main-title">The MobileMart Advantage</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card glass-panel text-center">
            <div className="feature-icon mb-3" style={{fontSize: '40px'}}>🛡️</div>
            <h4>Verified Authentic</h4>
            <p className="text-muted mt-2">Every product strictly verified for global warranty alignment.</p>
          </div>
          <div className="feature-card glass-panel text-center">
            <div className="feature-icon mb-3" style={{fontSize: '40px'}}>⚡</div>
            <h4>Hyper-Fast Delivery</h4>
            <p className="text-muted mt-2">Premium 24-hour dispatch architecture across major global metros.</p>
          </div>
          <div className="feature-card glass-panel text-center">
            <div className="feature-icon mb-3" style={{fontSize: '40px'}}>💳</div>
            <h4>Secure SSL Checkout</h4>
            <p className="text-muted mt-2">Military-grade AES encryption protecting your payment methods.</p>
          </div>
        </div>
      </section>

      {/* 9. Customer Testimonials */}
      <section className="home-section animate-on-scroll mb-5">
        <div className="section-header-block text-center">
          <h2 className="section-main-title">Enterprise Reviews</h2>
        </div>
        <div className="features-grid">
          <div className="testimonial-card glass-panel">
            <div className="stars mb-2" style={{color: 'var(--warning)'}}>★★★★★</div>
            <p className="mb-3">"The UI is unbelievably smooth, and the logistics engine delivered my iPhone 16 Pro ahead of the scheduled ETA. Absolutely incredible."</p>
            <strong>- Sarah J.</strong>
          </div>
          <div className="testimonial-card glass-panel">
            <div className="stars mb-2" style={{color: 'var(--warning)'}}>★★★★★</div>
            <p className="mb-3">"Finally an electronics store that understands premium aesthetic. The checkout was razor fast. I don't buy tech anywhere else."</p>
            <strong>- Michael K.</strong>
          </div>
          <div className="testimonial-card glass-panel">
            <div className="stars mb-2" style={{color: 'var(--warning)'}}>★★★★★</div>
            <p className="mb-3">"Sleek interface, zero clutter, and my Nothing Phone (2) arrived perfectly sealed with valid warranty documents."</p>
            <strong>- Raj P.</strong>
          </div>
        </div>
      </section>

      {/* 10. Newsletter */}
      <section className="newsletter-section animate-on-scroll">
        <div className="newsletter-box glass-panel">
          <h2>Subscribe to the Future</h2>
          <p>Be the first to secure pre-orders on upcoming flagship releases.</p>
          <form className="newsletter-form mt-4" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Enter your professional email address" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required 
            />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
