import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Globe2, 
  Sun, 
  Moon, 
  ChevronDown, 
  Layers, 
  UserCheck, 
  Building2, 
  Lock,
  Settings
} from './Icons';
import { USER_ROLES, MOCK_USERS } from '../services/store';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onOpenReportModal,
  theme,
  setTheme,
  onSignOut,
  onOpenProfileModal
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const selectRole = (roleKey) => {
    const newRole = MOCK_USERS[roleKey].role;
    setCurrentRole(newRole);
    // If student switched from a staff-only tab, return to feed
    if (newRole === USER_ROLES.STUDENT && (activeTab === 'dashboard' || activeTab === 'matcher' || activeTab === 'peer')) {
      setActiveTab('feed');
    }
    setShowRoleMenu(false);
  };

  const isStaffOrAdmin = currentRole === USER_ROLES.STAFF || currentRole === USER_ROLES.ADMIN;
  const isAdmin = currentRole === USER_ROLES.ADMIN;

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container glass-card">
        {/* Logo & Brand */}
        <div className="nav-brand" onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box">
            <Search className="brand-icon" size={20} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              Finder<span className="brand-accent">Portal</span>
            </div>
            <div className="brand-sub">Assumption University • AU</div>
          </div>
        </div>

        {/* Navigation Tabs (Role Based Access) */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
            title="Browse all items"
          >
            <Layers size={16} />
            <span>Browse</span>
          </button>

          {/* Staff & Admin Only Features */}
          {isStaffOrAdmin && (
            <>
              <button 
                className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                title="Manage claims and inventory"
              >
                <ShieldCheck size={16} />
                <span>{isAdmin ? 'Admin' : 'Staff'} Dash</span>
                <span className="nav-pill-badge">{isAdmin ? 'Admin' : 'Staff'}</span>
              </button>

              <button 
                className={`nav-tab-btn ${activeTab === 'matcher' ? 'active' : ''}`}
                onClick={() => setActiveTab('matcher')}
                title="AI Auto Matcher"
              >
                <Sparkles size={16} className="text-gold" />
                <span>AI Matcher</span>
                <span className="nav-pill-ai">Auto</span>
              </button>

              <button 
                className={`nav-tab-btn ${activeTab === 'peer' ? 'active' : ''}`}
                onClick={() => setActiveTab('peer')}
                title="SpaceReserve Peer API Integration"
              >
                <Globe2 size={16} />
                <span>SpaceReserve</span>
                <span className="nav-pill-peer">Peer</span>
              </button>
            </>
          )}
          <button 
            className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings & Profile"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Action Buttons & Right Controls */}
        <div className="nav-actions">
          {/* Report Buttons */}
          <button 
            className="btn btn-gold btn-sm nav-action-btn"
            onClick={() => onOpenReportModal('FOUND')}
          >
            <PlusCircle size={14} />
            <span>Report Found</span>
          </button>

          <button 
            className="btn btn-danger btn-sm nav-action-btn"
            onClick={() => onOpenReportModal('LOST')}
          >
            <AlertCircle size={14} />
            <span>Report Lost</span>
          </button>

          {/* Theme Toggle */}
          <button 
            className="icon-btn theme-toggle-btn" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Role Switcher Button */}
          <div className="role-switcher-container">
            <button 
              className="role-switcher-btn"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
            >
              <img src={currentUser.avatar} alt="User Avatar" className="role-avatar" />
              <div className="role-info-text">
                <span className="role-user-name">{currentUser.name.split(' ')[0]}</span>
                <span className="role-badge-pill">
                  {currentRole === USER_ROLES.ADMIN ? 'Admin' : currentRole === USER_ROLES.TEACHER ? 'Teacher' : 'Student'}
                </span>
              </div>
              <ChevronDown size={13} className="role-chevron" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="role-dropdown-menu glass-card">
                <div className="role-dropdown-header" style={{ marginBottom: '8px' }}>
                  <span className="dropdown-title">User Account Session</span>
                  <span className="dropdown-sub">Authenticated via OIDC</span>
                </div>

                <div 
                  className="role-option-item"
                  onClick={() => {
                    setShowRoleMenu(false);
                    setActiveTab('settings');
                  }}
                >
                  <div className="role-option-icon" style={{ background: 'rgba(217, 119, 6, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem' }}>
                    🎨
                  </div>
                  <div className="role-option-text">
                    <div className="role-opt-title">Customize Profile</div>
                    <div className="role-opt-desc">Change display name & avatar</div>
                  </div>
                </div>
                <div className="dropdown-divider-line" style={{ borderTop: '1px solid var(--border-subtle)', margin: '6px 0' }}></div>

                <div 
                  className="role-option-item signout-option-item"
                  onClick={() => {
                    setShowRoleMenu(false);
                    onSignOut();
                  }}
                >
                  <div className="role-option-icon signout-icon" style={{ background: 'rgba(200,16,46,0.1)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    ✕
                  </div>
                  <div className="role-option-text">
                    <div className="role-opt-title" style={{ color: 'var(--primary-light)' }}>Sign Out</div>
                    <div className="role-opt-desc">Clear session & return to SSO</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
