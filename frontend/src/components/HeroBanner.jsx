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
  const foundCount = items.filter((i) => i.type === 'FOUND').length;
  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const claimedCount = items.filter((i) => i.status === 'CLAIMED').length;
  const successRate = totalItems > 0 ? Math.round((claimedCount / totalItems) * 100) : 0;

  return (
    <div className="hero-compact-card glass-card">
      {/* ป้าย + หัวข้อ */}
      <div className="hero-compact-head">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-sparkle" />
          <span>{t('Assumption University (ABAC) • AI Lost & Found')}</span>
        </div>
        <h1 className="hero-main-title">
          {t('Reuniting AU Students with their')}{' '}
          <span className="gradient-text">{t('Lost Belongings')}</span>
        </h1>
        <p className="hero-subtitle">
          {t(
            'Search Assumption University records, report found items with instant Gemini AI category tagging, or verify claims securely via Microsoft Active Directory.'
          )}
        </p>
      </div>

      {/* การ์ดสถิติ — กดเพื่อกรองได้เหมือนเดิม */}
      <div className="hero-stats-grid">
        <div
          className={`stat-card clickable-stat-card ${
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
          className={`stat-card clickable-stat-card ${
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
          className={`stat-card clickable-stat-card ${
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
          className={`stat-card clickable-stat-card ${
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
