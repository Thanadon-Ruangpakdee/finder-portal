import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  ShieldAlert
} from './Icons';

export default function ItemCard({ item, onClick }) {
  const isFound = item.type === 'FOUND';
  const hasPendingClaim = item.claims && item.claims.some(c => c.status === 'PENDING');

  // Format date helper
  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="item-card glass-card glass-card-interactive" onClick={onClick}>
      {/* Photo Box */}
      <div className="item-card-image-wrapper">
        <img 
          src={item.photoUrl || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80'} 
          alt={item.title} 
          className="item-card-img"
          loading="lazy"
        />
        
        {/* Type Badge (Found / Lost) */}
        <div className="card-top-badges">
          <span className={`badge ${isFound ? 'badge-found' : 'badge-lost'}`}>
            {isFound ? 'Found Item' : 'Lost Report'}
          </span>

          <span className={`badge badge-${item.status.toLowerCase()}`}>
            {item.status === 'CLAIMED' ? '✓ Reunited' : item.status}
          </span>
        </div>

        {hasPendingClaim && (
          <div className="pending-claim-chip">
            <ShieldAlert size={13} />
            <span>Claim Under Review</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="item-card-body">
        <div className="item-category-pill">{item.category}</div>
        
        <h3 className="item-card-title">{item.title}</h3>
        
        {/* Location & Date Metadata */}
        <div className="item-card-meta">
          <div className="meta-item location-meta" title={item.location}>
            <MapPin size={13} className="meta-icon" />
            <span className="truncate">{item.location}</span>
          </div>
          
          <div className="meta-item date-meta">
            <Calendar size={13} className="meta-icon" />
            <span>{formatDate(item.createdAt || item.date)}</span>
          </div>
        </div>

        {/* Card Action */}
        <div className="item-card-footer">
          <span className="card-reported-by">By: {item.reporter?.name?.split(' ')[0] || item.reportedBy?.name?.split(' ')[0] || 'User'}</span>
          <button className="view-details-btn">
            <span>View Details</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
