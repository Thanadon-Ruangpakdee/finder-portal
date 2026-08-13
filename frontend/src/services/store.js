// =========================================================
// Finder Portal - State Management & Mock Database
// =========================================================

export const USER_ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN'
};

export const MOCK_USERS = {
  STUDENT: {
    id: 'u-101',
    name: 'Thanadon Ruangpakdee',
    email: 'thanadon.r@student.uni.edu',
    adObjectId: 'ad-std-6610308',
    role: USER_ROLES.STUDENT,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science'
  },
  TEACHER: {
    id: 'u-102',
    name: 'Somchai Prasert (Teacher / Security Officer)',
    email: 'somchai.p@security.uni.edu',
    adObjectId: 'ad-stf-882901',
    role: USER_ROLES.TEACHER,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Faculty of Science'
  },
  ADMIN: {
    id: 'u-103',
    name: 'Dr. Chayapol Moemeng (System Admin)',
    email: 'chayapol.m@admin.uni.edu',
    adObjectId: 'ad-adm-00109',
    role: USER_ROLES.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'IT Infrastructure & Operations'
  }
};

export const ITEM_CATEGORIES = [
  'All',
  'Electronics',
  'Wallets & Bags',
  'IDs & Cards',
  'Keys',
  'Bottles & Tumblers',
  'Books & Documents',
  'Accessories'
];

export const INITIAL_ITEMS = [
  {
    id: 'item-01',
    type: 'FOUND',
    title: 'Apple MacBook Pro 14" (Space Gray)',
    description: 'Found on the 4th desk in Room 402 after afternoon CS lecture. Has a GitHub sticker on the cover.',
    category: 'Electronics',
    location: 'Room 402 (Engineering Building)',
    date: '2026-08-11T14:30:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    status: 'OPEN',
    reportedBy: {
      id: 'u-102',
      name: 'Somchai Prasert (Security Desk)',
      email: 'somchai.p@security.uni.edu'
    },
    aiTags: ['Apple', 'Laptop', 'Space Gray', 'MacBook', 'Electronics'],
    claims: [
      {
        id: 'claim-101',
        userId: 'u-101',
        userName: 'Thanadon Ruangpakdee',
        userEmail: 'thanadon.r@student.uni.edu',
        proofDescription: 'Serial number ends with 9X41. Password lock screen has a wallpaper of a mountain landscape.',
        status: 'PENDING',
        createdAt: '2026-08-11T16:00:00Z'
      }
    ]
  },
  {
    id: 'item-02',
    type: 'FOUND',
    title: 'Sony WH-1000XM4 Noise Canceling Headphones',
    description: 'Found inside a black zipper case left on the study bench near the 3rd-floor silent zone.',
    category: 'Electronics',
    location: 'Central Library (3rd Floor)',
    date: '2026-08-12T09:15:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    status: 'OPEN',
    reportedBy: {
      id: 'u-101',
      name: 'Thanadon Ruangpakdee',
      email: 'thanadon.r@student.uni.edu'
    },
    aiTags: ['Sony', 'Headphones', 'Black', 'Audio', 'Bluetooth'],
    claims: []
  },
  {
    id: 'item-03',
    type: 'LOST',
    title: 'Brown Leather Bifold Wallet with Student ID',
    description: 'Lost my Timberland brown wallet containing student ID card (Kitirat P.) and campus BTS pass.',
    category: 'Wallets & Bags',
    location: 'Campus Cafeteria (Building 1)',
    date: '2026-08-10T12:45:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    status: 'OPEN',
    reportedBy: {
      id: 'u-104',
      name: 'Kitirat Pisithaporn',
      email: 'kitirat.p@student.uni.edu'
    },
    aiTags: ['Wallet', 'Brown', 'Leather', 'Timberland'],
    claims: []
  },
  {
    id: 'item-04',
    type: 'FOUND',
    title: 'Set of 3 Keys with blue BMW Keychain & Dorm Tag',
    description: 'Found on the staircase between 2nd and 3rd floor. Has room number 304 marked on the blue tag.',
    category: 'Keys',
    location: 'Science Building Staircase',
    date: '2026-08-09T18:00:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
    status: 'CLAIMED',
    reportedBy: {
      id: 'u-102',
      name: 'Somchai Prasert (Security Desk)',
      email: 'somchai.p@security.uni.edu'
    },
    aiTags: ['Keys', 'BMW', 'Keychain', 'Dorm Key'],
    claims: [
      {
        id: 'claim-102',
        userId: 'u-105',
        userName: 'Thanakrit Kodklangdon',
        userEmail: 'thanakrit.k@student.uni.edu',
        proofDescription: 'One key has a small gold chip and the keychain has a miniature leather BMW badge.',
        status: 'APPROVED',
        reviewedBy: 'Somchai Prasert',
        createdAt: '2026-08-09T19:30:00Z'
      }
    ]
  },
  {
    id: 'item-05',
    type: 'FOUND',
    title: 'HydroFlask 32oz Water Bottle (Olive Green)',
    description: 'Left behind in Music Practice Room 2B after ensemble rehearsal.',
    category: 'Bottles & Tumblers',
    location: 'Library Room 4B / Music Practice Lab',
    date: '2026-08-12T11:00:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    status: 'OPEN',
    reportedBy: {
      id: 'u-102',
      name: 'Somchai Prasert (Security Desk)',
      email: 'somchai.p@security.uni.edu'
    },
    aiTags: ['HydroFlask', 'Water Bottle', 'Olive Green', 'Drinkware'],
    claims: []
  },
  {
    id: 'item-06',
    type: 'FOUND',
    title: 'Vintage Brown Leather Wallet',
    description: 'Turned in by cafeteria cleaner. Found under table #12 at lunchtime.',
    category: 'Wallets & Bags',
    location: 'Campus Cafeteria (Building 1)',
    date: '2026-08-10T13:30:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    status: 'OPEN',
    reportedBy: {
      id: 'u-102',
      name: 'Somchai Prasert (Security Desk)',
      email: 'somchai.p@security.uni.edu'
    },
    aiTags: ['Wallet', 'Brown', 'Leather', 'Cafeteria'],
    claims: []
  }
];

