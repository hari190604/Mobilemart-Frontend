import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockProducts } from '../utils/mockProducts';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/common/ProductCard/ProductCard';
import './Products.css';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  // Retrieve route search filters
  const categoryParam = searchParams.get('category') || 'All';
  const brandParam = searchParams.get('brand') || 'All';
  const searchParam = searchParams.get('search') || '';

  // Local state managers
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState('featured');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6; // Limit items per page to show pagination utility

  // Sync state parameters when route search changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedBrand(brandParam);
    setSearchQuery(searchParam);
  }, [categoryParam, brandParam, searchParam]);

  // Reset pagination index whenever filters shift
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  // Extract unique categories and brands for sidebar selection filters
  const categories = ['All', ...new Set(mockProducts.map((p) => p.category))];
  const brands = ['All', ...new Set(mockProducts.map((p) => p.brand))];

  const applyFilters = (cat = selectedCategory, brand = selectedBrand, search = searchQuery) => {
    const params = {};
    if (cat !== 'All') params.category = cat;
    if (brand !== 'All') params.brand = brand;
    if (search.trim() !== '') params.search = search;
    setSearchParams(params);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    applyFilters(cat, selectedBrand, searchQuery);
  };

  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    applyFilters(selectedCategory, brand, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters(selectedCategory, selectedBrand, searchQuery);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchQuery('');
    setSearchParams({});
  };

  // Filter products collection
  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesBrand && matchesSearch;
  });

  // Sort products collection
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low-high') return a.price - b.price;
    if (sortBy === 'price-high-low') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.id - b.id; // Default featured sort by ID
  });

  // Paginated selection
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`Successfully added ${product.name} to your shopping cart! 🛒`);
  };

  return (
    <div className="catalog-page-wrapper font-sans">
      
      {/* Title Header Section */}
      <section className="catalog-header-text">
        <h1 className="catalog-header-title">Store Catalog</h1>
        <p className="text-muted">Explore high-performance specifications, configure models, and select flagships.</p>
      </section>

      {/* Catalog Main Content layout splits */}
      <div className="catalog-split-section">
        
        {/* Sidebar Filters panel */}
        <aside className="catalog-filters-aside">
          
          {/* Keyword Search Field */}
          <form onSubmit={handleSearchSubmit}>
            <div className="form-group" style={{ marginBottom: '0px' }}>
              <label className="form-label">Search Catalog</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. iPhone, Watch..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 12px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                  🔎
                </button>
              </div>
            </div>
          </form>

          {/* Categories Buttons panel */}
          <div>
            <div className="filter-group-block-title">By Category</div>
            <div className="category-buttons-panel">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brands selection Dropdown */}
          <div>
            <div className="filter-group-block-title">By Brand</div>
            <select 
              className="form-input" 
              value={selectedBrand} 
              onChange={handleBrandChange}
              style={{ padding: '8px 12px' }}
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div>
            <div className="filter-group-block-title">Sort Matches</div>
            <select 
              className="form-input" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="featured">Featured / Default</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>

        </aside>

        {/* Results grid layout */}
        <div className="catalog-results-section">
          
          <div className="results-meta-bar">
            <span>
              Showing {sortedProducts.length > 0 ? `${(currentPage - 1) * productsPerPage + 1} - ${Math.min(currentPage * productsPerPage, sortedProducts.length)} of ` : ''}{sortedProducts.length} results
            </span>
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              {/* Product Cards Responsive Grid */}
              <div className="catalog-cards-responsive-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center align-center gap-1" style={{ marginTop: '24px', padding: '10px 0' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ← Previous
                  </button>
                  
                  <span style={{ fontSize: '14px', fontWeight: '750', color: 'var(--text-main)', margin: '0 16px' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center" style={{ padding: '60px' }}>
              <span style={{ fontSize: '48px' }}>🔍</span>
              <h3 style={{ fontSize: '20px', margin: '16px 0 8px 0', color: 'var(--text-main)' }}>No products match your filters</h3>
              <p className="text-muted">Clear some filters or type general keywords to find products.</p>
              <button 
                type="button" 
                onClick={handleResetFilters} 
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
              >
                Reset Store Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Products;
