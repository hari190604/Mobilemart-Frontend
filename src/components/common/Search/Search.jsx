import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './Search.css';

export const Search = ({ placeholder = "Search catalog...", onSearchSubmit }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [catalogCache, setCatalogCache] = useState([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/public/products?size=1000');
        const items = res.data?.data?.content || res.data?.data || [];
        setCatalogCache(items);
      } catch (err) {
        console.error("Search catalog ping failed", err);
      }
    };
    fetchCatalog();
  }, []);

  // Initialize recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : ["iPhone 15", "Samsung Galaxy", "Earbuds", "Charger"];
  });

  // Save recent searches when updated
  const saveRecentSearch = (searchQuery) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Filter duplicates and prepend new query (limit to 5 items)
    const updated = [trimmed, ...recentSearches.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const removeRecentSearch = (e, indexToRemove) => {
    e.stopPropagation(); // Avoid triggering suggestion search selection
    const updated = recentSearches.filter((_, idx) => idx !== indexToRemove);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Closesuggestions popup when clicking outside component coordinates
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length >= 2) {
      const matched = catalogCache.filter(item =>
        item.name.toLowerCase().includes(val.toLowerCase()) || 
        (item.category && item.category.categoryName.toLowerCase().includes(val.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  };

  const executeSearch = (searchVal) => {
    const finalVal = searchVal.trim();
    saveRecentSearch(finalVal);
    setShowSuggestions(false);

    if (onSearchSubmit) {
      onSearchSubmit(finalVal);
    } else {
      // Default router redirection
      if (finalVal) {
        navigate(`/products?search=${encodeURIComponent(finalVal)}`);
      } else {
        navigate('/products');
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleSelectSuggestion = (productName) => {
    setQuery(productName);
    executeSearch(productName);
  };

  const handleClearInput = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(true); // show recent searches context on refocus
  };

  return (
    <div className="advanced-search-wrapper" ref={wrapperRef}>
      
      <form onSubmit={handleFormSubmit} className="search-input-field-group">
        
        {/* Left Submit Search button */}
        <button type="submit" className="search-left-submit-btn" aria-label="Submit Search">
          <svg className="search-control-icon-svg" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        {/* Text Input control */}
        <input
          type="text"
          className="search-input-control font-sans"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />

        {/* Clear Query Trigger close button */}
        {query && (
          <button 
            type="button" 
            className="search-clear-query-btn" 
            onClick={handleClearInput} 
            aria-label="Clear Search Input"
          >
            <svg 
              className="search-control-icon-svg" 
              viewBox="0 0 24 24" 
              style={{ width: '14px', height: '14px' }}
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

      </form>

      {/* Suggestions and Recent Searches overlay popups */}
      {showSuggestions && (
        <div className="search-dropdown-overlay font-sans">
          
          {/* Case 1: Suggestions exist (typing input matches) */}
          {query.trim().length >= 2 && suggestions.length > 0 && (
            <>
              <div className="search-dropdown-title-lbl">Matching Suggestions</div>
              <div className="search-suggestions-list">
                {suggestions.map((item) => (
                  <div 
                    key={item.productId} 
                    className="search-suggestion-item-row"
                    onClick={() => handleSelectSuggestion(item.name)}
                  >
                    <div className="suggestion-item-thumbnail">
                      <img 
                        src={item.images && item.images.length > 0 ? item.images[0].imageUrl : 'https://via.placeholder.com/50'} 
                        alt={item.name} 
                        className="suggestion-item-thumbnail-img" 
                      />
                    </div>
                    <div className="suggestion-item-info">
                      <span className="suggestion-item-name">{item.name}</span>
                      <span className="suggestion-item-brand">{item.category?.categoryName || 'General'}</span>
                    </div>
                    <span className="suggestion-item-price">₹{item.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Case 2: Suggestions empty and typing query exists (no results) */}
          {query.trim().length >= 2 && suggestions.length === 0 && (
            <div className="search-no-results-lbl">
              No products found matches "{query}"
            </div>
          )}

          {/* Case 3: Empty query or query too short -> Show Recent Searches */}
          {query.trim().length < 2 && (
            <>
              <div className="search-dropdown-title-lbl">Recent Searches</div>
              {recentSearches.length > 0 ? (
                <div className="recent-searches-list">
                  {recentSearches.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="recent-search-row"
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      <div className="recent-search-label-wrap">
                        <svg className="recent-search-clock-svg" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="recent-item-query-txt">{item}</span>
                      </div>
                      <button 
                        type="button" 
                        className="recent-search-delete-btn" 
                        onClick={(e) => removeRecentSearch(e, idx)}
                        aria-label={`Remove recent search search term ${item}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="search-no-results-lbl" style={{ padding: '12px' }}>
                  No recent searches recorded.
                </div>
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
};

export default Search;
