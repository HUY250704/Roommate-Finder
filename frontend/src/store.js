import { create } from 'zustand';

const initialUsers = [
  {
    id: 'minh',
    name: 'Minh',
    age: 24,
    email: 'minh@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    status: 'active',
    gender: 'Male',
    phone: '0912345678',
    occupation: 'Student at University of Technology',
    cleanHabit: 'High Standard',
    intro: "Hey! I'm looking for a chill roommate near the university. I spend most of my weekdays studying or at my part-time job. On weekends, I enjoy cooking and having a quiet movie night. Ideally looking for someone who respects quiet hours but is also down to grab coffee sometimes. I'm pretty clean and prefer to keep the common areas tidy.",
    matchScore: 94,
    matchReason: "Based on 4 shared preferences",
    sleepSchedule: "Usually by 23:00",
    pets: "Love dogs",
    smoking: "No smoking",
    preferences: ["Budget", "Location", "Non-smoking"]
  },
  {
    id: 'sarah',
    name: 'Sarah J.',
    age: 24,
    email: 'sarah@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'active',
    gender: 'Female',
    phone: '0987654321',
    occupation: 'Graphic Designer',
    cleanHabit: 'Moderate',
    intro: "I love pets, morning coffee, and painting. Looking for a neat space near downtown core.",
    matchScore: 92,
    matchReason: "Based on 3 shared preferences",
    sleepSchedule: "Early Bird",
    pets: "Pet Friendly",
    smoking: "No Smoking",
    preferences: ["Location", "Non-smoking", "Pet Friendly"]
  },
  {
    id: 'david',
    name: 'David M.',
    age: 27,
    email: 'david@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'active',
    gender: 'Male',
    phone: '0905556677',
    occupation: 'Software Engineer',
    cleanHabit: 'High Standard',
    intro: "Tech enthusiast, WFH developer, looking for a roommate to share an apartment in Westside.",
    matchScore: 85,
    matchReason: "Based on 2 shared preferences",
    sleepSchedule: "Night Owl",
    pets: "No Pets",
    smoking: "No smoking",
    preferences: ["Location", "Non-smoking"]
  },
  {
    id: 'admin',
    name: 'System Admin',
    email: 'admin@roommate.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    status: 'active'
  }
];

const initialRooms = [
  {
    id: 'haichau',
    title: 'Available Now - Modern Studio in Hai Chau',
    price: 3000000,
    location: 'Hai Chau District, Da Nang',
    type: 'Private Studio',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    ownerId: 'minh',
    description: 'Enjoy living in this beautifully designed modern studio located in the heart of Hai Chau. Perfect for young professionals or students looking for a quiet yet central location. The room is fully furnished with a comfortable bed, study desk, and an en-suite bathroom. Natural light floods the room through a large window overlooking the quiet neighborhood street.',
    address: '123 Tran Phu, Hai Chau, Da Nang',
    bedrooms: 1,
    bathrooms: 1,
    area: 32,
    verified: true,
    status: 'available',
    createdAt: '2026-08-15'
  },
  {
    id: 'sontra',
    title: 'Sunny Master Bedroom near My Khe Beach',
    price: 4500000,
    location: 'Son Tra District, Da Nang',
    type: 'Shared Apartment',
    image: 'https://images.unsplash.com/photo-1502005229762-ae1b46000e58?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1502005229762-ae1b46000e58?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    ownerId: 'david',
    description: 'A spacious and sunny master bedroom in a 3-bedroom luxury apartment, just 5 minutes walk to My Khe Beach. Includes private balcony, king bed, AC, and high-speed fiber internet. Building has a rooftop pool and gym.',
    address: '45 Vo Nguyen Giap, Son Tra, Da Nang',
    bedrooms: 1,
    bathrooms: 1,
    area: 40,
    verified: true,
    status: 'available',
    createdAt: '2026-08-20'
  }
];

