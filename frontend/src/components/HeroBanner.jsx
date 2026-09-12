import React from 'react';
import {
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle
} from './Icons';
import { useT } from '../language';

/**
 * HeroBanner แบบย่อส่วน
 * ช่องค้นหา / หมวดหมู่ / ตัวกรอง ย้ายไปอยู่ที่แถบซ้าย (Sidebar.jsx) และแถบบน (Navbar.jsx) แล้ว
 * เหลือไว้แค่ป้ายหัวเรื่อง + หัวข้อไล่สี + การ์ดสถิติที่กดกรองได้เหมือนเดิม
 */
export default function HeroBanner({
  items,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter
}) {
  const t = useT();

  const totalItems = items.length;
  const foundCount = items.filter((i) => i.type === 'FOUND' && i.status !== 'CLAIMED').length;
  const lostCount = items.filter((i) => i.type === 'LOST' && i.status !== 'CLAIMED').length;
  const claimedCount = items.filter((i) => i.status === 'CLAIMED').length;
  const successRate = totalItems > 0 ? Math.round((claimedCount / totalItems) * 100) : 0;

  return (
    <div className="hero-compact-card hero-crimson-banner">
      {/* Folded Ribbon Accent (Matching Login Hero) */}
      <div className="hero-crimson-ribbon"></div>

      {/* Header Content */}
      <div className="hero-compact-head">
        <div className="hero-badge hero-badge-crimson">
          <Sparkles size={14} className="hero-sparkle" />
          <span>{t('Assumption University (ABAC) • AI Lost & Found')}</span>
        </div>
        <h1 className="hero-main-title hero-title-white">
          {t('Reuniting AU Students with their')}{' '}
          <span className="hero-title-highlight">{t('Lost Belongings')}</span>
        </h1>
        <p className="hero-subtitle hero-sub-white">
          {t(
            'Search Assumption University records, report found items with instant Gemini AI category tagging, or verify claims securely via Microsoft Active Directory.'
          )}
        </p>
      </div>

      {/* การ์ดสถิติ — กดเพื่อกรองได้เหมือนเดิม */}
      <div className="hero-stats-grid">
        <div
          className={`stat-card stat-card-crimson ${
            typeFilter === 'FOUND' && statusFilter !== 'CLAIMED' ? 'active' : ''
          }`}
          onClick={() => {
            setTypeFilter('FOUND');
            setStatusFilter('ALL');
          }}
        >
          <div className="stat-icon-wrapper stat-icon-blue">
            <Search size={18} />
          </div>
          <div className="stat-text">
            <div className="stat-number">{foundCount}</div>
            <div className="stat-label">{t('Items Found')}</div>
          </div>
        </div>

        <div
          className={`stat-card stat-card-crimson ${
            typeFilter === 'LOST' && statusFilter !== 'CLAIMED' ? 'active' : ''
          }`}
          onClick={() => {
            setTypeFilter('LOST');
            setStatusFilter('ALL');
          }}
        >
          <div className="stat-icon-wrapper stat-icon-rose">
            <AlertTriangle size={18} />
          </div>
          <div className="stat-text">
            <div className="stat-number">{lostCount}</div>
            <div className="stat-label">{t('Lost Reports')}</div>
          </div>
        </div>

        <div
          className={`stat-card stat-card-crimson ${
            statusFilter === 'CLAIMED' ? 'active' : ''
          }`}
          onClick={() => {
            setStatusFilter('CLAIMED');
            setTypeFilter('ALL');
          }}
        >
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle size={18} />
          </div>
          <div className="stat-text">
            <div className="stat-number">{claimedCount}</div>
            <div className="stat-label">{t('Reunited')}</div>
          </div>
        </div>

        <div
          className={`stat-card stat-card-crimson ${
            typeFilter === 'ALL' && statusFilter === 'ALL' ? 'active' : ''
          }`}
          onClick={() => {
            setTypeFilter('ALL');
            setStatusFilter('ALL');
          }}
        >
          <div className="stat-icon-wrapper stat-icon-purple">
            <Sparkles size={18} />
          </div>
          <div className="stat-text">
            <div className="stat-number">{successRate}%</div>
            <div className="stat-label">{t('Reset / Show All')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
