import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, User, Bell, Phone } from './Icons';
import { useT } from '../language';

export default function SettingsView({ currentUser, onProfileUpdated, onSignOut }) {
  const t = useT();
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarMode, setAvatarMode] = useState(
    currentUser.avatar && currentUser.avatar.startsWith('https://api.dicebear.com') ? 'avatar' : 'custom'
  );
  
  const [avatarSeed, setAvatarSeed] = useState(currentUser.id || 'default_seed');
  const [customAvatarUrl, setCustomAvatarUrl] = useState(
    currentUser.avatar && !currentUser.avatar.startsWith('https://api.dicebear.com') ? currentUser.avatar : ''
  );
  
  // Notification Preferences States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [aiMatchAlerts, setAiMatchAlerts] = useState(true);
  const [toastAlerts, setToastAlerts] = useState(true);

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
      setError(t('Name field cannot be blank.'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    api.updateProfile(name, finalAvatarUrl)
      .then(res => {
        setLoading(false);
        setSuccess(t('✓ Profile updated successfully!'));
        onProfileUpdated(res.user);
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || t('Failed to update profile.'));
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
    <div className="settings-page-container animate-scaleUp" style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 0 60px' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="header-icon-box" style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>
            ⚙️
          </div>
          <div>
            <h2 className="dashboard-title">{t('System & Account Settings')}</h2>
            <p className="dashboard-subtitle">{t('Manage your profile identity, notification preferences, and Active Directory session status.')}</p>
          </div>
        </div>
      </div>

      <div className="settings-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left Side: Profile & Contact Customizer */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} className="text-primary" /> {t('Profile Customization')}
          </h3>
          
          <form onSubmit={handleSave} className="modal-form-body" style={{ padding: 0 }}>
            {error && <div className="login-error-banner" style={{ margin: '0 0 16px' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>{success}</div>}

            <div className="avatar-customizer-preview-box" style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: 'var(--radius-md)', marginBottom: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
              <div className="avatar-preview-wrapper" style={{ width: '85px', height: '85px' }}>
                <img src={finalAvatarUrl} alt={t('Avatar Preview')} className="avatar-large-preview" />
              </div>
              
              <div className="segmented-control" style={{ width: '260px', marginTop: '12px' }}>
                <button 
                  type="button"
                  className={`segment-btn ${avatarMode === 'avatar' ? 'active' : ''}`}
                  onClick={() => setAvatarMode('avatar')}
                >
                  {t('Generated Avatar')}
                </button>
                <button
                  type="button"
                  className={`segment-btn ${avatarMode === 'custom' ? 'active' : ''}`}
                  onClick={() => setAvatarMode('custom')}
                >
                  {t('Custom Photo')}
                </button>
              </div>
            </div>

            <div className="form-group-stacked" style={{ marginBottom: '16px' }}>
              <label className="form-label-stacked">{t('Display Name')}</label>
              <input
                type="text"
                className="login-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('Your full name')}
                disabled={loading}
              />
            </div>

            <div className="form-group-stacked" style={{ marginBottom: '16px' }}>
              <label className="form-label-stacked" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} className="text-cyan" />
                <span>{t('Mobile Phone / LINE ID')}</span>
              </label>
              <input
                type="text"
                className="login-form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('e.g. 081-234-5678 or Line ID for pickup')}
                disabled={loading}
              />
              <span className="text-xs text-muted" style={{ marginTop: '4px', display: 'block' }}>
                {t('Optional contact for security desk verification')}
              </span>
            </div>

            {avatarMode === 'avatar' ? (
              <div className="form-group-stacked animate-fadeIn" style={{ marginBottom: '18px' }}>
                <button 
                  type="button" 
                  className="btn btn-glass" 
                  onClick={handleRandomizeSeed}
                  disabled={loading}
                  style={{ width: '100%', gap: '8px', justifyContent: 'center' }}
                >
                  {t('🎲 Randomize Generated Character')}
                </button>
              </div>
            ) : (
              <div className="form-group-stacked animate-fadeIn" style={{ marginBottom: '18px' }}>
                <label className="form-label-stacked">{t('Upload Custom Profile Photo')}</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '4px 0 8px' }}>
                  <label className="btn btn-glass btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                    {t('Choose Image')}
                    <input
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span className="text-xs text-muted">
                    {customAvatarUrl.startsWith('data:') ? t('✓ Photo selected successfully') : t('Select a photo from your local files')}
                  </span>
                </div>
                {customAvatarUrl.startsWith('data:') && (
                  <button 
                    type="button"
                    className="text-xs text-rose" 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '2px', padding: 0 }}
                    onClick={() => setCustomAvatarUrl('')}
                  >
                    {t('✕ Clear selected photo')}
                  </button>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {loading ? t('Saving Profile Updates...') : t('✓ Save Changes')}
            </button>
          </form>
        </div>

        {/* Right Side: Notification Preferences & System Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Notification Preferences Card */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} className="text-primary" /> {t('Notification Preferences')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('Email Alerts for Claims')}</div>
                  <div className="text-xs text-muted">{t('Receive email updates when status or claim updates occur')}</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts} 
                  onChange={(e) => setEmailAlerts(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('Gemini AI Match Notifications')}</div>
                  <div className="text-xs text-muted">{t('Get notified when AI discovers a lost & found match')}</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={aiMatchAlerts} 
                  onChange={(e) => setAiMatchAlerts(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('In-App Toast Alerts')}</div>
                  <div className="text-xs text-muted">{t('Show real-time alerts inside the portal')}</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={toastAlerts} 
                  onChange={(e) => setToastAlerts(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                />
              </div>
            </div>
          </div>

          {/* Active Session & Integrations Card */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} className="text-primary" /> {t('AD Security & Integrations')}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div>
                <span className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('Email Address')}</span>
                <span style={{ fontWeight: 600 }}>{currentUser.email}</span>
              </div>
              
              <div>
                <span className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('Assigned Access Role')}</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {currentUser.role}
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '2px' }}>
                <span className="text-muted" style={{ display: 'block', marginBottom: '6px' }}>{t('System Integration Status')}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem' }}>Azure AD SSO</span>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>🟢 {t('SSO Authenticated')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem' }}>SpaceReserve Peer API</span>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>🟢 {t('Bilateral Sync Active')}</span>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider-line" style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }}></div>
              
              <button 
                type="button"
                onClick={onSignOut}
                className="btn btn-danger btn-block"
                style={{ justifyContent: 'center' }}
              >
                {t('Sign Out from Session')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