// Helper to get stored items
export const getStoredItems = () => {
  const data = localStorage.getItem('finder_portal_items');
  if (!data) {
    localStorage.setItem('finder_portal_items', JSON.stringify(INITIAL_ITEMS));
    return INITIAL_ITEMS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ITEMS;
  }
};

// Helper to save items
export const saveStoredItems = (items) => {
  localStorage.setItem('finder_portal_items', JSON.stringify(items));
};

// Simulated Gemini AI Visual & Text Analyzer
export const simulateGeminiAiAnalysis = async (titleOrDescription) => {
  await new Promise((res) => setTimeout(res, 800));

  const text = (titleOrDescription || '').toLowerCase();
  
  if (text.includes('macbook') || text.includes('laptop') || text.includes('computer') || text.includes('dell') || text.includes('ipad') || text.includes('tablet')) {
    return {
      category: 'Electronics',
      suggestedTitle: text.includes('ipad') ? 'Apple iPad Air' : 'Apple MacBook Pro Laptop',
      confidence: 0.96,
      tags: ['Electronics', 'Apple', 'Laptop', 'Computers', 'High-Value']
    };
  } else if (text.includes('headphone') || text.includes('earphone') || text.includes('airpod') || text.includes('sony') || text.includes('audio')) {
    return {
      category: 'Electronics',
      suggestedTitle: text.includes('airpod') ? 'Apple AirPods Pro Wireless Earbuds' : 'Wireless Noise-Canceling Headphones',
      confidence: 0.94,
      tags: ['Audio', 'Headphones', 'Bluetooth', 'Electronics']
    };
  } else if (text.includes('wallet') || text.includes('bag') || text.includes('backpack') || text.includes('purse') || text.includes('pouch')) {
    return {
      category: 'Wallets & Bags',
      suggestedTitle: text.includes('backpack') ? 'Campus Travel Backpack' : 'Leather Wallet / Personal Bag',
      confidence: 0.93,
      tags: ['Wallet', 'Personal Items', 'Cards', 'Accessories']
    };
  } else if (text.includes('id') || text.includes('card') || text.includes('license') || text.includes('passport')) {
    return {
      category: 'IDs & Cards',
      suggestedTitle: 'University Student Identification Card',
      confidence: 0.98,
      tags: ['Student ID', 'Credentials', 'Campus Pass']
    };
  } else if (text.includes('key') || text.includes('keychain') || text.includes('car')) {
    return {
      category: 'Keys',
      suggestedTitle: 'Keychain with Multiple Keys',
      confidence: 0.95,
      tags: ['Keys', 'Access', 'Keychain', 'Dorm Key']
    };
  } else if (text.includes('bottle') || text.includes('flask') || text.includes('tumbler') || text.includes('cup')) {
    return {
      category: 'Bottles & Tumblers',
      suggestedTitle: 'Insulated Stainless Steel Water Bottle',
      confidence: 0.92,
      tags: ['Drinkware', 'Bottle', 'Hydration']
    };
  } else if (text.includes('book') || text.includes('notebook') || text.includes('calculator') || text.includes('document')) {
    return {
      category: 'Books & Documents',
      suggestedTitle: 'Study Textbook / Academic Notes',
      confidence: 0.90,
      tags: ['Books', 'Education', 'Notes']
    };
  }

  return {
    category: 'Accessories',
    suggestedTitle: 'Personal Belonging',
    confidence: 0.86,
    tags: ['General Item', 'Campus Property']
  };
};

