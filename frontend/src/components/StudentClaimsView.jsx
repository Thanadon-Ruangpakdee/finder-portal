import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useT, useLang, localeFor } from '../language';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  X, 
  MapPin, 
  Calendar, 
  FileText,
  ArrowRight
} from './Icons';

export default function StudentClaimsView({ onViewItem }) {
  const t = useT();
  const lang = useLang();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentClaims();
  }, []);

  const fetchStudentClaims = () => {
    setLoading(true);
    setError('');
    api.getClaims()
      .then(data => {
        setClaims(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch student claims:', err);
        setError('Failed to load your submitted claims.');
        setLoading(false);
      });
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(localeFor(lang), { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="student-claims-container animate-fadeIn">
      {/* Header Banner */}
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="header-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: '1.4rem' }}>
            📋
          </div>
          <div>
            <h2 className="dashboard-title">{t('My Claims')}</h2>
            <p className="dashboard-subtitle">{t('Track the status of your ownership verification claims')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="login-error-banner" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state glass-card" style={{ padding: '60px 20px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
          <p className="text-muted">{t('Loading...')}</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Inbox size={48} className="empty-icon" style={{ opacity: 0.4, margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{t('No Claims Submitted Yet')}</h3>
          <p className="text-muted" style={{ maxWidth: '420px', margin: '0 auto' }}>
            {t('You have not submitted any ownership claims for found items yet.')}
          </p>
        </div>
      ) : (
        <div className="claims-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {claims.map(claim => {
            const item = claim.item || {};
            const photoUrl = item.imageUrl || item.photoUrl || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80';

            // Status styling helpers
            let statusBadge = null;
            if (claim.status === 'PENDING') {
              statusBadge = (
                <span className="badge" style={{ background: '#f59e0b', color: '#ffffff', border: '1px solid #d97706', padding: '4px 10px' }}>
                  <Clock size={12} /> {t('Pending Teacher Review')}
                </span>
              );
            } else if (claim.status === 'APPROVED') {
              statusBadge = (
                <span className="badge" style={{ background: '#10b981', color: '#ffffff', border: '1px solid #059669', padding: '4px 10px' }}>
                  <CheckCircle2 size={12} /> {t('Approved - Contact Staff to Collect')}
                </span>
              );
            } else if (claim.status === 'REJECTED') {
              statusBadge = (
                <span className="badge" style={{ background: '#ef4444', color: '#ffffff', border: '1px solid #dc2626', padding: '4px 10px' }}>
                  <X size={12} /> {t('Claim Rejected')}
                </span>
              );
            }

            return (
              <div 
                key={claim.id} 
                className="glass-card glass-card-interactive" 
                style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onClick={() => item.id && onViewItem && onViewItem(item)}
              >
                {/* Item Thumbnail Banner */}
                <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', background: '#000' }}>
                  <img 
                    src={photoUrl} 
                    alt={item.title || 'Claim Item'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                    <span className="badge badge-found" style={{ background: '#10b981', color: '#fff', padding: '4px 8px', fontSize: '0.7rem' }}>
                      {item.category || 'Item'}
                    </span>
                    {statusBadge}
                  </div>
                </div>

                {/* Body Details */}
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {item.title || 'Unknown Item'}
                  </h3>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} />
                        <span>{item.location}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      <span>{formatDate(claim.createdAt)}</span>
                    </div>
                  </div>

                  {/* Proof Description Block */}
                  <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '4px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FileText size={13} className="text-primary" />
                      <span>{t('Submitted Proof of Ownership')}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4, wordBreak: 'break-word' }}>
                      "{claim.proofText}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                    <span>{t('View Details')}</span>
                    <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
