import { create } from 'zustand';

const initialUsers = [
  {
    id: 'minh',
    name: 'Minh',
    age: 24,
    email: 'minh@example.com',
    role: 'user',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW5tXAl29HfLPgJzezpubAmN60dyoEReg0lrpGTvaY6rG4UhV6uOgId7Pan-Kiof5Yr8OmzRf_xNF7NaCs0ZU2zxopGnPKuCswUWKob9LxYT3cKw7KdFuABoZQPvrg0GqXIKdLj4Jk2t4fgBnIT3liWZ5ItXuvtJuBw_5Cn-7zUg8nDA9W1o30g_F3h7F_r7kUuQKDds2C-clINixwEqHyxovo4eIXuvZR3xZMxZ1TWN1ywSodwwg',
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
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuVa8j942YG0i667QhZ9TjefRxPYJGdCQmz3O9FMH7eWqEtq2wK6bdJcWHX7XDzKFcGUGeYsVtwkfM3qGNBXaHc87MxqPsWCAb3SKv-QP9HxipyZ-v9xbQiXIBM592cJAMM8JrKFHTA4rVf5Qag6UT8D8ItanO6XRtp0h49MHy1AEm42itLicNyytRTPOyj90sO4iKbu7ueJUP9GQs-BYDnhocVGg5w3wM1YCxOXaSCrPOkq-lKAY',
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
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5rm5OI-opWr5IMmYm0ZkwX7QOZpadvDZRQjnzhN494BSKFwcQcXyqp4f9FU-VsvMrxvIMV9qM5WEIpn81Fh6rB_aXXji7AhLzxh8MEXxMjNLlHZprv2Lz450V5cjd1HsPLxwBmwlgVREm5iQUqXVj6FzQ85JaXaWkArfMP4kUXn9BAfJMqAL3axx-6v61m5t7qGnRNysFL9A_7jkmWtpTiiUDy9a1x7gYVwBNSCW0yYA0zhVaXSw',
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgISmhhNbYdxddOJanGAKAPZl8aNTimA_6veZMbW3-ApQ-51LNUPMo0pHRasB90ai1SXW0bNbEDK3PoAS0MKHqIquHT4J60JHalmulE31H7AoUORtgt6iAOLeI_Wo6JtkHsfDjz33x77aCDZCDwIdFgP8Tqp7Wt-5Y-AU155Xlvg8DHQdDZYGOGtu0lWDQrbMnvjMBeCvifp771fUSpy2M7nWDogGK_LQdVb1NC0dpuIHXLXQxeac',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgISmhhNbYdxddOJanGAKAPZl8aNTimA_6veZMbW3-ApQ-51LNUPMo0pHRasB90ai1SXW0bNbEDK3PoAS0MKHqIquHT4J60JHalmulE31H7AoUORtgt6iAOLeI_Wo6JtkHsfDjz33x77aCDZCDwIdFgP8Tqp7Wt-5Y-AU155Xlvg8DHQdDZYGOGtu0lWDQrbMnvjMBeCvifp771fUSpy2M7nWDogGK_LQdVb1NC0dpuIHXLXQxeac',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUY90f9rBaxQa10tswZs4G-kf_IktyqBWK34kLUf1QdJYl1KJQhkIado7w-T2b-pBU1s0RShJ-TShRonkp5qCLRFu-ogYYJcRgTUQRTBikbrefcpyYOsZQwZhNQqx8IdYptwLUPeMRnhvD05j4Xz_Q735PhB5u7GT_nT8w7o2CNLAJmgBEGOsk5VHUMmV39n2xbuUrLyRLiufzd4dx8JVPDsKlp6wqYmB5cXEk31Ldw_to3BPgwDw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_hwMofla8f5C4tXS7mL1zT2_xu4lSDbYi04yujeqBBqlK6MW0YMiglxfVGEG-2bUmR6_9gQb7pUHY83teOlbCgXQ_T26Ilv0gV7QWcnkcJ7_y7aDrbx8nfxZBKcl2sMgml6xgwP7vYu_ovCtFxT2DGsoortSrlVq0AtuYYcFt625M2xqcq2TtJj77VUYJvKHgNaOQxMna1EJ_mFvGqMojIA6C10qzWZAOsV0OmA4MVOwJgZdTnaw'
    ],
    ownerId: 'minh',
    description: 'Enjoy living in this beautifully designed modern studio located in the heart of Hai Chau. Perfect for young professionals or students looking for a quiet yet central location. The room is fully furnished with a comfortable bed, study desk, and an en-suite bathroom. Natural light floods the space during the day, creating a warm and inviting atmosphere.',
    status: 'approved',
    createdAt: '2026-08-25',
    verified: true,
    size: 25,
    beds: 1,
    baths: 2,
    amenities: [
      { name: 'High-speed WiFi', icon: 'wifi' },
      { name: 'Air Conditioning', icon: 'ac_unit' },
      { name: 'Secure Parking', icon: 'local_parking' },
      { name: 'Shared Kitchen', icon: 'kitchen' },
      { name: 'Washing Machine', icon: 'local_laundry_service' }
    ],
    rules: [
      { name: 'No Smoking', icon: 'smoking_rooms' },
      { name: 'No Pets', icon: 'pets' },
      { name: 'Quiet hours 10 PM - 6 AM', icon: 'volume_off' }
    ]
  },
  {
    id: 'landmark81',
    title: 'Spacious Room with view near Landmark 81',
    price: 6000000,
    location: 'Binh Thanh District, HCMC',
    type: 'Entire Apartment',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
    gallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
    ],
    ownerId: 'david',
    description: 'Stunning view, swimming pool access, full kitchen setup.',
    status: 'approved',
    createdAt: '2026-08-22',
    verified: true,
    size: 45,
    beds: 2,
    baths: 2,
    amenities: [
      { name: 'High-speed WiFi', icon: 'wifi' },
      { name: 'Air Conditioning', icon: 'ac_unit' },
      { name: 'Pool', icon: 'pool' }
    ],
    rules: [
      { name: 'No Smoking', icon: 'smoking_rooms' }
    ]
  }
];

