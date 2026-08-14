import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, Sun, Moon, ShieldCheck, User } from './Icons';

export default function SettingsView({ currentUser, onProfileUpdated, theme, setTheme, onSignOut }) {
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
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    api.updateProfile(name, finalAvatarUrl)
      .then(res => {
        setLoading(false);
        setSuccess('✓ Profile updated successfully!');
        onProfileUpdated(res.user);
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
    <div className="settings-page-container animate-scaleUp" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 0 60px' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="header-icon-box" style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>
            ⚙️
          </div>
          <div>
            <h2 className="dashboard-title">System & Account Settings</h2>
            <p className="dashboard-subtitle">Manage your profile identity, appearance preferences, and Active Directory session status.</p>
          </div>
        </div>
      </div>

      <div className="settings-grid-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Side: Profile Customizer */}
        <div className="glass-card" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} className="text-primary" /> Profile Customization
          </h3>
          
          <form onSubmit={handleSave} className="modal-form-body" style={{ padding: 0 }}>
            {error && <div className="login-error-banner" style={{ margin: '0 0 16px' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>{success}</div>}

            <div className="avatar-customizer-preview-box" style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="avatar-preview-wrapper" style={{ width: '90px', height: '90px' }}>
                <img src={finalAvatarUrl} alt="Avatar Preview" className="avatar-large-preview" />
              </div>
              
              <div className="segmented-control" style={{ width: '280px', marginTop: '12px' }}>
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

            <div className="form-group-stacked" style={{ marginBottom: '20px' }}>
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
              <div className="form-group-stacked animate-fadeIn" style={{ marginBottom: '20px' }}>
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
              <div className="form-group-stacked animate-fadeIn" style={{ marginBottom: '20px' }}>
                <label className="form-label-stacked">Upload Custom Profile Photo</label>
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

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Saving Profile Updates...' : '✓ Save Changes'}
            </button>
          </form>
        </div>

        {/* Right Side: System & AD session details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Theme Preferences */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Appearance Theme</h3>
            <button 
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn btn-glass btn-block"
              style={{ justifyContent: 'center', gap: '8px' }}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} className="text-gold" />
                  <span>Switch to Day Mode</span>
                </>
              ) : (
                <>
                  <Moon size={15} />
                  <span>Switch to Night Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Active Session Info */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} className="text-primary" /> AD Security Session
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div>
                <span className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>Email Address</span>
                <span style={{ fontWeight: 600 }}>{currentUser.email}</span>
              </div>
              <div>
                <span className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>Assigned Access Role</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {currentUser.role}
                </span>
              </div>
              <div className="dropdown-divider-line" style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }}></div>
              <button 
                type="button"
                onClick={onSignOut}
                className="btn btn-danger btn-block"
                style={{ justifyContent: 'center' }}
              >
                Sign Out from Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