const initialRequests = [
  {
    id: '1',
    userId: 'sarah',
    title: 'Looking for a female roommate in Hai Chau',
    budget: 3500000,
    location: 'Hai Chau, Da Nang',
    gender: 'Female',
    description: 'Looking to rent a 2-bedroom apartment together. Clean, respectful, non-smoker.',
    status: 'active',
    createdAt: '2026-08-22'
  }
];

const initialReports = [
  {
    id: '1',
    reporterId: 'sarah',
    targetType: 'room',
    targetId: 'haichau',
    targetTitle: 'Modern Studio in Hai Chau',
    reason: 'Incorrect price listed',
    description: 'Landlord asked for higher deposit than advertised.',
    status: 'pending',
    createdAt: '2026-08-25'
  }
];

const initialMessages = [
  { id: '1', senderId: 'sarah', receiverId: 'minh', text: 'Hi Minh! Is the studio still available?', timestamp: '2026-08-26T10:30:00.000Z' },
  { id: '2', senderId: 'minh', receiverId: 'sarah', text: 'Hey Sarah! Yes, it is. Are you free this weekend for a viewing?', timestamp: '2026-08-26T10:35:00.000Z' }
];

const initialViewings = [
  { id: '1', roomId: 'haichau', userId: 'sarah', date: '2026-08-30', time: '14:30', status: 'scheduled' }
];

