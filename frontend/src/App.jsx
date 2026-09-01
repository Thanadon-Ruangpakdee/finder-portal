import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroBanner from './components/HeroBanner';
import ItemCard from './components/ItemCard';
import ItemDetailModal from './components/ItemDetailModal';
import ReportModal from './components/ReportModal';
import AdminDashboard from './components/AdminDashboard';
import PeerApiExplorer from './components/PeerApiExplorer';
import AiMatcher from './components/AiMatcher';
import { 
  USER_ROLES, 
  MOCK_USERS 
} from './services/store';
import { api } from './services/api';
import { useT } from './language';
import LoginPortal from './components/LoginPortal';
import CustomizeProfileModal from './components/CustomizeProfileModal';
import SettingsView from './components/SettingsView';
import StudentClaimsView from './components/StudentClaimsView';
import { 
  Sparkles, 
  PlusCircle, 
  AlertCircle, 
  Layers, 
  Search, 
  CheckCircle2, 
  Inbox
} from './components/Icons';

export default function App() {
  const t = useT();

  // Theme state
  const [theme, setTheme] = useState('light');

  // Role & Current User state
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'dashboard' | 'peer'

  // Items database state
  const [items, setItems] = useState([]);
  const [statsItems, setStatsItems] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'FOUND' | 'LOST'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'MATCHED' | 'CLAIMED' | 'CLOSED'
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  // Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState('FOUND');
  const [peerInitialRoom, setPeerInitialRoom] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');

  // แถบเมนูซ้าย (ใช้ตอนจอเล็กเท่านั้น จอใหญ่จะกางค้างไว้เสมอ)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load items when search or filter values change
  const fetchItems = () => {
    if (!currentUser) return;
    api.getItems({
      search: searchQuery,
      category: selectedCategory,
      type: typeFilter,
      status: statusFilter,
      location: selectedLocation
    })
      .then(setItems)
      .catch(err => {
        console.error('Failed to fetch items:', err);
        showToast(`❌ ${t('Failed to sync items from server')}`);
      });
  };

  // Load unfiltered items to compute total statistics persistently
  const fetchStatsItems = () => {
    if (!currentUser) return;
    api.getItems()
      .then(setStatsItems)
      .catch(err => console.error('Failed to fetch stats:', err));
  };

  // Try auto login from token on mount
  useEffect(() => {
    const token = sessionStorage.getItem('finder_jwt_token');
    if (token) {
      api.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          setCurrentRole(user.role);
        })
        .catch(err => {
          console.error('Auto login failed:', err);
          sessionStorage.removeItem('finder_jwt_token');
        });
    }
  }, []);

  // Sync role switch mock login session
  useEffect(() => {
    if (!currentUser || !currentRole) return;
    if (currentUser.role === currentRole) return; // avoid duplicate calls

    api.loginMock(currentRole)
      .then(data => {
        setCurrentUser(data.user);
        fetchItems();
        fetchStatsItems();
      })
      .catch(err => console.error('AD mock auth failed:', err));
  }, [currentRole]);

  // Re-fetch items dynamically when filters change
  useEffect(() => {
    if (currentUser) {
      fetchItems();
      fetchStatsItems();
    }
  }, [searchQuery, selectedCategory, typeFilter, statusFilter, selectedLocation, currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    showToast(`✓ ${t('Welcome to Finder Portal,')} ${user.name}!`);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('finder_jwt_token');
    setCurrentUser(null);
    setCurrentRole(null);
    showToast(t('Signed out of Active Directory session.'));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Handler: Add new item
  const handleAddItem = (newItemData) => {
    api.createItem(newItemData)
      .then(() => {
        fetchItems();
        fetchStatsItems();
        setIsReportModalOpen(false);
        showToast(`✓ ${newItemData.type === 'FOUND' ? t('New found item published!') : t('New lost report published!')}`);
      })
      .catch(err => showToast(`❌ ${t('Error:')} ${err.message}`));
  };

  // Handler: Submit claim
  const handleSubmitClaim = (itemId, claimData) => {
    api.submitClaim(itemId, claimData.proofDescription)
      .then(() => {
        fetchItems();
        fetchStatsItems();
        api.getItemById(itemId).then(setSelectedItem);
        showToast(`✓ ${t('Claim request submitted for teacher verification.')}`);
      })
      .catch(err => showToast(`❌ ${t('Error:')} ${err.message}`));
  };

  // Handler: Approve claim
  const handleApproveClaim = (itemId, claimId) => {
    api.reviewClaim(claimId, 'APPROVED')
      .then(() => {
        fetchItems();
        fetchStatsItems();
        api.getItemById(itemId).then(setSelectedItem);
        showToast(`✓ ${t('Claim approved! Item status set to CLAIMED.')}`);
      })
      .catch(err => showToast(`❌ ${t('Error:')} ${err.message}`));
  };

  // Handler: Reject claim
  const handleRejectClaim = (itemId, claimId) => {
    api.reviewClaim(claimId, 'REJECTED')
      .then(() => {
        fetchItems();
        fetchStatsItems();
        api.getItemById(itemId).then(setSelectedItem);
        showToast(t('Claim rejected.'));
      })
      .catch(err => showToast(`❌ ${t('Error:')} ${err.message}`));
  };

  // Handler: Update status
  const handleUpdateItemStatus = (itemId, newStatus) => {
    api.updateItem(itemId, { status: newStatus })
      .then(() => {
        fetchItems();
        fetchStatsItems();
        api.getItemById(itemId).then(setSelectedItem);
        showToast(`✓ ${t('Item status updated to')} ${t(newStatus)}`);
      })
      .catch(err => showToast(`❌ ${t('Error:')} ${err.message}`));
  };

  // Handler: Delete item
  const handleDeleteItem = (itemId) => {
    if (window.confirm(t('Are you sure you want to delete this listing? (Admin action)'))) {
      api.deleteItem(itemId)
        .then(() => {
          fetchItems();
          fetchStatsItems();
          setSelectedItem(null);
          showToast(t('Listing removed successfully.'));
        })
        .catch(err => showToast(`❌ ${t('Error:')} ${err.message}`));
    }
  };

  // Handler: Confirm AI Match
  const handleConfirmAiMatch = (lostId, foundId) => {
    // Find matching record from server if possible, or trigger local update
    api.getMatches()
      .then(matches => {
        const matchingRecord = matches.find(m => m.lostItemId === lostId && m.foundItemId === foundId);
        if (matchingRecord) {
          return api.reviewMatch(matchingRecord.id, 'CONFIRMED');
        } else {
          // If no generated match object exists yet, we update statuses manually
          return Promise.all([
            api.updateItem(lostId, { status: 'MATCHED' }),
            api.updateItem(foundId, { status: 'MATCHED' })
          ]);
        }
      })
      .then(() => {
        fetchItems();
        fetchStatsItems();
        showToast(`✓ ${t('AI Match confirmed! Both item statuses updated to MATCHED.')}`);
      })
      .catch(err => showToast(`❌ ${t('Match confirmation failed:')} ${err.message}`));
  };

  // Open Report Modal
  const handleOpenReportModal = (initialType = 'FOUND') => {
    setReportModalType(initialType);
    setIsReportModalOpen(true);
  };

  // Open Peer API with prefilled room
  const handleOpenPeerWithRoom = (roomLocation) => {
    setPeerInitialRoom(roomLocation);
    setActiveTab('peer');
  };

  // Filter items for feed
  const filteredItems = items.filter(item => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchTags = item.aiTags && item.aiTags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchLoc && !matchTags) return false;
    }

    // Category
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    // Type (FOUND / LOST)
    if (typeFilter !== 'ALL' && item.type !== typeFilter) {
      return false;
    }

    // Status
    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }

    // Location
    if (selectedLocation !== 'All Locations' && item.location !== selectedLocation) {
      return false;
    }

    return true;
  });

  if (!currentUser) {
    return (
      <div className="app-root" data-theme={theme}>
        {/* Ambient background glows */}
        <div className="ambient-glow">
          <div className="ambient-blob-1"></div>
          <div className="ambient-blob-2"></div>
        </div>
        <LoginPortal onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="toast-notification glass-card">
            <CheckCircle2 size={18} className="text-emerald" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-root" data-theme={theme}>
      {/* Ambient background glows */}
      <div className="ambient-glow">
        <div className="ambient-blob-1"></div>
        <div className="ambient-blob-2"></div>
        <div className="ambient-blob-3"></div>
      </div>

      <div className="app-layout">
        {/* แถบเมนูด้านซ้าย: เมนูหลัก + หมวดหมู่ + ตัวกรอง */}
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          allItems={statsItems}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="app-main-column">
          {/* แถบบน: ค้นหา + ปุ่มแจ้งของ + ธีม + บัญชีผู้ใช้ */}
          <Navbar
            currentRole={currentRole}
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenReportModal={handleOpenReportModal}
            theme={theme}
            setTheme={setTheme}
            onSignOut={handleSignOut}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Main Container */}
          <main className="app-container">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="toast-notification glass-card">
            <CheckCircle2 size={18} className="text-emerald" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View 1: Main Items Feed & Discovery Hub */}
        {activeTab === 'feed' && (
          <div className="feed-view-layout">
            <HeroBanner
              items={statsItems}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

            {/* Results Header */}
            <div className="feed-results-header">
              <div className="section-title-row">
                <span className="section-accent-bar"></span>
                <span className="section-title-text">
                  {selectedCategory === 'All' ? t('All items') : t(selectedCategory)}
                </span>
              </div>

              <div className="results-count">
                {t('Showing')} <strong>{filteredItems.length}</strong> {t('items across campus')}
              </div>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="empty-results-box glass-card">
                <Inbox size={48} className="text-muted mb-3" />
                <h3 className="empty-title">{t('No matching items found')}</h3>
                <p className="empty-desc">
                  {t('Try adjusting your search keywords, clear category filters, or be the first to report this item!')}
                </p>
                <div className="empty-action-buttons">
                  <button 
                    className="btn btn-cyan btn-sm"
                    onClick={() => handleOpenReportModal('FOUND')}
                  >
                    {t('Report Found Item')}
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleOpenReportModal('LOST')}
                  >
                    {t('Report Lost Item')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* View 2: Teacher & Admin Dashboard */}
        {activeTab === 'dashboard' && (
          <AdminDashboard 
            items={items}
            currentRole={currentRole}
            onApproveClaim={handleApproveClaim}
            onRejectClaim={handleRejectClaim}
            onUpdateItemStatus={handleUpdateItemStatus}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {/* View 3: AI Matcher Engine */}
        {activeTab === 'matcher' && (
          <AiMatcher 
            items={items}
            onConfirmMatch={handleConfirmAiMatch}
            onViewItem={(item) => setSelectedItem(item)}
          />
        )}

        {/* View 4: SpaceReserve Peer API Explorer */}
        {activeTab === 'peer' && (
          <PeerApiExplorer 
            items={items}
            initialLocation={peerInitialRoom}
          />
        )}

        {/* View 5: Student Claims Tracker */}
        {activeTab === 'claims' && (
          <StudentClaimsView 
            onViewItem={(item) => setSelectedItem(item)}
          />
        )}

        {/* View 6: Settings panel */}
        {activeTab === 'settings' && (
          <SettingsView 
            currentUser={currentUser}
            onProfileUpdated={(updatedUser) => {
              setCurrentUser(updatedUser);
              showToast(`✓ ${t('Profile settings updated!')}`);
            }}
            theme={theme}
            setTheme={setTheme}
            onSignOut={handleSignOut}
          />
        )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          currentUser={currentUser}
          currentRole={currentRole}
          onSubmitClaim={handleSubmitClaim}
          onUpdateStatus={handleUpdateItemStatus}
          onOpenPeerWithRoom={handleOpenPeerWithRoom}
        />
      )}

      {isReportModalOpen && (
        <ReportModal 
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          initialType={reportModalType}
          currentUser={currentUser}
          onSubmitItem={handleAddItem}
        />
      )}

      {isProfileModalOpen && (
        <CustomizeProfileModal 
          currentUser={currentUser} 
          onClose={() => setIsProfileModalOpen(false)} 
          onProfileUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
          }}
        />
      )}
    </div>
  );
}
