import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Sliders,
  AlertTriangle,
  CheckCircle
} from './Icons';
import { ITEM_CATEGORIES } from '../services/store';

export default function HeroBanner({
  items,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  selectedLocation,
  setSelectedLocation
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Compute real-time stats
  const totalItems = items.length;
  const foundCount = items.filter(i => i.type === 'FOUND').length;
  const lostCount = items.filter(i => i.type === 'LOST').length;
  const claimedCount = items.filter(i => i.status === 'CLAIMED').length;
  const successRate = totalItems > 0 ? Math.round((claimedCount / totalItems) * 100) : 0;

  const locations = [
    'All Locations',
    'Cathedral of Learning (CL Building)',
    'John Paul II Sports Center',
    'Room 402 (Engineering Building)',
    'Central Library (3rd Floor)',
    'Library Room 4B / Study Pod',
    'Campus Cafeteria (AU Mall)',
    'Martin de Tours Hall (MSME)'
  ];

  return (
    <div className="hero-banner-section">
      {/* Top Tag & Title */}
      <div className="hero-header-content">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-sparkle" />
          <span>Assumption University (ABAC) • AI Lost & Found</span>
        </div>
        <h1 className="hero-main-title">
          Reuniting AU Students with their <span className="gradient-text">Lost Belongings</span>
        </h1>
        <p className="hero-subtitle">
          Search Assumption University records, report found items with instant Gemini AI category tagging, or verify claims securely via Microsoft Active Directory.
        </p>
      </div>

      {/* Metrics Cards Grid - Clickable & Filter Integrated */}
      <div className="hero-stats-grid">
        <div 
          className={`stat-card glass-card clickable-stat-card ${typeFilter === 'FOUND' && statusFilter !== 'CLAIMED' ? 'active' : ''}`}
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
            <div className="stat-label">Items Found</div>
          </div>
        </div>

        <div 
          className={`stat-card glass-card clickable-stat-card ${typeFilter === 'LOST' && statusFilter !== 'CLAIMED' ? 'active' : ''}`}
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
            <div className="stat-label">Lost Reports</div>
          </div>
        </div>

        <div 
          className={`stat-card glass-card clickable-stat-card ${statusFilter === 'CLAIMED' ? 'active' : ''}`}
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
            <div className="stat-label">Reunited</div>
          </div>
        </div>

        <div 
          className={`stat-card glass-card clickable-stat-card ${typeFilter === 'ALL' && statusFilter === 'ALL' ? 'active' : ''}`}
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
            <div className="stat-label">Reset / Show All</div>
          </div>
        </div>
      </div>

      {/* Search & Comprehensive Filters Card */}
      <div className="search-filter-box glass-card">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search className="search-input-icon" size={18} />
          <input 
            type="text"
            className="main-search-input"
            placeholder="Search by keywords (e.g. MacBook, Wallet, Keys, Phone)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="search-right-actions">
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
            <button 
              className={`filter-toggle-btn icon-btn ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
              title="Toggle Advanced Filters"
            >
              <Sliders size={18} />
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="category-pills-row">
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls (Type, Status, Location) */}
        {showAdvanced && (
          <div className="secondary-filters-row animate-fadeIn">
            {/* Type Toggle */}
            <div className="filter-group">
              <span className="filter-label">Type:</span>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${typeFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setTypeFilter('ALL')}
                >
                  All
                </button>
                <button 
                  className={`segment-btn segment-found ${typeFilter === 'FOUND' ? 'active' : ''}`}
                  onClick={() => setTypeFilter('FOUND')}
                >
                  Found
                </button>
                <button 
                  className={`segment-btn segment-lost ${typeFilter === 'LOST' ? 'active' : ''}`}
                  onClick={() => setTypeFilter('LOST')}
                >
                  Lost
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <span className="filter-label">Status:</span>
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open (Unclaimed)</option>
                <option value="MATCHED">Matched</option>
                <option value="CLAIMED">Reunited / Claimed</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <span className="filter-label">Location:</span>
              <select 
                className="filter-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
