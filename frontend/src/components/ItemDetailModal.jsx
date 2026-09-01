import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  Send,
  Building2,
  ChevronRight
} from './Icons';
import { USER_ROLES } from '../services/store';
import { useT, useLang, localeFor } from '../language';

export default function ItemDetailModal({
  item,
  onClose,
  currentUser,
  currentRole,
  onSubmitClaim,
  onUpdateStatus,
  onOpenPeerWithRoom
}) {
  const [claimProof, setClaimProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const t = useT();
  const { lang } = useLang();

  if (!item) return null;

  const isFound = item.type === 'FOUND';
  const isTeacherOrAdmin = currentRole === USER_ROLES.TEACHER || currentRole === USER_ROLES.ADMIN;
  const userClaim = item.claims?.find(c => c.userId === currentUser.id);

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!claimProof.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitClaim(item.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        proofDescription: claimProof
      });
      setIsSubmitting(false);
      setClaimSubmitted(true);
    }, 600);
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(localeFor(lang), {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return t('Recently');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card item-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <span className={`badge ${isFound ? 'badge-found' : 'badge-lost'}`}>
              {isFound ? t('Found Item') : t('Lost Report')}
            </span>
            <span className={`badge badge-${item.status.toLowerCase()}`}>
              {item.status === 'CLAIMED' ? t('✓ Reunited with Owner') : t(item.status)}
            </span>
          </div>
          <button className="icon-btn close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body modal-scrollable">
          {/* Main Photo Banner */}
          <div className="detail-photo-container">
            <img 
              src={item.photoUrl || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80'} 
              alt={item.title} 
              className="detail-main-img"
            />
            <div className="detail-category-badge">{t(item.category)}</div>
          </div>

          {/* Title & Description */}
          <div className="detail-info-block">
            <h2 className="detail-title">{item.title}</h2>
            <p className="detail-description">{item.description}</p>
          </div>

          {/* AI Extracted Tags */}
          {item.aiTags && item.aiTags.length > 0 && (
            <div className="detail-section ai-tags-section">
              <div className="section-label">
                <Sparkles size={16} className="text-purple" />
                <span>{t('AI Automated Visual Tags (Gemini)')}</span>
              </div>
              <div className="detail-ai-tag-pills">
                {item.aiTags.map((tag, i) => (
                  <span key={i} className="ai-tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="detail-meta-grid">
            <div className="detail-meta-card">
              <MapPin size={18} className="meta-card-icon text-cyan" />
              <div>
                <div className="meta-card-label">{t('Location Recorded')}</div>
                <div className="meta-card-val">{item.location}</div>
              </div>
            </div>

            <div className="detail-meta-card">
              <Calendar size={18} className="meta-card-icon text-blue" />
              <div>
                <div className="meta-card-label">{t('Date & Time')}</div>
                <div className="meta-card-val">{formatDate(item.date)}</div>
              </div>
            </div>

            <div className="detail-meta-card">
              <User size={18} className="meta-card-icon text-emerald" />
              <div>
                <div className="meta-card-label">{t('Reported By')}</div>
                <div className="meta-card-val">{item.reportedBy?.name || t('Campus Student')}</div>
                <div className="meta-card-sub">{item.reportedBy?.email}</div>
              </div>
            </div>

            <div className="detail-meta-card">
              <ShieldCheck size={18} className="meta-card-icon text-purple" />
              <div>
                <div className="meta-card-label">{t('Active Directory Auth')}</div>
                <div className="meta-card-val">{t('Verified AD Token')}</div>
                <div className="meta-card-sub">{t('OIDC Claims Verified')}</div>
              </div>
            </div>
          </div>

          {/* SpaceReserve Peer API Discovery CTA */}
          <div className="spacereserve-discovery-box glass-card">
            <div className="spacereserve-box-left">
              <Building2 size={24} className="text-cyan" />
              <div>
                <div className="box-title">{t('SpaceReserve Room Intelligence')}</div>
                <div className="box-desc">
                  {t('Query the room booking database to check who scheduled')} <strong>{item.location}</strong> {t('at this time.')}
                </div>
              </div>
            </div>
            <button 
              className="btn btn-cyan btn-sm"
              onClick={() => {
                onClose();
                onOpenPeerWithRoom(item.location);
              }}
            >
              <span>{t('Query SpaceReserve')}</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Teacher / Admin Status Update Bar */}
          {isTeacherOrAdmin && (
            <div className="staff-status-control-box glass-card">
              <div className="staff-control-header">
                <ShieldCheck size={18} className="text-purple" />
                <span>{t('Teacher Status Management')}</span>
              </div>
              <div className="status-buttons-row">
                <button 
                  className={`status-btn status-btn-open ${item.status === 'OPEN' ? 'active' : ''}`}
                  onClick={() => onUpdateStatus(item.id, 'OPEN')}
                >
                  {t('OPEN')}
                </button>
                <button 
                  className={`status-btn status-btn-matched ${item.status === 'MATCHED' ? 'active' : ''}`}
                  onClick={() => onUpdateStatus(item.id, 'MATCHED')}
                >
                  {t('MATCHED')}
                </button>
                <button 
                  className={`status-btn status-btn-claimed ${item.status === 'CLAIMED' ? 'active' : ''}`}
                  onClick={() => onUpdateStatus(item.id, 'CLAIMED')}
                >
                  {t('CLAIMED (Reunited)')}
                </button>
                <button 
                  className={`status-btn status-btn-closed ${item.status === 'CLOSED' ? 'active' : ''}`}
                  onClick={() => onUpdateStatus(item.id, 'CLOSED')}
                >
                  {t('CLOSED')}
                </button>
              </div>
            </div>
          )}

          {/* Claim Section (For Students) */}
          {isFound && item.status !== 'CLAIMED' && (
            <div className="claim-action-section glass-card">
              <h3 className="claim-section-title">{t('Is this your item?')}</h3>
              <p className="claim-section-subtitle">
                {t('To prevent false claims, please provide proof of ownership (e.g. unique scratches, serial number, wallpaper, or item contents) before pickup at the security office.')}
              </p>

              {userClaim ? (
                <div className="claim-status-banner">
                  <CheckCircle size={20} className="text-emerald" />
                  <div>
                    <div className="font-semibold">{t('Your Claim is Under Review')}</div>
                    <div className="text-muted text-sm">
                      {t('Proof submitted:')} "{userClaim.proofDescription}" — {t('Status:')} <strong>{t(userClaim.status)}</strong>
                    </div>
                  </div>
                </div>
              ) : claimSubmitted ? (
                <div className="claim-status-banner success-banner">
                  <CheckCircle size={20} className="text-emerald" />
                  <div>
                    <div className="font-semibold">{t('Claim Request Submitted Successfully!')}</div>
                    <div className="text-muted text-sm">
                      {t('Teacher has been notified. Check your student email for approval notifications.')}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="claim-form">
                  <div className="input-group">
                    <label className="input-label">{t('Detailed Proof of Ownership')}</label>
                    <textarea
                      className="textarea-field"
                      placeholder={t("Describe hidden details (e.g., 'Passcode lock has 6 digits', 'Sticker on the back', 'Serial number ends with 491')...")}
                      value={claimProof}
                      onChange={(e) => setClaimProof(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-full"
                    disabled={isSubmitting || !claimProof.trim()}
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? t('Submitting Claim...') : t('Submit Claim to Security Desk')}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
