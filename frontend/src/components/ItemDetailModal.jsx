import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ChevronLeft,
  FileText,
  Maximize2,
  ZoomIn
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
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const t = useT();
  const lang = useLang();

  if (!item) return null;

  const rawImages = item.photoUrls || item.photos || (item.photoUrl ? [item.photoUrl] : []);
  const images = Array.isArray(rawImages) && rawImages.length > 0
    ? rawImages
    : ['https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80'];

  const nextImg = (e) => {
    if (e) e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    if (e) e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') nextImg();
      if (e.key === 'ArrowLeft') prevImg();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  const isFound = item.type === 'FOUND';
  const isTeacherOrAdmin = currentRole === USER_ROLES.TEACHER || currentRole === USER_ROLES.ADMIN;
  const userClaim = item.claims?.find(c => c.claimantId === currentUser?.id || c.userId === currentUser?.id);

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
    if (!isoString) return t('Recently');
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return t('Recently');
    return d.toLocaleString(localeFor(lang), {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <button className="icon-btn close-modal-btn" onClick={onClose} aria-label={t('Close')}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body modal-scrollable">
          {/* Main Photo Banner & Interactive Carousel */}
          <div className="detail-photo-container" onClick={() => setIsLightboxOpen(true)} style={{ cursor: 'pointer' }}>
            <img 
              src={images[currentImgIndex]} 
              alt={item.title} 
              className="detail-main-img"
            />
            
            <div className="detail-category-badge">{t(item.category)}</div>

            {/* Expand Fullscreen Badge */}
            <div className="photo-expand-badge">
              <ZoomIn size={14} />
              <span>{t('View Full Screen')}</span>
            </div>

            {/* Carousel Navigation Arrows if multiple photos */}
            {images.length > 1 && (
              <>
                <button 
                  type="button"
                  className="photo-carousel-btn carousel-btn-left" 
                  onClick={prevImg}
                  aria-label={t('Previous Photo')}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  type="button"
                  className="photo-carousel-btn carousel-btn-right" 
                  onClick={nextImg}
                  aria-label={t('Next Photo')}
                >
                  <ChevronRight size={20} />
                </button>

                {/* Carousel Counter & Dots */}
                <div className="photo-carousel-dots">
                  {images.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`carousel-dot ${idx === currentImgIndex ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImgIndex(idx);
                      }}
                    />
                  ))}
                </div>
                <div className="photo-carousel-counter">
                  {currentImgIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Title & Description Block (Outer Card matching Image 2) */}
          <div className="detail-info-block">
            <h2 className="detail-title">{item.title}</h2>
            <div className="detail-desc-card">
              <div className="desc-card-header">
                <FileText size={16} className="text-purple" />
                <span>{t('Description & Details')}</span>
              </div>
              <p className="detail-description">{item.description || t('No description provided.')}</p>
            </div>
          </div>

          {/* Key Item Details Grid */}
          <div className="detail-meta-grid">
            <div className="detail-meta-card">
              <MapPin size={18} className="meta-card-icon text-cyan" />
              <div className="meta-card-content">
                <div className="meta-card-label">{t('Location Recorded')}</div>
                <div className="meta-card-val">{item.location}</div>
              </div>
            </div>

            <div className="detail-meta-card">
              <Calendar size={18} className="meta-card-icon text-blue" />
              <div className="meta-card-content">
                <div className="meta-card-label">{t('Date & Time')}</div>
                <div className="meta-card-val">{formatDate(item.createdAt || item.date)}</div>
              </div>
            </div>

            <div className="detail-meta-card detail-meta-card-full">
              <User size={18} className="meta-card-icon text-emerald" />
              <div className="meta-card-content">
                <div className="meta-card-label">{t('Reported By')}</div>
                <div className="meta-card-reporter-row">
                  <div className="meta-card-val meta-reporter-name">{item.reporter?.name || item.reportedBy?.name || t('Campus Student')}</div>
                  <div className="meta-card-sub meta-reporter-email">{item.reporter?.email || item.reportedBy?.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Extracted Tags */}
          {Array.isArray(item.aiTags) && item.aiTags.length > 0 && (
            <div className="detail-section ai-tags-section">
              <div className="section-label">
                <Sparkles size={15} className="text-purple" />
                <span>{t('AI Visual Tags (Gemini)')}</span>
              </div>
              <div className="detail-ai-tag-pills">
                {item.aiTags.map((tag, i) => (
                  <span key={i} className="ai-tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* SpaceReserve Peer API Quick Lookup */}
          <div className="spacereserve-discovery-box glass-card">
            <div className="spacereserve-box-left">
              <Building2 size={20} className="text-cyan" />
              <div>
                <div className="box-title">{t('SpaceReserve Room Intelligence')}</div>
                <div className="box-desc">
                  {t('Check who scheduled')} <strong>{item.location}</strong> {t('at this time.')}
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
                <div>
                  <div className="claim-status-banner" style={{ marginBottom: '14px' }}>
                    <CheckCircle size={20} className="text-emerald" />
                    <div>
                      <div className="font-semibold">
                        {userClaim.status === 'PENDING' && t('Your Claim is Under Review')}
                        {userClaim.status === 'APPROVED' && t('Claim Approved! Contact Staff to Collect')}
                        {userClaim.status === 'REJECTED' && t('Claim Rejected')}
                        {(!userClaim.status || (userClaim.status !== 'PENDING' && userClaim.status !== 'APPROVED' && userClaim.status !== 'REJECTED')) && t('Your Claim is Under Review')}
                      </div>
                      <div className="text-muted text-sm">
                        {t('Status:')} <strong>{t(userClaim.status || 'PENDING')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <CheckCircle size={15} className="text-emerald" />
                      <span>{t('Submitted Proof of Ownership')}</span>
                    </label>
                    <textarea
                      className="textarea-field"
                      value={userClaim.proofText || userClaim.proofDescription || ''}
                      readOnly
                      disabled
                      style={{ opacity: 0.95, background: 'var(--bg-input)', cursor: 'not-allowed', color: 'var(--text-primary)', fontWeight: 500 }}
                    />
                  </div>

                  <button 
                    type="button" 
                    className="btn w-full"
                    disabled
                    style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', opacity: 1, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px' }}
                  >
                    <CheckCircle size={16} />
                    <span>{t('Claim Already Submitted')}</span>
                  </button>
                </div>
              ) : claimSubmitted ? (
                <div>
                  <div className="claim-status-banner success-banner" style={{ marginBottom: '14px' }}>
                    <CheckCircle size={20} className="text-emerald" />
                    <div>
                      <div className="font-semibold">{t('Claim Request Submitted Successfully!')}</div>
                      <div className="text-muted text-sm">
                        {t('Teacher has been notified. Check your student email for approval notifications.')}
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">{t('Submitted Proof of Ownership')}</label>
                    <textarea
                      className="textarea-field"
                      value={claimProof}
                      readOnly
                      disabled
                      style={{ opacity: 0.95, background: 'var(--bg-input)', cursor: 'not-allowed', color: 'var(--text-primary)', fontWeight: 500 }}
                    />
                  </div>

                  <button 
                    type="button" 
                    className="btn w-full"
                    disabled
                    style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', opacity: 1, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px' }}
                  >
                    <CheckCircle size={16} />
                    <span>{t('Claim Already Submitted')}</span>
                  </button>
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

          {/* Action Section for LOST REPORT items (when someone found this item) */}
          {!isFound && item.status !== 'CLAIMED' && (
            <div className="claim-action-section glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <h3 className="claim-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)' }}>
                <CheckCircle size={18} className="text-blue" />
                <span>{t('Did you find this lost item?')}</span>
              </h3>
              <p className="claim-section-subtitle">
                {t('If you found this item or turned it in to the Security Desk / owner, submit details below to notify the owner and campus staff.')}
              </p>

              {userClaim ? (
                <div>
                  <div className="claim-status-banner success-banner" style={{ marginBottom: '14px' }}>
                    <CheckCircle size={20} className="text-emerald" />
                    <div>
                      <div className="font-semibold">{t('You reported finding this item')}</div>
                      <div className="text-muted text-sm">
                        {t('Status:')} <strong>{t(userClaim.status || 'PENDING')}</strong> — {t('Campus staff and owner have been notified.')}
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <CheckCircle size={15} className="text-emerald" />
                      <span>{t('Submitted Found Details & Location')}</span>
                    </label>
                    <textarea
                      className="textarea-field"
                      value={userClaim.proofText || userClaim.proofDescription || ''}
                      readOnly
                      disabled
                      style={{ opacity: 0.95, background: 'var(--bg-input)', cursor: 'not-allowed', color: 'var(--text-primary)', fontWeight: 500 }}
                    />
                  </div>
                </div>
              ) : claimSubmitted ? (
                <div>
                  <div className="claim-status-banner success-banner" style={{ marginBottom: '14px' }}>
                    <CheckCircle size={20} className="text-emerald" />
                    <div>
                      <div className="font-semibold">{t('Found Notification Submitted Successfully!')}</div>
                      <div className="text-muted text-sm">
                        {t('Item owner and campus security desk have been notified to verify and retrieve the item.')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="claim-form">
                  <div className="input-group">
                    <label className="input-label">{t('Found Details & Current Location')}</label>
                    <textarea
                      className="textarea-field"
                      placeholder={t("e.g. 'Found this Macbook in Room 402 and turned it in to the Security Desk at CL 1st Floor', or 'Stored at MSME Dean office'...")}
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
                    <span>{isSubmitting ? t('Sending Notification...') : t('Report I Found This Item')}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Lightbox Overlay */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            {/* Header controls */}
            <div className="lightbox-top-bar">
              <div className="lightbox-title-info">
                <span className="lightbox-item-title">{item.title}</span>
                {images.length > 1 && (
                  <span className="lightbox-counter-badge">
                    {currentImgIndex + 1} / {images.length}
                  </span>
                )}
              </div>
              <button 
                type="button" 
                className="icon-btn lightbox-close-btn" 
                onClick={() => setIsLightboxOpen(false)}
                aria-label={t('Close')}
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Image Stage */}
            <div className="lightbox-stage">
              <img 
                src={images[currentImgIndex]} 
                alt={item.title} 
                className="lightbox-image" 
              />

              {images.length > 1 && (
                <>
                  <button 
                    type="button"
                    className="lightbox-arrow-btn arrow-left"
                    onClick={prevImg}
                    aria-label={t('Previous Photo')}
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button 
                    type="button"
                    className="lightbox-arrow-btn arrow-right"
                    onClick={nextImg}
                    aria-label={t('Next Photo')}
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="lightbox-thumbs-bar">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`lightbox-thumb-item ${idx === currentImgIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImgIndex(idx)}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
