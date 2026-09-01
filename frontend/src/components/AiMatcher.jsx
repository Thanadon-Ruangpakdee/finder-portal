import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  Layers
} from './Icons';
import { findAiPotentialMatches } from '../services/store';
import { useT } from '../language';

export default function AiMatcher({ items, onConfirmMatch, onViewItem }) {
  const t = useT();
  const matches = findAiPotentialMatches(items);
  const [successMsg, setSuccessMsg] = useState('');

  const handleConfirm = (lostId, foundId) => {
    onConfirmMatch(lostId, foundId);
    setSuccessMsg(t('✓ Match confirmed! Status of both items updated to MATCHED and notification sent.'));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="ai-matcher-wrapper">
      {/* Header Card */}
      <div className="ai-matcher-header glass-card">
        <div className="ai-matcher-badge">
          <Sparkles size={16} className="text-purple" />
          <span>{t('Google Gemini Semantic & Visual Matchmaker')}</span>
        </div>
        <h1 className="ai-matcher-title">
          {t('AI Lost ⇄ Found')} <span className="gradient-text">{t('Automated Match Engine')}</span>
        </h1>
        <p className="ai-matcher-sub">
          {t('The system continuously compares embeddings, keywords, visual descriptions, and campus location timestamps to discover lost & found pairings automatically.')}
        </p>
      </div>

      {successMsg && (
        <div className="dashboard-alert-banner glass-card">
          <CheckCircle size={20} className="text-emerald" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="glass-card empty-state-box">
          <Sparkles size={40} className="text-purple mb-2" />
          <div className="empty-title">{t('No Pending Pairings Discovered')}</div>
          <p className="empty-desc">
            {t('All current lost reports and found items have been cross-checked. As new reports are submitted, Gemini AI will automatically scan for matching pairs.')}
          </p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.matchId} className="match-card glass-card">
              {/* Match Header Bar */}
              <div className="match-card-top">
                <div className="match-score-badge">
                  <Sparkles size={15} className="text-purple" />
                  <span>{match.similarityPercentage}% {t('Match Probability')}</span>
                </div>

                <span className={`badge ${match.status === 'CONFIRMED' ? 'badge-claimed' : 'badge-matched'}`}>
                  {match.status === 'CONFIRMED' ? t('✓ Match Confirmed') : t('Needs Staff Verification')}
                </span>
              </div>

              {/* Matched Pair Comparison */}
              <div className="match-pair-row">
                {/* Left: Lost Item */}
                <div className="match-side-box lost-side">
                  <div className="match-side-header">
                    <span className="badge badge-lost">{t('Lost Report')}</span>
                    <span className="text-xs text-muted">{t('By')} {match.lostItem.reportedBy?.name?.split(' ')[0]}</span>
                  </div>
                  <div className="match-item-preview" onClick={() => onViewItem(match.lostItem)}>
                    <img src={match.lostItem.photoUrl} alt="" className="match-thumb" />
                    <div>
                      <h4 className="match-title">{match.lostItem.title}</h4>
                      <div className="match-loc">
                        <MapPin size={12} />
                        <span>{match.lostItem.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Connector */}
                <div className="match-arrow-divider">
                  <ArrowRight size={22} className="text-purple" />
                </div>

                {/* Right: Found Item */}
                <div className="match-side-box found-side">
                  <div className="match-side-header">
                    <span className="badge badge-found">{t('Found Item')}</span>
                    <span className="text-xs text-muted">{t('By')} {match.foundItem.reportedBy?.name?.split(' ')[0]}</span>
                  </div>
                  <div className="match-item-preview" onClick={() => onViewItem(match.foundItem)}>
                    <img src={match.foundItem.photoUrl} alt="" className="match-thumb" />
                    <div>
                      <h4 className="match-title">{match.foundItem.title}</h4>
                      <div className="match-loc">
                        <MapPin size={12} />
                        <span>{match.foundItem.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared Attributes */}
              {match.commonAttributes && match.commonAttributes.length > 0 && (
                <div className="common-attributes-box">
                  <span className="text-xs font-semibold text-muted">{t('Matching Tokens:')}</span>
                  <div className="tokens-list">
                    {match.commonAttributes.map((token, idx) => (
                      <span key={idx} className="match-token-pill">{token}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="match-footer-actions">
                <button 
                  className="btn btn-glass btn-sm"
                  onClick={() => onViewItem(match.foundItem)}
                >
                  {t('Inspect Found Item')}
                </button>

                {match.status !== 'CONFIRMED' ? (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleConfirm(match.lostItem.id, match.foundItem.id)}
                  >
                    <CheckCircle2 size={16} />
                    <span>{t('Confirm Match & Notify Owner')}</span>
                  </button>
                ) : (
                  <div className="confirmed-indicator">
                    <CheckCircle2 size={16} className="text-emerald" />
                    <span className="text-sm font-semibold text-emerald">{t('Matched Pair Linked')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
