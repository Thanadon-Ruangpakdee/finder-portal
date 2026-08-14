import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Sparkles } from './Icons';

export default function CustomizeProfileModal({ currentUser, onClose, onProfileUpdated }) {
  const [name, setName] = useState(currentUser.name);
  const [avatarMode, setAvatarMode] = useState(
    currentUser.avatar && currentUser.avatar.startsWith('https://api.dicebear.com') ? 'avatar' : 'custom'
  );
  
  const [avatarSeed, setAvatarSeed] = useState(currentUser.id || 'default_seed');
  const [customAvatarUrl, setCustomAvatarUrl] = useState(
    currentUser.avatar && !currentUser.avatar.startsWith('https://api.dicebear.com') ? currentUser.avatar : ''
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Computes the dicebear adventurer avatar URL dynamically based on seed
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const finalAvatarUrl = avatarMode === 'avatar' 
    ? avatarUrl 
    : (customAvatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default');

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name field cannot be blank.');
      return;
    }

    setLoading(true);
    setError('');

    api.updateProfile(name, finalAvatarUrl)
      .then(res => {
        setLoading(false);
        onProfileUpdated(res.user);
        onClose();
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Failed to update profile.');
      });
  };

  const handleRandomizeSeed = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(randomSeed);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomAvatarUrl(reader.result); // Base64 image
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-card animate-scaleUp" style={{ maxWidth: '520px', width: '95%', padding: '24px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <Sparkles size={18} className="text-rose" />
            <h3>Customize Profile Settings</h3>
          </div>
          <button className="icon-btn close-modal-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="modal-form-body">
          {error && <div className="login-error-banner" style={{ margin: '0 0 16px' }}>{error}</div>}

          {/* Avatar Preview Box */}
          <div className="avatar-customizer-preview-box">
            <div className="avatar-preview-wrapper">
              <img src={finalAvatarUrl} alt="Avatar Preview" className="avatar-large-preview" />
            </div>
            
            {/* Mode Toggle Selection */}
            <div className="segmented-control" style={{ width: '100%', marginTop: '8px' }}>
              <button 
                type="button"
                className={`segment-btn ${avatarMode === 'avatar' ? 'active' : ''}`}
                onClick={() => setAvatarMode('avatar')}
              >
                Generated Avatar
              </button>
              <button 
                type="button"
                className={`segment-btn ${avatarMode === 'custom' ? 'active' : ''}`}
                onClick={() => setAvatarMode('custom')}
              >
                Custom Photo
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-group-stacked">
            <label className="form-label-stacked">Display Name</label>
            <input 
              type="text"
              className="login-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              disabled={loading}
            />
          </div>

          {avatarMode === 'avatar' ? (
            <div className="form-group-stacked animate-fadeIn">
              <button 
                type="button" 
                className="btn btn-glass" 
                onClick={handleRandomizeSeed}
                disabled={loading}
                style={{ width: '100%', gap: '8px', justifyContent: 'center' }}
              >
                🎲 Randomize Generated Character
              </button>
            </div>
          ) : (
            <div className="form-group-stacked animate-fadeIn">
              <label className="form-label-stacked">Upload Custom Profile Photo</label>
              
              {/* File upload selector labeled exactly "Choose Image" */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '4px 0 8px' }}>
                <label className="btn btn-glass btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                  Choose Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }}
                  />
                </label>
                <span className="text-xs text-muted">
                  {customAvatarUrl.startsWith('data:') ? '✓ Photo selected successfully' : 'Select a photo from your local files'}
                </span>
              </div>
              
              {customAvatarUrl.startsWith('data:') && (
                <button 
                  type="button"
                  className="text-xs text-rose" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '2px', padding: 0 }}
                  onClick={() => setCustomAvatarUrl('')}
                >
                  ✕ Clear selected photo
                </button>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-footer-actions">
            <button 
              type="button" 
              className="btn btn-glass" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving Profile Updates...' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