const initialRequests = [
  { id: '1', userId: 'minh', title: 'Looking for roommate in District 1', budget: 5000000, location: 'District 1', status: 'active', description: 'Seeking quiet roommate, non-smoker, clean.' },
  { id: '2', userId: 'david', title: 'Need team-up roommate for Westside apartment', budget: 7000000, location: 'Westside', status: 'active', description: 'Tech worker preferred. Friendly and communicative.' }
];

const initialReports = [
  { id: '1', reportedBy: 'David M.', reportedUser: 'Minh', reason: 'Spamming requests.', status: 'pending', createdAt: '2026-08-25' }
];

const initialMessages = [
  { id: '1', senderId: 'minh', receiverId: 'sarah', text: "Hey! I saw you're also looking at the place in Downtown. The layout looks perfect.", timestamp: '2026-08-26T10:42:00.000Z' },
  { id: '2', senderId: 'sarah', receiverId: 'minh', text: "Hi Minh! Yes, I love the massive windows. Do you know if they allow small dogs? ??", timestamp: '2026-08-26T10:45:00.000Z' },
  { id: '3', senderId: 'minh', receiverId: 'sarah', text: "I think so! I took a screenshot from their pet policy page just to be sure.", timestamp: '2026-08-26T10:48:00.000Z' }
];

const initialViewings = [
  { id: '1', roomId: 'haichau', userId: 'sarah', date: '2026-08-30', time: '14:30', status: 'scheduled' }
];

export const useStore = create((set) => ({
  currentUser: initialUsers[1], // default logged in as Sarah
  users: initialUsers,
  rooms: initialRooms,
  requests: initialRequests,
  reports: initialReports,
  messages: initialMessages,
  viewings: initialViewings,
  favorites: ['haichau'],

  login: (email, password) => {
    const user = initialUsers.find(u => u.email === email);
    if (user) {
      set({ currentUser: user });
      return { success: true, role: user.role };
    }
    return { success: false, message: 'Invalid credentials. Try: sarah@example.com (user) or admin@roommate.com (admin)' };
  },

  logout: () => set({ currentUser: null }),

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