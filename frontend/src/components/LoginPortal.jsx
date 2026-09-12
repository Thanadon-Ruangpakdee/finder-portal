import React, { useState } from 'react';
import { api } from '../services/api';
import { useT } from '../language';
import { ShieldCheck, FinderPortalLogo } from './Icons';

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
      <div className="login-split-card">
        {/* Left Side: Crimson Brand Hero Panel */}
        <div className="login-hero-side">
          {/* Folded Corner Ribbon Accent */}
          <div className="login-hero-ribbon"></div>

          <div className="login-hero-inner">
            <p className="hero-welcome-sub">{t('Hello,')}</p>
            <h2 className="hero-welcome-title">{t('welcome to!')}</h2>

            <div className="brand-logo-circle">
              <FinderPortalLogo size={46} color="#E11D48" />
            </div>

            <h1 className="brand-app-title">Finder Portal</h1>
            <p className="brand-app-sub">{t('Assumption University Lost & Found System')}</p>
          </div>
        </div>

        {/* Right Side: Sign In Form & Controls */}
        <div className="login-form-side">
          <div className="form-side-header">
            <h2 className="form-main-title">{t('Sign In')}</h2>
            <p className="form-main-sub">{t('Hey enter your details to sign in to your account')}</p>
          </div>

          {error && <div className="login-error-banner">{error}</div>}

          {/* Primary Action Button: Sign in with Microsoft */}
          <div className="primary-auth-block">
            <button 
              type="button" 
              className="btn-microsoft-primary"
              onClick={handleMicrosoftSignIn}
              disabled={loading}
            >
              {/* 4-Color Microsoft Grid Logo */}
              <svg viewBox="0 0 21 21" width="22" height="22" className="ms-logo-svg">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              <span>{t('Sign in with Microsoft')}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="login-divider-custom">
            <span>dev / test sign-in</span>
          </div>

          {/* Dev / Test Sign-In Section */}
          <div className="dev-section-wrapper">
            <label className="dev-label-title">{t('Quick login')}</label>
            
            <div className="dev-quick-grid">
              <button 
                type="button" 
                className="btn-dev-role"
                onClick={() => handleQuickLogin('STUDENT')}
                disabled={loading}
              >
                {t('Student')}
              </button>
              <button 
                type="button" 
                className="btn-dev-role"
                onClick={() => handleQuickLogin('TEACHER')}
                disabled={loading}
              >
                {t('Staff')}
              </button>
              <button 
                type="button" 
                className="btn-dev-role"
                onClick={() => handleQuickLogin('ADMIN')}
                disabled={loading}
              >
                {t('Admin')}
              </button>
            </div>

            {/* Specific user sign in details */}
            <details className="dev-user-accordion">
              <summary className="dev-accordion-summary">
                {t('Or sign in as a specific user')}
              </summary>

              <form onSubmit={handleDevSubmit} className="dev-accordion-form">
                <div className="custom-input-group">
                  <label>{t('Email')}</label>
                  <input
                    type="email"
                    className="custom-input-field"
                    placeholder="you@example.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="custom-input-group">
                  <label>{t('Name')}</label>
                  <input
                    type="text"
                    className="custom-input-field"
                    placeholder="Dev User"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="custom-input-group">
                  <label>{t('Role')}</label>
                  <select 
                    className="custom-select-field" 
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
                  className="btn-dev-submit"
                  disabled={loading}
                >
                  {loading ? t('Signing in...') : t('Sign in (dev)')}
                </button>
              </form>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