// AI Matching Algorithm: Calculates cosine/token similarity between LOST reports and FOUND items
export const findAiPotentialMatches = (items) => {
  const lostItems = items.filter(i => i.type === 'LOST' && i.status !== 'CLAIMED');
  const foundItems = items.filter(i => i.type === 'FOUND' && i.status !== 'CLAIMED');

  const matches = [];

  lostItems.forEach(lost => {
    foundItems.forEach(found => {
      let score = 0;

      // Category match
      if (lost.category === found.category) score += 40;

      // Location match
      if (lost.location.toLowerCase() === found.location.toLowerCase()) {
        score += 30;
      } else if (
        lost.location.toLowerCase().includes('cafeteria') && found.location.toLowerCase().includes('cafeteria') ||
        lost.location.toLowerCase().includes('library') && found.location.toLowerCase().includes('library') ||
        lost.location.toLowerCase().includes('402') && found.location.toLowerCase().includes('402')
      ) {
        score += 20;
      }

      // Title & Keyword tokens overlap
      const lostWords = (lost.title + ' ' + lost.description).toLowerCase().split(/\s+/);
      const foundWords = (found.title + ' ' + found.description).toLowerCase().split(/\s+/);
      
      const commonWords = lostWords.filter(w => w.length > 3 && foundWords.includes(w));
      score += Math.min(commonWords.length * 10, 30);

      if (score >= 45) {
        matches.push({
          matchId: `match-${lost.id}-${found.id}`,
          similarityPercentage: Math.min(score, 97),
          lostItem: lost,
          foundItem: found,
          commonAttributes: commonWords.slice(0, 4),
          status: (lost.status === 'MATCHED' || found.status === 'MATCHED') ? 'CONFIRMED' : 'PENDING_REVIEW'
        });
      }
    });
  });

  return matches.sort((a, b) => b.similarityPercentage - a.similarityPercentage);
};

// Simulated SpaceReserve API responses
export const MOCK_SPACERESERVE_BOOKINGS = {
  'Room 402 (Engineering Building)': {
    bookingId: 'SR-BK-8821',
    roomName: 'Room 402 (Engineering Building)',
    scheduledEvent: 'CSX4110 Backend Application Development Lecture',
    bookedBy: 'Dr. Chayapol Moemeng',
    bookerEmail: 'chayapol.m@admin.uni.edu',
    section: 'Section 542',
    capacity: 60,
    startTime: '2026-08-11 13:00',
    endTime: '2026-08-11 16:00',
    status: 'ACTIVE'
  },
  'Library Room 4B / Music Practice Lab': {
    bookingId: 'SR-BK-9104',
    roomName: 'Library Room 4B (Study Lab)',
    scheduledEvent: 'Group Study & Code Review Session',
    bookedBy: 'Ratchanon P. (SpaceReserve Team)',
    bookerEmail: 'ratchanon.p@student.uni.edu',
    section: 'Section 542',
    capacity: 6,
    startTime: '2026-08-12 10:00',
    endTime: '2026-08-12 12:30',
    status: 'ACTIVE'
  },
  'Central Library (3rd Floor)': {
    bookingId: 'SR-BK-7703',
    roomName: 'Library Silent Study Pod 3',
    scheduledEvent: 'Independent Research',
    bookedBy: 'Warachai A. (SpaceReserve Team)',
    bookerEmail: 'warachai.a@student.uni.edu',
    section: 'Section 542',
    capacity: 2,
    startTime: '2026-08-12 08:30',
    endTime: '2026-08-12 11:30',
    status: 'COMPLETED'
  },
  'Campus Cafeteria (Building 1)': {
    bookingId: 'SR-BK-6612',
    roomName: 'Cafeteria Event Stage & Table Area',
    scheduledEvent: 'Student Union Lunch Social',
    bookedBy: 'Kitirat Pisithaporn',
    bookerEmail: 'kitirat.p@student.uni.edu',
    section: 'Section 542',
    capacity: 120,
    startTime: '2026-08-10 12:00',
    endTime: '2026-08-10 14:00',
    status: 'COMPLETED'
  }
};
