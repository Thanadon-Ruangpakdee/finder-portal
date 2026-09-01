import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, ShieldCheck } from './Icons';
import { useT } from '../language';

export default function LoginPortal({ onLoginSuccess }) {
  const t = useT();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarMode, setAvatarMode] = useState('avatar'); // 'avatar' | 'custom'
  const [avatarSeed, setAvatarSeed] = useState('user');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Computes the dicebear adventurer avatar URL dynamically based on seed
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const finalAvatarUrl = avatarMode === 'avatar' 
    ? avatarUrl 
    : (customAvatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(t('Please fill in email and password.'));
      return;
    }

    if (!email.endsWith('@au.edu') && !email.endsWith('@ms.au.edu')) {
      setError(t('Please use a valid Assumption University email (@au.edu or @ms.au.edu).'));
      return;
    }

    setLoading(true);
    setError('');

    // Determine role based on email pattern
    let role = 'STUDENT';
    if (email.startsWith('staff.') || email.startsWith('teacher.')) role = 'TEACHER';
    if (email.startsWith('admin.')) role = 'ADMIN';

    // Simulate Active Directory OIDC Verification
    setTimeout(() => {
      // For sign-in, we simulate looking up their details
      const userName = email.split('@')[0].replace('.', ' ');
      api.loginAd({ email, name: userName, role })
        .then(data => {
          setLoading(false);
          onLoginSuccess(data.user);
        })
        .catch(err => {
          setLoading(false);
          setError(err.message || t('SSO authentication failed.'));
        });
    }, 1200);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !password.trim()) {
      setError(t('Please fill in all registration fields.'));
      return;
    }

    if (!email.endsWith('@au.edu') && !email.endsWith('@ms.au.edu')) {
      setError(t('Please use a valid Assumption University email (@au.edu or @ms.au.edu).'));
      return;
    }

    setLoading(true);
    setError('');

    let role = 'STUDENT';
    if (email.startsWith('staff.') || email.startsWith('teacher.')) role = 'TEACHER';
    if (email.startsWith('admin.')) role = 'ADMIN';

    setTimeout(() => {
      api.loginAd({ email, name, role, avatar: finalAvatarUrl })
        .then(data => {
          setLoading(false);
          onLoginSuccess(data.user);
        })
        .catch(err => {
          setLoading(false);
          setError(err.message || t('Failed to create student account.'));
        });
    }, 1200);
  };

  const handlePresetLogin = (presetEmail, presetName) => {
    setLoading(true);
    setError('');
    setEmail(presetEmail);
    setPassword('password123');

    let role = 'STUDENT';
    if (presetEmail.startsWith('staff.') || presetEmail.startsWith('teacher.')) role = 'TEACHER';
    if (presetEmail.startsWith('admin.')) role = 'ADMIN';

    setTimeout(() => {
      api.loginAd({ email: presetEmail, name: presetName, role })
        .then(data => {
          setLoading(false);
          onLoginSuccess(data.user);
        })
        .catch(err => {
          setLoading(false);
          setError(t('AD SSO authentication failed.'));
        });
    }, 800);
  };

  const randomizeAvatarSeed = () => {
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
    <div className="login-portal-overlay">
      <div className="login-card glass-card">
        {/* Crest & Title */}
        <div className="login-header">
          <div className="login-crest">
            <ShieldCheck size={36} className="text-rose" />
          </div>
          <h1 className="login-title">{t('Assumption University')}</h1>
          <p className="login-subtitle">{t('OIDC Single Sign-On (SSO)')}</p>
        </div>

        {/* Tab Selection */}
        <div className="login-tabs">
          <button 
            type="button" 
            className={`login-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); setError(''); }}
          >
            {t('Sign In')}
          </button>
          <button 
            type="button" 
            className={`login-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setError(''); }}
          >
            {t('Register / Sign Up')}
          </button>
        </div>

        {error && <div className="login-error-banner">{error}</div>}

        {activeTab === 'signin' ? (
          /* Sign In Form */
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-form-group">
              <label className="login-form-label">{t('University Email Address')}</label>
              <input
                type="email"
                className="login-form-input"
                placeholder="u6610308@ms.au.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="login-form-group">
              <label className="login-form-label">{t('Password')}</label>
              <input 
                type="password"
                className="login-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block btn-login"
              disabled={loading}
            >
              {loading ? t('Connecting to Microsoft Azure AD...') : t('Sign In with Microsoft AD')}
            </button>
          </form>
        ) : (
          /* Sign Up Form with Customizer */
          <form className="login-form" onSubmit={handleRegister}>
            <div className="login-form-group">
              <label className="login-form-label">{t('Full Name')}</label>
              <input
                type="text"
                className="login-form-input"
                placeholder={t('e.g. Thanadon Ruangpakdee')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="login-form-group">
              <label className="login-form-label">{t('University Email Address')}</label>
              <input
                type="email"
                className="login-form-input"
                placeholder="u6610308@ms.au.edu or staff.somchai@au.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="login-form-group">
              <label className="login-form-label">{t('Password')}</label>
              <input 
                type="password"
                className="login-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Live Profile Customizer during Registration */}
            <div className="register-avatar-customizer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="login-form-label" style={{ margin: 0 }}>{t('Customize Profile Image')}</span>
                
                {/* Image Mode Switcher */}
                <div className="segmented-control" style={{ fontSize: '0.68rem', padding: '2px' }}>
                  <button 
                    type="button" 
                    className={`segment-btn ${avatarMode === 'avatar' ? 'active' : ''}`}
                    style={{ padding: '3px 8px' }}
                    onClick={() => setAvatarMode('avatar')}
                  >
                    {t('Avatar')}
                  </button>
                  <button 
                    type="button" 
                    className={`segment-btn ${avatarMode === 'custom' ? 'active' : ''}`}
                    style={{ padding: '3px 8px' }}
                    onClick={() => setAvatarMode('custom')}
                  >
                    {t('Photo')}
                  </button>
                </div>
              </div>

              <div className="register-avatar-row">
                <div className="register-avatar-preview">
                  <img src={finalAvatarUrl} alt={t('Avatar')} className="avatar-register-img" />
                </div>

                <div className="register-avatar-controls">
                  {avatarMode === 'avatar' ? (
                    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                      <input 
                        type="text" 
                        className="login-form-input text-xs" 
                        style={{ padding: '6px 10px', flex: 1 }}
                        placeholder={t('Avatar seed')}
                        value={avatarSeed}
                        onChange={(e) => setAvatarSeed(e.target.value)}
                        disabled={loading}
                      />
                      <button 
                        type="button" 
                        className="btn btn-glass btn-sm"
                        style={{ padding: '6px 10px', fontSize: '0.72rem', flexShrink: 0 }}
                        onClick={randomizeAvatarSeed}
                        disabled={loading}
                      >
                        {t('🎲 Random')}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <label className="btn btn-glass btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '4px 8px', fontSize: '0.72rem' }}>
                          {t('Choose Image')}
                          <input
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }}
                          />
                        </label>
                        <span className="text-xxs text-muted">
                          {customAvatarUrl.startsWith('data:') ? t('✓ Photo selected') : t('Select local photo')}
                        </span>
                      </div>
                      {customAvatarUrl.startsWith('data:') && (
                        <button 
                          type="button"
                          className="text-xxs text-rose" 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                          onClick={() => setCustomAvatarUrl('')}
                        >
                          {t('✕ Clear selected photo')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block btn-login"
              disabled={loading}
            >
              {loading ? t('Creating OIDC Profile...') : t('Create Account & Sign In')}
            </button>
          </form>
        )}

        <div className="login-divider">
          <span>{t('Or Quick Dev-Login Presets')}</span>
        </div>

        {/* Quick Dev Presets */}
        <div className="login-presets">
          <button 
            className="preset-btn"
            onClick={() => handlePresetLogin('student.thanadon@ms.au.edu', 'Thanadon Ruangpakdee')}
            disabled={loading}
          >
            {t('Student')} (Thanadon)
          </button>
          <button 
            className="preset-btn"
            onClick={() => handlePresetLogin('staff.somchai@au.edu', 'Somchai Prasert')}
            disabled={loading}
          >
            {t('Teacher')} (Somchai)
          </button>
          <button 
            className="preset-btn"
            onClick={() => handlePresetLogin('admin.kitirat@au.edu', 'Kitirat Pisithaporn')}
            disabled={loading}
          >
            {t('Admin')} (Kitirat)
          </button>
        </div>
      </div>
    </div>
  );
}
