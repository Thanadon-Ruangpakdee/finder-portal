import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  AlertCircle,
  Sun,
  Moon,
  ChevronDown,
  Layers
} from './Icons';
import { USER_ROLES } from '../services/store';
import { useT, useLang } from '../language';

export default function Navbar({
  currentRole,
  currentUser,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenReportModal,
  theme,
  setTheme,
  onSignOut,
  onToggleSidebar
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const t = useT();
  const { lang, setLang } = useLang();

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="topbar-wrapper">
      {/* ปุ่มเปิดเมนู — โผล่เฉพาะจอเล็ก */}
      <button
        className="icon-btn topbar-burger"
        onClick={onToggleSidebar}
        title={t('Open / close menu')}
      >
        <Layers size={17} />
      </button>

      {/* ช่องค้นหา */}
      <div className="topbar-search">
        <Search className="topbar-search-icon" size={16} />
        <input
          type="text"
          className="topbar-search-input"
          placeholder={t('Search by keywords (e.g. MacBook, Wallet, Keys, Phone)...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => activeTab !== 'feed' && setActiveTab('feed')}
        />
        {searchQuery && (
          <button
            className="topbar-search-clear"
            onClick={() => setSearchQuery('')}
            title={t('Clear search')}
          >
            ✕
          </button>
        )}
      </div>

      {/* ฝั่งขวา */}
      <div className="topbar-actions">
        <button
          className="btn btn-gold btn-sm topbar-report-btn"
          onClick={() => onOpenReportModal('FOUND')}
        >
          <PlusCircle size={14} />
          <span>{t('Report Found')}</span>
        </button>

        <button
          className="btn btn-danger btn-sm topbar-report-btn"
          onClick={() => onOpenReportModal('LOST')}
        >
          <AlertCircle size={14} />
          <span>{t('Report Lost')}</span>
        </button>

        {/* สลับภาษา EN / ไทย */}
        <div className="lang-switcher" title={t('Switch language')}>
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`lang-btn ${lang === 'th' ? 'active' : ''}`}
            onClick={() => setLang('th')}
          >
            ไทย
          </button>
        </div>

        <button
          className="icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('Switch to Light Mode') : t('Switch to Dark Mode')}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* บัญชีผู้ใช้ */}
        <div className="role-switcher-container">
          <button
            className="role-switcher-btn"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
          >
            <img src={currentUser.avatar} alt="User Avatar" className="role-avatar" />
            <div className="role-info-text">
              <span className="role-user-name">{currentUser.name.split(' ')[0]}</span>
              <span className="role-badge-pill">
                {currentRole === USER_ROLES.ADMIN
                  ? t('Admin')
                  : currentRole === USER_ROLES.TEACHER
                  ? t('Teacher')
                  : t('Student')}
              </span>
            </div>
            <ChevronDown size={13} className="role-chevron" />
          </button>

          {showRoleMenu && (
            <div className="role-dropdown-menu glass-card">
              <div className="role-dropdown-header" style={{ marginBottom: '8px' }}>
                <span className="dropdown-title">{t('User Account Session')}</span>
                <span className="dropdown-sub">{t('Authenticated via OIDC')}</span>
              </div>

              <div
                className="role-option-item"
                onClick={() => {
                  setShowRoleMenu(false);
                  setActiveTab('settings');
                }}
              >
                <div
                  className="role-option-icon"
                  style={{
                    background: 'rgba(217, 119, 6, 0.15)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem'
                  }}
                >
                  🎨
                </div>
                <div className="role-option-text">
                  <div className="role-opt-title">{t('Customize Profile')}</div>
                  <div className="role-opt-desc">{t('Change display name & avatar')}</div>
                </div>
              </div>

              <div
                className="dropdown-divider-line"
                style={{ borderTop: '1px solid var(--border-subtle)', margin: '6px 0' }}
              ></div>

              <div
                className="role-option-item signout-option-item"
                onClick={() => {
                  setShowRoleMenu(false);
                  onSignOut();
                }}
              >
                <div
                  className="role-option-icon signout-icon"
                  style={{
                    background: 'rgba(200,16,46,0.1)',
                    color: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </div>
                <div className="role-option-text">
                  <div className="role-opt-title" style={{ color: 'var(--primary-light)' }}>
                    {t('Sign Out')}
                  </div>
                  <div className="role-opt-desc">{t('Clear session & return to SSO')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
