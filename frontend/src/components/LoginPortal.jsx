import React, { useState } from 'react';
import { api } from '../services/api';
import { useT } from '../language';

export default function LoginPortal({ onLoginSuccess }) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Real OIDC Microsoft Entra ID Login Redirect
  const handleMicrosoftSignIn = () => {
    const authEndpoint = isLocalhost 
      ? 'http://localhost:5001/api/v1/auth/microsoft' 
      : '/project/api/v1/auth/microsoft';
    window.location.href = authEndpoint;
  };

  // Quick preset login handler
  const handleQuickLogin = (presetRole) => {
    setLoading(true);
    setError('');

    api.loginMock(presetRole)
      .then(data => {
        setLoading(false);
        onLoginSuccess(data.user);
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || t('Quick sign-in failed.'));
      });
  };

  // Dev specific user login handler
  const handleDevSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setError(t('Please fill in email and name.'));
      return;
    }

    setLoading(true);
    setError('');

    api.loginAd({ email, name, role })
      .then(data => {
        setLoading(false);
        onLoginSuccess(data.user);
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || t('Dev authentication failed.'));
      });
  };

  return (
    <div className="login-portal-overlay">
      <div className="login-card glass-card">
        {/* Header */}
        <div className="login-header" style={{ textAlign: 'left', marginBottom: '22px' }}>
          <h1 className="login-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {t('Sign in')}
          </h1>
          <p className="login-subtitle" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 'normal', marginTop: '4px' }}>
            {t('Use your Assumption University account.')}
          </p>
        </div>

        {error && <div className="login-error-banner">{error}</div>}

        {/* Primary Action Button: Sign in with Microsoft */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            type="button" 
            className="btn-microsoft-signin"
            onClick={handleMicrosoftSignIn}
            disabled={loading}
          >
            {/* 4-Color Microsoft Grid Logo */}
            <svg viewBox="0 0 21 21" width="20" height="20" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span>{t('Sign in with Microsoft')}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="login-divider" style={{ margin: '20px 0 24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>dev / test sign-in</span>
        </div>

        {/* Dev / Test Sign-In Section */}
        <div style={{ textAlign: 'left' }}>
          <label className="login-form-label" style={{ display: 'block', marginBottom: '10px' }}>
            {t('Quick login')}
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
            <button 
              type="button" 
              className="btn btn-glass"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 600 }}
              onClick={() => handleQuickLogin('STUDENT')}
              disabled={loading}
            >
              {t('Student')}
            </button>
            <button 
              type="button" 
              className="btn btn-glass"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 600 }}
              onClick={() => handleQuickLogin('TEACHER')}
              disabled={loading}
            >
              {t('Staff')}
            </button>
            <button 
              type="button" 
              className="btn btn-glass"
              style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: 600 }}
              onClick={() => handleQuickLogin('ADMIN')}
              disabled={loading}
            >
              {t('Admin')}
            </button>
          </div>

          {/* Specific user sign in details */}
          <details style={{ marginTop: '14px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              ▼ {t('Or sign in as a specific user')}
            </summary>

            <form onSubmit={handleDevSubmit} className="login-form" style={{ marginTop: '14px', gap: '12px' }}>
              <div className="login-form-group">
                <label className="login-form-label">{t('Email')}</label>
                <input
                  type="email"
                  className="login-form-input"
                  placeholder="you@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="login-form-group">
                <label className="login-form-label">{t('Name')}</label>
                <input
                  type="text"
                  className="login-form-input"
                  placeholder="Dev User"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="login-form-group">
                <label className="login-form-label">{t('Role')}</label>
                <select 
                  className="filter-select" 
                  style={{ width: '100%', padding: '9px 12px' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="STUDENT">{t('Student')}</option>
                  <option value="TEACHER">{t('Staff / Teacher')}</option>
                  <option value="ADMIN">{t('Admin')}</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-glass w-full"
                style={{ marginTop: '8px', padding: '9px', fontWeight: 600 }}
                disabled={loading}
              >
                {loading ? t('Signing in...') : t('Sign in (dev)')}
              </button>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
}
