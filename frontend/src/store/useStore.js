import { create } from 'zustand';

const useStore = create((set) => ({
  currentStore: null,
  user: JSON.parse(localStorage.getItem('user')) || null, // LocalStorage'dan tiklash
  token: localStorage.getItem('token') || null,

  setCurrentStore: (store) => set({ currentStore: store }),
  
  // Login qilish funksiyasi
  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({ user: userData, token: token });
  },

  // Tizimdan chiqish
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, currentStore: null });
  }
}));

export default useStore;