import React from 'react';
import { Link } from 'react-router-dom';

export const PaymentFailed = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
      <div className="card" style={{ 
        padding: '50px 30px', 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Animated Error Cross */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '3px solid var(--danger)',
          color: 'var(--danger)',
          fontSize: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          ✕
        </div>

        <h1 style={{ 
          fontSize: '30px', 
          fontWeight: '800', 
          color: 'var(--danger)',
          marginBottom: '10px',
          fontFamily: 'var(--font-title)'
        }}>
          Payment Authorization Failed
        </h1>
        
        <p className="text-muted" style={{ fontSize: '15px', marginBottom: '32px' }}>
          Your financial institution was unable to process this transaction. This could be due to incorrect details, insufficient funds, or security blocks.
        </p>

        {/* Error Details */}
        <div style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          <div className="flex justify-between">
            <span className="text-muted">Error Code</span>
            <span style={{ fontWeight: '700', color: 'var(--danger)' }}>ERR_AUTH_DECLINED_402</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Reason</span>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Transaction declined by card issuer bank.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Advice</span>
            <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Please review your CVV code or try another card.</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 justify-center" style={{ flexWrap: 'wrap' }}>
          <Link to="/payment" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            Retry Payment 🔄
          </Link>
          <Link to="/checkout" className="btn btn-secondary" style={{ padding: '12px 28px' }}>
            Change Payment Method
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentFailed;
