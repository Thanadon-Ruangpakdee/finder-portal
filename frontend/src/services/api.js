const API_BASE_URL = 'http://localhost:5001/api/v1';

// Helper to attach authorization header
function getAuthHeaders() {
  const token = sessionStorage.getItem('finder_jwt_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Maps backend schema (imageUrl, aiTags as string) to frontend schema (photoUrl, aiTags as array)
function mapItemResponse(item) {
  if (!item) return null;
  let tagsArray = [];
  if (Array.isArray(item.aiTags)) {
    tagsArray = item.aiTags;
  } else if (typeof item.aiTags === 'string') {
    tagsArray = item.aiTags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return {
    ...item,
    photoUrl: item.imageUrl || item.photoUrl || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80',
    aiTags: tagsArray
  };
}

export const api = {
  // Login / Auth Simulation
  async loginMock(role) {
    const response = await fetch(`${API_BASE_URL}/auth/login-mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await response.json();
    sessionStorage.setItem('finder_jwt_token', data.token);
    return data; // { token, user }
  },

  async loginAd({ email, name, role, avatar }) {
    const response = await fetch(`${API_BASE_URL}/auth/login-ad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role, avatar })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Authentication failed');
    }
    const data = await response.json();
    sessionStorage.setItem('finder_jwt_token', data.token);
    return data; // { token, user }
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  // Items Operations
  async getItems(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.type && filters.type !== 'ALL') queryParams.append('type', filters.type);
    if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
    if (filters.location && filters.location !== 'All Locations') queryParams.append('location', filters.location);
    if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);

    const response = await fetch(`${API_BASE_URL}/items?${queryParams.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch items');
    const data = await response.json();
    return data.map(mapItemResponse);
  },

  async getItemById(id) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch item details');
    const item = await response.json();
    return mapItemResponse(item);
  },

  async createItem(itemData) {
    // Map photoUrl to imageUrl for backend DB storage
    const payload = {
      title: itemData.title,
      description: itemData.description,
      location: itemData.location,
      type: itemData.type,
      category: itemData.category,
      imageUrl: itemData.photoUrl,
      imagePreset: itemData.imagePreset
    };

    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create item');
    }
    const item = await response.json();
    return mapItemResponse(item);
  },

  async updateItem(id, updateData) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update item');
    const item = await response.json();
    return mapItemResponse(item);
  },

  async deleteItem(id) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return response.json();
  },

  // Claims Operations
  async getClaims(status = '') {
    const url = status ? `${API_BASE_URL}/claims?status=${status}` : `${API_BASE_URL}/claims`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch claims');
    const claims = await response.json();
    return claims.map(claim => ({
      ...claim,
      item: mapItemResponse(claim.item)
    }));
  },

  async submitClaim(itemId, proofText) {
    const response = await fetch(`${API_BASE_URL}/claims`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itemId, proofText })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to submit claim');
    }
    return response.json();
  },

  async reviewClaim(claimId, action) {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action }) // APPROVED or REJECTED
    });
    if (!response.ok) throw new Error('Failed to submit review');
    return response.json();
  },

  // AI Matching Operations
  async getMatches() {
    const response = await fetch(`${API_BASE_URL}/matches`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch matches');
    const matches = await response.json();
    return matches.map(match => ({
      ...match,
      lostItem: mapItemResponse(match.lostItem),
      foundItem: mapItemResponse(match.foundItem)
    }));
  },

  async reviewMatch(matchId, action) {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action }) // CONFIRMED or REJECTED
    });
    if (!response.ok) throw new Error('Failed to confirm match');
    return response.json();
  },

  // Peer API Operations
  async checkPeerBookings(location, timestamp) {
    const response = await fetch(`${API_BASE_URL}/peer/check-bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ location, timestamp })
    });
    if (!response.ok) throw new Error('Failed to check bookings');
    return response.json();
  },

  // User Management Operations (Admin Only)
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch users directory');
    return response.json();
  },

  async updateUserRole(userId, role) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return response.json();
  },

  async updateProfile(name, avatar) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, avatar })
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }
};
