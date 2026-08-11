import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      alert(`Thank you for subscribing! Mock confirmation dispatched to: ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="footer-container">
      <div className="footer-grid">
        
        {/* About Us Column */}
        <div className="footer-column">
          <Link to="/" className="footer-logo brand-logo-container" style={{ justifyContent: 'flex-start' }}>
            <img src="/mobilemart-logo.png" alt="MobileMart Logo" className="brand-logo-img" style={{ height: '28px', marginRight: '8px' }} />
            <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: '#FFF' }}>Mobile<span style={{ color: 'var(--primary)' }}>Mart</span></span>
          </Link>
          <p className="footer-about-text">
            Your premium destination for high-end smartphones, wearable tech, and premium accessories. We deliver unmatched quality, verified products, and stellar support worldwide.
          </p>
          <div className="social-icons-wrapper">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Follow us on X/Twitter">
              <svg className="social-svg" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Follow us on Instagram">
              <svg className="social-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Follow us on Facebook">
              <svg className="social-svg" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Connect with us on LinkedIn">
              <svg className="social-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links & Categories Columns */}
        <div className="footer-column">
          <h4 className="footer-title">Quick Links</h4>
          <div className="footer-links-list font-sans">
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/products" className="footer-link">Products</Link>
            <Link to="/profile" className="footer-link">My Account</Link>
            <Link to="/orders" className="footer-link">Track Orders</Link>
          </div>
        </div>

        <div className="footer-column font-sans">
          <h4 className="footer-title">Categories</h4>
          <div className="footer-links-list">
            <Link to="/products?category=Smartphones" className="footer-link">Smartphones</Link>
            <Link to="/products?category=Wearables" className="footer-link">Wearables</Link>
            <Link to="/products?category=Accessories" className="footer-link">Accessories</Link>
            <Link to="/products?category=Tablets" className="footer-link">Tablets</Link>
          </div>
        </div>

        {/* Newsletter & Contact Support Column */}
        <div className="footer-column">
          <h4 className="footer-title">Stay Updated</h4>
          <p className="footer-about-text" style={{ fontSize: '13px', marginBottom: '4px' }}>
            Subscribe to our newsletter for exclusive mobile tech deals and launch updates.
          </p>
          
          <form className="newsletter-form font-sans" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              className="newsletter-input" 
              placeholder="Enter your email..." 
              required 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>

          <h4 className="footer-title" style={{ marginTop: '16px', fontSize: '14px' }}>Contact Support</h4>
          <div className="footer-links-list font-sans">
            <div className="footer-contact-item">
              <svg className="footer-contact-icon" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>support@mobilemart.com</span>
            </div>
            <div className="footer-contact-item">
              <svg className="footer-contact-icon" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+1 (800) 555-MOBI</span>
            </div>
          </div>
        </div>

      </div>

      <hr className="footer-divider" />

      {/* Footer Bottom copyright & legal links */}
      <div className="footer-bottom font-sans">
        <p>© 2026 MobileMart E-Commerce. All rights reserved.</p>
        
        <div className="payment-gateways">
          <span className="payment-gateway-icon">VISA</span>
          <span className="payment-gateway-icon">MC</span>
          <span className="payment-gateway-icon">PP</span>
          <span className="payment-gateway-icon">APAY</span>
        </div>

        <div className="footer-bottom-links">
          <a href="#privacy" className="footer-bottom-link">Privacy Policy</a>
          <a href="#terms" className="footer-bottom-link">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
