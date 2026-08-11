import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Orders.css';

export const Orders = () => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');

  // Rate & Review (Inline)
  const [activeReviewOrderId, setActiveReviewOrderId] = useState(null);
  const [activeReviewProductId, setActiveReviewProductId] = useState(null);
  
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  
  const [reviewSuccessStates, setReviewSuccessStates] = useState({}); // Stores success messages per order-product
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const reviewPanelRef = useRef(null);

  // Invoice Download State
  const [downloadingInvoices, setDownloadingInvoices] = useState({});
  const [invoiceErrors, setInvoiceErrors] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders');
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(o => o.status.toUpperCase() === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => {
        const matchId = o.orderId.toLowerCase().includes(q);
        const matchProduct = o.items.some(item => 
          item.productName?.toLowerCase().includes(q) || 
          item.brand?.toLowerCase().includes(q)
        );
        return matchId || matchProduct;
      });
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === 'highest') return b.totalAmount - a.totalAmount;
      if (sortOrder === 'lowest') return a.totalAmount - b.totalAmount;
      return 0;
    });

    return filtered;
  }, [orders, statusFilter, searchQuery, sortOrder]);

  const totalAmountOrdered = useMemo(() => orders.reduce((sum, o) => sum + o.totalAmount, 0), [orders]);
  const totalItemsOrdered = useMemo(() => orders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0), [orders]);
  const totalOrders = orders.length;


  // ------------- INVOICE DOWNLOAD ------------- 
  const handleDownloadInvoice = async (orderId) => {
    setDownloadingInvoices(prev => ({ ...prev, [orderId]: true }));
    setInvoiceErrors(prev => ({ ...prev, [orderId]: null }));

    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MobileMart-Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice Error:", err);
      // If error is blob, reading it might fail, fallback gracefully
      setInvoiceErrors(prev => ({ ...prev, [orderId]: 'Unable to generate invoice. Please try again.' }));
    } finally {
      setDownloadingInvoices(prev => ({ ...prev, [orderId]: false }));
    }
  };


  // ------------- RATE & REVIEW (INLINE) -------------
  const openReviewPanel = (orderId, productId) => {
    if (activeReviewOrderId !== orderId || activeReviewProductId !== productId) {
      setActiveReviewOrderId(orderId);
      setActiveReviewProductId(productId);
      setRating(0);
      setReviewTitle('');
      setReviewComment('');
      setReviewErrorMsg('');
      
      // Smooth scroll into view shortly after state update causes render
      setTimeout(() => {
        if (reviewPanelRef.current) {
          reviewPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const closeReviewPanel = () => {
    setActiveReviewOrderId(null);
    setActiveReviewProductId(null);
  };

  const submitReview = async (e, orderId, productId) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewErrorMsg('Please select a rating between 1 and 5 stars.');
      return;
    }
    setReviewSubmitting(true);
    setReviewErrorMsg('');

    try {
      const fullComment = reviewTitle ? `**${reviewTitle}**\n${reviewComment}` : reviewComment;
      
      const response = await api.post(`/reviews`, {
        productId: productId,
        rating: rating,
        comment: fullComment
      });

      if (response.data && response.data.success) {
        // Show success inside the exact order card
        const key = `${orderId}-${productId}`;
        setReviewSuccessStates(prev => ({ ...prev, [key]: '✓ Review submitted successfully' }));
        closeReviewPanel();
      } else {
        setReviewErrorMsg(response.data.message || 'Failed to submit review');
        if (response.data.message?.toLowerCase().includes("already")) {
           const key = `${orderId}-${productId}`;
           setReviewSuccessStates(prev => ({ ...prev, [key]: 'Already reviewed' }));
           closeReviewPanel();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error submitting review.';
      setReviewErrorMsg(msg);
      if (msg.toLowerCase().includes("already reviewed")) {
         const key = `${orderId}-${productId}`;
         setReviewSuccessStates(prev => ({ ...prev, [key]: 'Already reviewed' }));
         closeReviewPanel();
      }
    } finally {
      setReviewSubmitting(false);
    }
  };


  // ------------- UI HELPERS -------------
  const getStatusColor = (status) => {
    const s = status.toUpperCase();
    if (['SUCCESS', 'DELIVERED', 'SHIPPED'].includes(s)) return 'var(--success, #10b981)';
    if (['CANCELLED', 'FAILED', 'RETURNED'].includes(s)) return 'var(--danger, #ef4444)';
    return 'var(--accent, #7c3aed)';
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    return `${d.toLocaleDateString('en-GB', options)} • ${d.toLocaleTimeString('en-US', timeOptions)}`;
  };

  if (loading) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <p>Loading your orders...</p>
        <div style={{ maxWidth: '600px', margin: '20px auto', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '60px', marginTop: '40px' }}>
        <h3>{error}</h3>
        <button onClick={fetchOrders} className="btn btn-primary" style={{ marginTop: '16px' }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left', paddingBottom: '60px' }}>
      
      {/* Page Header */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px' }}>My Orders History</h1>
          <p className="text-muted">Track your deliveries and manage your purchases and invoices securely.</p>
        </div>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card text-center animate-fade-in" style={{ padding: '80px 20px', marginTop: '20px' }}>
          <span style={{ fontSize: '64px' }}>📦</span>
          <h2 style={{ fontSize: '24px', margin: '20px 0 10px 0' }}>No orders yet</h2>
          <p className="text-muted">Start shopping and your purchases will appear here.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Controls: Search and Filter */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ flex: '1 1 300px' }}>
              <input 
                type="text" 
                placeholder="Search by Order ID or Product Name" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'white' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'white' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Successful</option>
                <option value="PENDING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'white' }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex flex-col gap-4">
            {filteredOrders.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No orders strictly match your filters.</div>
            ) : (
              filteredOrders.map((order, idx) => {
                const isReviewingOrder = activeReviewOrderId === order.orderId;

                return (
                  <div 
                    key={idx} 
                    className="card order-card transition-all" 
                    style={{ 
                      padding: '24px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '20px', 
                      borderRadius: '12px', 
                      border: isReviewingOrder ? '1px solid var(--accent)' : '1px solid var(--border)',
                      boxShadow: isReviewingOrder ? '0 0 15px rgba(59, 130, 246, 0.25)' : 'none'
                    }}
                  >
                    
                    {/* Order Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div className="text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Order ID: #{order.orderId}</div>
                        <div style={{ fontSize: '14px', marginTop: '6px', color: 'var(--text-main)' }}>{formatDate(order.createdAt)}</div>
                        <div style={{ fontSize: '14px', color: getStatusColor(order.status), fontWeight: 'bold', marginTop: '6px' }}>Status: {order.status}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>TOTAL VALUE</div>
                        <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '20px', marginTop: '4px' }}>₹{order.totalAmount?.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {order.items.map((item, idxx) => {
                        const stateKey = `${order.orderId}-${item.productId}`;
                        const successMsg = reviewSuccessStates[stateKey];
                        const isReviewingThisItem = isReviewingOrder && activeReviewProductId === item.productId;

                        return (
                          <React.Fragment key={idxx}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ width: '90px', height: '90px', backgroundColor: 'var(--bg-main)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  <span style={{ fontSize: '28px' }}>📦</span>
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: 'var(--text-main)' }}>{item.productName}</h4>
                                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold', letterSpacing: '0.5px' }}>{item.brand || 'Category'}</span>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                  Qty: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{item.quantity}</span> &nbsp;&bull;&nbsp; Price per unit: ₹{item.pricePerUnit?.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '6px' }}>
                                  Total: ₹{item.totalPrice?.toLocaleString()}
                                </div>
                              </div>
                              
                              {/* Rate & Review Logic */}
                              {(order.status === 'SUCCESS' || order.status === 'DELIVERED' || order.status === 'SHIPPED') && (
                                <div style={{ paddingRight: '10px' }}>
                                  {successMsg ? (
                                    <div style={{ color: 'var(--success)', fontWeight: '600', fontSize: '14px' }}>
                                      {successMsg}
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => openReviewPanel(order.orderId, item.productId)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ backgroundColor: isReviewingThisItem ? 'var(--primary)' : 'transparent', border: '1px solid var(--border)', color: isReviewingThisItem ? 'white' : 'var(--text-main)' }}
                                    >
                                      {isReviewingThisItem ? 'Reviewing...' : 'Rate & Review'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Inline Review Form directly below the clicked item */}
                            {isReviewingThisItem && !successMsg && (
                               <div 
                                 ref={reviewPanelRef}
                                 style={{
                                   backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                   borderRadius: '8px',
                                   padding: '20px',
                                   border: '1px solid var(--border)',
                                   marginTop: '10px',
                                   borderLeft: '3px solid var(--primary)'
                                 }}
                               >
                                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    <span style={{ fontSize: '12px' }}>▼</span> Review this product
                                 </div>
                                 <form onSubmit={(e) => submitReview(e, order.orderId, item.productId)}>
                                    
                                    <div style={{ marginBottom: '20px' }}>
                                      <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600' }}>Rate this product</label>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            style={{ 
                                              background: 'none', 
                                              border: 'none', 
                                              fontSize: '28px', 
                                              cursor: 'pointer', 
                                              color: star <= rating ? '#fbbf24' : 'var(--border)',
                                              transition: 'color 0.2s',
                                              padding: 0
                                            }}
                                          >
                                            ★
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>Review title (optional)</label>
                                      <input 
                                        type="text" 
                                        value={reviewTitle}
                                        onChange={(e) => setReviewTitle(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white' }}
                                        placeholder="Add a headline..."
                                      />
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>Your review</label>
                                      <textarea 
                                        rows="3" 
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', resize: 'vertical' }}
                                        placeholder="Share your experience..."
                                      ></textarea>
                                    </div>

                                    {reviewErrorMsg && (
                                      <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>
                                        {reviewErrorMsg}
                                      </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                      <button type="button" onClick={closeReviewPanel} className="btn btn-secondary btn-sm" style={{ border: 'none', backgroundColor: 'transparent' }}>
                                        Cancel
                                      </button>
                                      <button type="submit" className="btn btn-primary btn-sm" disabled={reviewSubmitting || rating === 0}>
                                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                                      </button>
                                    </div>
                                 </form>
                               </div>
                            )}

                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Order Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: '16px', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Link to={`/orders/${order.orderId}`} className="btn btn-primary btn-sm">
                        View Order
                      </Link>
                      
                      <button 
                        onClick={() => handleDownloadInvoice(order.orderId)} 
                        disabled={downloadingInvoices[order.orderId]}
                        className="btn btn-secondary btn-sm" 
                        style={{ border: '1px solid var(--border)' }}
                      >
                        {downloadingInvoices[order.orderId] ? 'Generating Invoice...' : 'Download Invoice'}
                      </button>

                      {invoiceErrors[order.orderId] && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                           <span>{invoiceErrors[order.orderId]}</span>
                           <button onClick={() => handleDownloadInvoice(order.orderId)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', padding: 0 }}>Retry</button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="card" style={{ marginTop: '20px', padding: '24px', display: 'flex', gap: '20px', justifyContent: 'space-around', flexWrap: 'wrap', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Amount Ordered</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)', marginTop: '8px' }}>₹{totalAmountOrdered.toLocaleString()}</div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Items</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '8px' }}>{totalItemsOrdered}</div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Orders</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '8px' }}>{totalOrders}</div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Orders;