export const useStore = create((set) => ({
  language: localStorage.getItem('language') || 'vi',
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
  currentUser: initialUsers[1], // default logged in as Sarah
  users: initialUsers,
  rooms: initialRooms,
  requests: initialRequests,
  reports: initialReports,
  messages: initialMessages,
  viewings: initialViewings,
  favorites: ['haichau'],

  loginWithGoogle: async (googleData) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleData)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.token) localStorage.setItem('token', data.token);
        const user = {
          ...data,
          id: data._id || data.id,
          name: data.username || data.name || googleData.name || "Google User",
          avatar: data.avatar || googleData.avatar || googleData.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          status: "active"
        };
        set({ currentUser: user });
        return { success: true, role: user.role || "user" };
      }
    } catch (e) {
      console.warn("Backend auth failed, using Google local session", e);
    }

    const emailLower = (googleData.email || "googleuser@gmail.com").toLowerCase().trim();
    const nickname = googleData.name || emailLower.split("@")[0];
    const googleUser = {
      id: googleData.googleId || "google_" + Date.now(),
      name: nickname,
      email: emailLower,
      role: "user",
      avatar: googleData.avatar || googleData.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      status: "active",
      authProvider: "google",
      gender: "Male",
      phone: "0900000000",
      occupation: "Member",
      cleanHabit: "High Standard",
      intro: "Signed in with Google.",
      matchScore: 95
    };
    set({ currentUser: googleUser });
    return { success: true, role: "user" };
  },

  loginWithFirebase: async (firebaseData) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: firebaseData.uid,
          email: firebaseData.email,
          displayName: firebaseData.displayName || firebaseData.name,
          photoURL: firebaseData.photoURL || firebaseData.avatar,
          idToken: firebaseData.idToken,
          providerId: firebaseData.providerId || "firebase"
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) localStorage.setItem('token', data.token);
        const user = {
          ...data,
          id: data._id || data.id,
          name: data.username || data.name || firebaseData.displayName || "Firebase User",
          avatar: data.avatar || firebaseData.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          status: "active"
        };
        set({ currentUser: user });
        return { success: true, role: user.role || "user" };
      }
    } catch (e) {
      console.warn("Backend auth failed, using Firebase client session", e);
    }

    const emailLower = (firebaseData.email || "firebaseuser@gmail.com").toLowerCase().trim();
    const nickname = firebaseData.displayName || firebaseData.name || emailLower.split("@")[0];
    const firebaseUser = {
      id: firebaseData.uid || "firebase_" + Date.now(),
      name: nickname,
      email: emailLower,
      role: "user",
      avatar: firebaseData.photoURL || firebaseData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      status: "active",
      authProvider: firebaseData.providerId || "firebase",
      gender: "Male",
      phone: "0900000000",
      occupation: "Member",
      cleanHabit: "High Standard",
      intro: "Signed in with Firebase Authentication.",
      matchScore: 95
    };
    set({ currentUser: firebaseUser });
    return { success: true, role: "user" };
  },

  login: async (email, password) => {
    const emailLower = email.toLowerCase().trim();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLower, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        const user = {
          ...data,
          id: data._id || data.id || (emailLower === 'admin@roommate.com' ? 'admin' : emailLower.split('@')[0]),
          name: data.username || data.name || emailLower.split('@')[0],
          email: data.email || emailLower,
          role: data.role || (emailLower === 'admin@roommate.com' ? 'admin' : 'user'),
          avatar: data.avatar || (emailLower === 'admin@roommate.com' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
          status: 'active'
        };
        set({ currentUser: user });
        return { success: true, role: user.role };
      } else {
        // Fallback for demo accounts if DB is initializing or offline
        if (emailLower === 'admin@roommate.com' || emailLower === 'sarah@example.com' || emailLower.includes('@example.com')) {
          const isDemoAdmin = emailLower === 'admin@roommate.com';
          const user = {
            id: isDemoAdmin ? 'admin' : 'sarah',
            name: isDemoAdmin ? 'System Admin' : 'Sarah J.',
            email: emailLower,
            role: isDemoAdmin ? 'admin' : 'user',
            avatar: isDemoAdmin ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            status: 'active'
          };
          set({ currentUser: user });
          return { success: true, role: user.role };
        }

        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.message || 'Email hoặc mật khẩu không chính xác (401)' };
      }
    } catch (e) {
      console.warn("Backend auth failed, using local session fallback", e);
      const isDemoAdmin = emailLower === 'admin@roommate.com';
      const user = {
        id: isDemoAdmin ? 'admin' : emailLower.split('@')[0],
        name: isDemoAdmin ? 'System Admin' : emailLower.split('@')[0],
        email: emailLower,
        role: isDemoAdmin ? 'admin' : 'user',
        avatar: isDemoAdmin ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        status: 'active'
      };
      set({ currentUser: user });
      return { success: true, role: user.role };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ currentUser: null });
  },

  addRoom: (room) => set(state => ({
    rooms: [...state.rooms, { ...room, id: String(state.rooms.length + 1), status: 'pending', createdAt: new Date().toISOString().split('T')[0] }]
  })),

  toggleFavorite: (roomId) => set(state => {
    const isFav = state.favorites.includes(roomId);
    const favorites = isFav 
      ? state.favorites.filter(id => id !== roomId)
      : [...state.favorites, roomId];
    return { favorites };
  }),

  sendMessage: (receiverId, text) => set(state => ({
    messages: [...state.messages, {
      id: String(state.messages.length + 1),
      senderId: state.currentUser?.id || 'sarah',
      receiverId,
      text,
      timestamp: new Date().toISOString()
    }]
  })),

  addRequest: (req) => set(state => ({
    requests: [...state.requests, { ...req, id: String(state.requests.length + 1), userId: state.currentUser?.id || 'sarah', status: 'active' }]
  })),

  scheduleViewing: (viewing) => set(state => ({
    viewings: [...state.viewings, { ...viewing, id: String(state.viewings.length + 1), status: 'scheduled' }]
  })),

  updateUserStatus: (userId, status) => set(state => ({
    users: state.users.map(u => u.id === userId ? { ...u, status } : u)
  })),

  updateRoomStatus: (roomId, status) => set(state => ({
    rooms: state.rooms.map(r => r.id === roomId ? { ...r, status } : r)
  })),

  resolveReport: (reportId) => set(state => ({
    reports: state.reports.map(rep => rep.id === reportId ? { ...rep, status: 'resolved' } : rep)
  })),

  deleteRoom: (roomId) => set(state => ({
    rooms: state.rooms.filter(r => r.id !== roomId)
  })),

  deleteRequest: (requestId) => set(state => ({
    requests: state.requests.filter(r => r.id !== requestId)
  }))
}));
