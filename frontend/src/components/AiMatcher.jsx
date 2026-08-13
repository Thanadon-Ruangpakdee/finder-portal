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

export default function AiMatcher({ items, onConfirmMatch, onViewItem }) {
  const matches = findAiPotentialMatches(items);
  const [successMsg, setSuccessMsg] = useState('');

  const handleConfirm = (lostId, foundId) => {
    onConfirmMatch(lostId, foundId);
    setSuccessMsg('✓ Match confirmed! Status of both items updated to MATCHED and notification sent.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="ai-matcher-wrapper">
      {/* Header Card */}
      <div className="ai-matcher-header glass-card">
        <div className="ai-matcher-badge">
          <Sparkles size={16} className="text-purple" />
          <span>Google Gemini Semantic & Visual Matchmaker</span>
        </div>
        <h1 className="ai-matcher-title">
          AI Lost ⇄ Found <span className="gradient-text">Automated Match Engine</span>
        </h1>
        <p className="ai-matcher-sub">
          The system continuously compares embeddings, keywords, visual descriptions, and campus location timestamps to discover lost & found pairings automatically.
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
          <div className="empty-title">No Pending Pairings Discovered</div>
          <p className="empty-desc">
            All current lost reports and found items have been cross-checked. As new reports are submitted, Gemini AI will automatically scan for matching pairs.
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
                  <span>{match.similarityPercentage}% Match Probability</span>
                </div>
                
                <span className={`badge ${match.status === 'CONFIRMED' ? 'badge-claimed' : 'badge-matched'}`}>
                  {match.status === 'CONFIRMED' ? '✓ Match Confirmed' : 'Needs Staff Verification'}
                </span>
              </div>

              {/* Matched Pair Comparison */}
              <div className="match-pair-row">
                {/* Left: Lost Item */}
                <div className="match-side-box lost-side">
                  <div className="match-side-header">
                    <span className="badge badge-lost">Lost Report</span>
                    <span className="text-xs text-muted">By {match.lostItem.reportedBy?.name?.split(' ')[0]}</span>
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
                    <span className="badge badge-found">Found Item</span>
                    <span className="text-xs text-muted">By {match.foundItem.reportedBy?.name?.split(' ')[0]}</span>
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
                  <span className="text-xs font-semibold text-muted">Matching Tokens:</span>
                  <div className="tokens-list">
                    {match.commonAttributes.map((t, idx) => (
                      <span key={idx} className="match-token-pill">{t}</span>
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
                  Inspect Found Item
                </button>

                {match.status !== 'CONFIRMED' ? (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleConfirm(match.lostItem.id, match.foundItem.id)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Confirm Match & Notify Owner</span>
                  </button>
                ) : (
                  <div className="confirmed-indicator">
                    <CheckCircle2 size={16} className="text-emerald" />
                    <span className="text-sm font-semibold text-emerald">Matched Pair Linked</span>
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
