import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  User, 
  MapPin, 
  Mail, 
  FileText, 
  TrendingUp
} from './Icons';
import { USER_ROLES } from '../services/store';
import { api } from '../services/api';
import { useT } from '../language';

export default function AdminDashboard({
  items,
  currentRole,
  onApproveClaim,
  onRejectClaim,
  onUpdateItemStatus,
  onDeleteItem
}) {
  const t = useT();
  const [successNotice, setSuccessNotice] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Collect all pending claims across items
  const pendingClaimsList = [];
  items.forEach(item => {
    if (item.claims && item.claims.length > 0) {
      item.claims.forEach(claim => {
        if (claim.status === 'PENDING') {
          pendingClaimsList.push({
            ...claim,
            item
          });
        }
      });
    }
  });

  const handleApprove = (itemId, claimId, userName) => {
    onApproveClaim(itemId, claimId);
    setSuccessNotice(`✓ ${t('Claim approved for')} ${userName}! ${t('Item marked as Reunited.')}`);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleReject = (itemId, claimId, userName) => {
    onRejectClaim(itemId, claimId);
    setSuccessNotice(`✕ ${t('Claim rejected for')} ${userName}. ${t('Notification sent.')}`);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Fetch users directory for role assignment (Admin only)
  const fetchUsers = () => {
    if (currentRole === USER_ROLES.ADMIN) {
      setLoadingUsers(true);
      api.getUsers()
        .then(setUsers)
        .catch(err => console.error('Failed to load users directory:', err))
        .finally(() => setLoadingUsers(false));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentRole]);

  const handleRoleUpdate = (userId, newRole) => {
    api.updateUserRole(userId, newRole)
      .then(() => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setSuccessNotice(`✓ ${t('Role updated to')} ${newRole} ${t('for user')} ${userId}`);
        setTimeout(() => setSuccessNotice(''), 4000);
      })
      .catch(err => {
        alert(t('Failed to update role: ') + err.message);
      });
  };

  const totalItems = items.length;
  const claimedItems = items.filter(i => i.status === 'CLAIMED').length;
  const recoveryRate = totalItems > 0 ? Math.round((claimedItems / totalItems) * 100) : 0;

  return (
    <div className="dashboard-wrapper animate-fadeIn">
      {/* Header Banner */}
      <div className="dashboard-header-card glass-card">
        <div className="dash-header-left">
          <div className="dash-icon-box">
            <ShieldCheck size={28} className="text-purple" />
          </div>
          <div>
            <h1 className="dash-title">{t('Teacher & Admin Operations Hub')}</h1>
            <p className="dash-sub">
              {t('Review ownership proofs submitted by students, update item inventory statuses, and oversee lost & found operations.')}
            </p>
          </div>
        </div>

        <div className="dash-role-badge">
          <span>{t('Active Role:')} <strong>{currentRole === USER_ROLES.ADMIN ? t('System Admin') : t('Teacher')}</strong></span>
        </div>
      </div>

      {successNotice && (
        <div className="dashboard-alert-banner glass-card">
          <CheckCircle size={20} className="text-emerald" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Overview Analytics Bar */}
      <div className="dash-metrics-grid">
        <div className="metric-box glass-card">
          <div className="metric-icon-bg bg-blue">
            <FileText size={20} className="text-blue" />
          </div>
          <div>
            <div className="metric-val">{totalItems}</div>
            <div className="metric-label">{t('Total Logged Items')}</div>
          </div>
        </div>

        <div className="metric-box glass-card">
          <div className="metric-icon-bg bg-amber">
            <Clock size={20} className="text-amber" />
          </div>
          <div>
            <div className="metric-val text-amber">{pendingClaimsList.length}</div>
            <div className="metric-label">{t('Pending Claim Verifications')}</div>
          </div>
        </div>

        <div className="metric-box glass-card">
          <div className="metric-icon-bg bg-emerald">
            <CheckCircle size={20} className="text-emerald" />
          </div>
          <div>
            <div className="metric-val text-emerald">{claimedItems}</div>
            <div className="metric-label">{t('Reunited Items')}</div>
          </div>
        </div>

        <div className="metric-box glass-card">
          <div className="metric-icon-bg bg-purple">
            <TrendingUp size={20} className="text-purple" />
          </div>
          <div>
            <div className="metric-val">{recoveryRate}%</div>
            <div className="metric-label">{t('Reunion Resolution Rate')}</div>
          </div>
        </div>
      </div>

      {/* Section 1: Pending Claims Review Queue */}
      <div className="dash-section-card glass-card">
        <div className="section-title-row">
          <div className="section-title-left">
            <Clock size={20} className="text-amber" />
            <h2>{t('Pending Claim Requests Review Queue')}</h2>
          </div>
          <span className="badge badge-found">{pendingClaimsList.length} {t('Awaiting Verification')}</span>
        </div>

        {pendingClaimsList.length === 0 ? (
          <div className="empty-results-box" style={{ background: 'transparent', padding: '24px' }}>
            <span>{t('No claim verifications pending review right now.')}</span>
          </div>
        ) : (
          <div className="claims-review-grid">
            {pendingClaimsList.map((claim) => (
              <div key={claim.id} className="claim-review-row glass-card">
                {/* Item Thumbnail */}
                <img src={claim.item.photoUrl} alt="" className="claim-item-thumb" />

                {/* Claim details */}
                <div className="claim-detail-main">
                  <div className="claim-item-title">{t('Claim for:')} <strong>{claim.item.title}</strong></div>
                  
                  <div className="claim-user-meta">
                    <div className="meta-item">
                      <User size={13} />
                      <span>{claim.userName}</span>
                    </div>
                    <div className="meta-item">
                      <Mail size={13} />
                      <span>{claim.userEmail}</span>
                    </div>
                  </div>

                  <p className="claim-proof-text">
                    <strong>{t('Submitted Proof:')}</strong> "{claim.proofDescription}"
                  </p>
                </div>

                {/* Verification Actions */}
                <div className="claim-action-buttons">
                  <button 
                    className="btn btn-success btn-sm w-full"
                    onClick={() => handleApprove(claim.item.id, claim.id, claim.userName)}
                  >
                    <CheckCircle size={15} />
                    <span>{t('Approve & Return')}</span>
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(claim.item.id, claim.id, claim.userName)}
                  >
                    <XCircle size={15} />
                    <span>{t('Reject')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: User Role Manager (Admin Only) */}
      {currentRole === USER_ROLES.ADMIN && (
        <div className="dash-section-card glass-card">
          <div className="section-title-row">
            <div className="section-title-left">
              <User size={20} className="text-purple" />
              <h2>{t('OIDC User Accounts & Role Permissions Directory')}</h2>
            </div>
            <span className="badge badge-lost">{users.length} {t('Users Registered')}</span>
          </div>

          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t('User Profile')}</th>
                  <th>{t('ID / Username')}</th>
                  <th>{t('Active Directory Email')}</th>
                  <th>{t('Assigned Role Permissions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="table-item-cell">
                        <img 
                          src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`} 
                          alt="" 
                          className="table-item-img" 
                        />
                        <div className="table-item-name">{user.name}</div>
                      </div>
                    </td>
                    <td>
                      <code className="text-sm">{user.id}</code>
                    </td>
                    <td>
                      <span className="text-secondary">{user.email}</span>
                    </td>
                    <td>
                      <select
                        className="table-status-select"
                        style={{ borderLeft: '4px solid var(--accent-gold)' }}
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                      >
                        <option value="STUDENT">{t('STUDENT')}</option>
                        <option value="TEACHER">{t('TEACHER')}</option>
                        <option value="ADMIN">{t('ADMIN')}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 3: Full Item Management Table */}
      <div className="dash-section-card glass-card">
        <div className="section-title-row">
          <div className="section-title-left">
            <FileText size={20} className="text-blue" />
            <h2>{t('Full Campus Inventory Management')}</h2>
          </div>
          <span className="text-muted text-sm">{items.length} {t('Total Records')}</span>
        </div>

        <div className="table-responsive">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{t('Item & Category')}</th>
                <th>{t('Type')}</th>
                <th>{t('Location')}</th>
                <th>{t('Reported By')}</th>
                <th>{t('Status Management')}</th>
                {currentRole === USER_ROLES.ADMIN && <th>{t('Action')}</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="table-item-cell">
                      <img src={item.photoUrl} alt="" className="table-item-img" />
                      <div>
                        <div className="table-item-name">{item.title}</div>
                        <span className="table-cat-tag">{t(item.category)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.type === 'FOUND' ? 'badge-found' : 'badge-lost'}`}>
                      {t(item.type)}
                    </span>
                  </td>
                  <td>
                    <div className="table-loc-text">{item.location}</div>
                  </td>
                  <td>
                    <div className="table-user-name">{item.reportedBy?.name?.split(' ')[0]}</div>
                    <div className="table-user-email">{item.reportedBy?.email}</div>
                  </td>
                  <td>
                    <select 
                      className="table-status-select"
                      value={item.status}
                      onChange={(e) => onUpdateItemStatus(item.id, e.target.value)}
                    >
                      <option value="OPEN">{t('OPEN')}</option>
                      <option value="MATCHED">{t('MATCHED')}</option>
                      <option value="CLAIMED">{t('CLAIMED')}</option>
                      <option value="CLOSED">{t('CLOSED')}</option>
                    </select>
                  </td>
                  {currentRole === USER_ROLES.ADMIN && (
                    <td>
                      <button 
                        className="table-delete-btn"
                        onClick={() => onDeleteItem(item.id)}
                        title={t('Delete record (Admin only)')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
