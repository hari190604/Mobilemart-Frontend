import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [wishlistCount, setWishlistCount] = useState(2); // Mock initial wishlist items count
  const navigate = useNavigate();
  const location = useLocation();

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Monitor page scrolling to add sticky styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <>
      <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          
          {/* Logo Element */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">⚡</div>
            <span>Mobile<span style={{ color: 'var(--accent)' }}>Mart</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-menu font-sans">
            <Link 
              to="/" 
              className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`navbar-link ${location.pathname === '/products' && !location.search ? 'active' : ''}`}
            >
              Products
            </Link>

            {/* Categories Hoverable Dropdown */}
            <div className="nav-dropdown">
              <span className={`navbar-link ${location.pathname === '/products' && location.search.includes('category') ? 'active' : ''}`}>
                Categories <span className="dropdown-icon">▼</span>
              </span>
              <div className="dropdown-menu">
                <Link to="/products?category=Smartphones" className="dropdown-item">
                  <span className="dropdown-item-icon">📱</span> Smartphones
                </Link>
                <Link to="/products?category=Wearables" className="dropdown-item">
                  <span className="dropdown-item-icon">⌚</span> Wearables
                </Link>
                <Link to="/products?category=Accessories" className="dropdown-item">
                  <span className="dropdown-item-icon">🔌</span> Accessories
                </Link>
                <Link to="/products?category=Tablets" className="dropdown-item">
                  <span className="dropdown-item-icon">📁</span> Tablets
                </Link>
              </div>
            </div>
          </nav>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="search-container font-sans">
            <button type="submit" className="search-icon-btn" aria-label="Search">
              <svg className="search-icon-svg" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search catalog..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </form>

          {/* Actions & Session controls */}
          <div className="navbar-actions">
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="action-btn"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg className="action-icon-svg" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg className="action-icon-svg" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>

            {/* Wishlist Header Icon */}
            <Link to="/wishlist" className="action-btn" title="View Wishlist" aria-label="Wishlist">
              <svg className="action-icon-svg" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>

            {/* Shopping Cart Trigger */}
            <Link to="/cart" className="action-btn" title="View Shopping Cart" aria-label="Cart">
              <svg className="action-icon-svg" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="action-badge">{cartCount}</span>}
            </Link>

            {/* Session Controls & user profile dropdown */}
            <div style={{ display: 'none', display: 'flex' } && window.innerWidth < 900 ? { display: 'none' } : { display: 'flex' }}>
              {user ? (
                /* User profile dropdown placeholder */
                <div className="nav-dropdown">
                  <span className="user-profile-trigger font-sans">
                    👤 {user.name.split(' ')[0]} <span className="dropdown-icon" style={{ marginLeft: '4px' }}>▼</span>
                  </span>
                  <div className="dropdown-menu" style={{ right: 0, left: 'auto', width: '180px' }}>
                    <Link to="/profile" className="dropdown-item">
                      <span className="dropdown-item-icon">👤</span> Profile
                    </Link>
                    {!isAdmin() && (
                      <Link to="/orders" className="dropdown-item">
                        <span className="dropdown-item-icon">📦</span> My Orders
                      </Link>
                    )}
                    {isAdmin() && (
                      <Link to="/admin" className="dropdown-item" style={{ color: 'var(--accent)', fontWeight: '600' }}>
                        <span className="dropdown-item-icon">🛠️</span> Admin Panel
                      </Link>
                    )}
                    <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item" 
                      style={{ 
                        width: '100%', 
                        border: 'none', 
                        background: 'transparent', 
                        textAlign: 'left', 
                        cursor: 'pointer',
                        padding: '10px 14px'
                      }}
                    >
                      <span className="dropdown-item-icon" style={{ color: 'var(--danger)' }}>🚪</span> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-group">
                  <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '8px 16px' }}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger Button for Mobile Views */}
            <button 
              className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>

          </div>
        </div>
      </header>

      {/* Mobile drawer navigation backdrop */}
      <div 
        className={`mobile-nav-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Mobile Drawer Navigation Panel */}
      <nav className={`mobile-nav-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-links">
          
          <Link to="/" className="mobile-link">
            <span>Home</span> <span>🏠</span>
          </Link>
          
          <Link to="/products" className="mobile-link">
            <span>Products</span> <span>📱</span>
          </Link>

          <div>
            <div className="mobile-link" style={{ borderBottom: 'none' }}>
              <span>Categories</span> <span>📁</span>
            </div>
            <div className="mobile-categories-group">
              <Link to="/products?category=Smartphones" className="mobile-category-link">📱 Smartphones</Link>
              <Link to="/products?category=Wearables" className="mobile-category-link">⌚ Wearables</Link>
              <Link to="/products?category=Accessories" className="mobile-category-link">🔌 Accessories</Link>
              <Link to="/products?category=Tablets" className="mobile-category-link">📁 Tablets</Link>
            </div>
          </div>

          <Link to="/wishlist" className="mobile-link">
            <span>Wishlist</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ❤️ {wishlistCount > 0 && <span style={{ background: 'var(--accent)', color: '#0f172a', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>{wishlistCount}</span>}
            </span>
          </Link>

          <Link to="/cart" className="mobile-link">
            <span>Shopping Cart</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛒 {cartCount > 0 && <span style={{ background: 'var(--accent)', color: '#0f172a', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>{cartCount}</span>}
            </span>
          </Link>
        </div>

        {/* Mobile Search input */}
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ width: '100%', display: 'flex', margin: '16px 0 0' }}>
          <button type="submit" className="search-icon-btn" aria-label="Search">
            <svg className="search-icon-svg" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search catalog..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>

        {/* Mobile Accounts detail */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {user ? (
            <>
              <Link to="/profile" className="user-profile-trigger" style={{ justifyContent: 'center', width: '100%', padding: '12px' }}>
                👤 {user.name}
              </Link>
              {isAdmin() && (
                <Link to="/admin" className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
                  🛠️ Admin Panel
                </Link>
              )}
              {!isAdmin() && (
                <Link to="/orders" className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
                  📦 My Orders
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', padding: '12px' }}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
