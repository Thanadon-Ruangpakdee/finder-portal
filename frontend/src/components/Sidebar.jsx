import React from 'react';
import {
  Search,
  ShieldCheck,
  Sparkles,
  Globe2,
  Layers,
  Settings
} from './Icons';
import { USER_ROLES, ITEM_CATEGORIES } from '../services/store';
import { useT } from '../language';

// สีจุดนำหน้าแต่ละหมวดหมู่
const CATEGORY_DOT_COLORS = {
  'All': 'linear-gradient(135deg, var(--primary), var(--accent-gold))',
  'Electronics': '#2563eb',
  'Wallets & Bags': '#d97706',
  'IDs & Cards': '#dc2626',
  'Keys': '#64748b',
  'Bottles & Tumblers': '#10b981',
  'Books & Documents': '#7c3aed',
  'Accessories': '#f472b6'
};

const LOCATIONS = [
  'All Locations',
  'Cathedral of Learning (CL Building)',
  'John Paul II Sports Center',
  'Room 402 (Engineering Building)',
  'Central Library (3rd Floor)',
  'Library Room 4B / Study Pod',
  'Campus Cafeteria (AU Mall)',
  'Martin de Tours Hall (MSME)'
];

export default function Sidebar({
  currentRole,
  activeTab,
  setActiveTab,
  allItems = [],
  selectedCategory,
  setSelectedCategory,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  selectedLocation,
  setSelectedLocation,
  isOpen,
  onClose
}) {
  const t = useT();

  // หมายเหตุ: Navbar เดิมเช็ค USER_ROLES.STAFF ซึ่งไม่มีอยู่ใน store.js (มีแค่ STUDENT/TEACHER/ADMIN)
  // ทำให้อาจารย์ (TEACHER) มองไม่เห็นแท็บของตัวเอง ตรงนี้แก้ให้ถูกแล้ว
  const isStaffOrAdmin =
    currentRole === USER_ROLES.TEACHER || currentRole === USER_ROLES.ADMIN;
  const isAdmin = currentRole === USER_ROLES.ADMIN;

  // นับจำนวนของในแต่ละหมวดหมู่จากรายการทั้งหมด
  const countFor = (cat) =>
    cat === 'All'
      ? allItems.length
      : allItems.filter((i) => i.category === cat).length;

  const goTo = (tab) => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSelectedLocation('All Locations');
  };

  return (
    <>
      {/* ฉากหลังสีดำจางตอนเปิดเมนูบนจอเล็ก */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* โลโก้ */}
        <div className="sidebar-brand" onClick={() => goTo('feed')}>
          <div className="sidebar-brand-icon">
            <Search size={19} />
          </div>
          <div>
            <div className="sidebar-brand-title">
              Finder<span className="sidebar-brand-accent">Portal</span>
            </div>
            <div className="sidebar-brand-sub">
              {t('Assumption University')} • AU
            </div>
          </div>
        </div>

        <div className="sidebar-scroll">
          {/* ---------- เมนูหลัก ---------- */}
          <div className="side-section">
            <div className="side-label">{t('Main Menu')}</div>
            <nav className="side-nav">
              <button
                className={`side-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => goTo('feed')}
              >
                <Layers size={17} />
                <span className="side-nav-grow">{t('Browse')}</span>
              </button>

              {isStaffOrAdmin && (
                <>
                  <button
                    className={`side-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => goTo('dashboard')}
                  >
                    <ShieldCheck size={17} />
                    <span className="side-nav-grow">
                      {isAdmin ? t('Admin Dash') : t('Staff Dash')}
                    </span>
                    <span className="side-nav-pill pill-staff">
                      {isAdmin ? t('Admin') : t('Staff')}
                    </span>
                  </button>

                  <button
                    className={`side-nav-btn ${activeTab === 'matcher' ? 'active' : ''}`}
                    onClick={() => goTo('matcher')}
                  >
                    <Sparkles size={17} />
                    <span className="side-nav-grow">{t('AI Matcher')}</span>
                    <span className="side-nav-pill pill-ai">{t('Auto')}</span>
                  </button>

                  <button
                    className={`side-nav-btn ${activeTab === 'peer' ? 'active' : ''}`}
                    onClick={() => goTo('peer')}
                  >
                    <Globe2 size={17} />
                    <span className="side-nav-grow">SpaceReserve</span>
                    <span className="side-nav-pill pill-peer">{t('Peer')}</span>
                  </button>
                </>
              )}

              <button
                className={`side-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => goTo('settings')}
              >
                <Settings size={17} />
                <span className="side-nav-grow">{t('Settings')}</span>
              </button>
            </nav>
          </div>

          {/* ---------- หมวดหมู่ + ตัวกรอง (เฉพาะหน้า Browse) ---------- */}
          {activeTab === 'feed' && (
            <>
              <div className="side-divider"></div>

              <div className="side-section">
                <div className="side-label">{t('Categories')}</div>
                <div className="side-cat-list">
                  {ITEM_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`side-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span
                        className="side-cat-dot"
                        style={{ background: CATEGORY_DOT_COLORS[cat] || 'var(--text-muted)' }}
                      ></span>
                      <span className="side-cat-name">{t(cat)}</span>
                      <span className="side-cat-count">{countFor(cat)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="side-divider"></div>

              <div className="side-section">
                <div className="side-label">{t('Filters')}</div>

                {/* ประเภท */}
                <div className="side-filter-group">
                  <div className="side-filter-title">{t('Type')}</div>
                  <div className="side-segmented">
                    <button
                      className={`side-seg-btn ${typeFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setTypeFilter('ALL')}
                    >
                      {t('All')}
                    </button>
                    <button
                      className={`side-seg-btn ${typeFilter === 'FOUND' ? 'active' : ''}`}
                      onClick={() => setTypeFilter('FOUND')}
                    >
                      {t('Found')}
                    </button>
                    <button
                      className={`side-seg-btn ${typeFilter === 'LOST' ? 'active' : ''}`}
                      onClick={() => setTypeFilter('LOST')}
                    >
                      {t('Lost')}
                    </button>
                  </div>
                </div>

                {/* สถานะ */}
                <div className="side-filter-group">
                  <div className="side-filter-title">{t('Status')}</div>
                  <select
                    className="side-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">{t('All Statuses')}</option>
                    <option value="OPEN">{t('Open (Unclaimed)')}</option>
                    <option value="MATCHED">{t('Matched')}</option>
                    <option value="CLAIMED">{t('Reunited / Claimed')}</option>
                    <option value="CLOSED">{t('Closed')}</option>
                  </select>
                </div>

                {/* สถานที่ */}
                <div className="side-filter-group">
                  <div className="side-filter-title">{t('Location')}</div>
                  <select
                    className="side-select"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {t(loc)}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="side-reset-btn" onClick={resetFilters}>
                  {t('Clear all filters')}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
