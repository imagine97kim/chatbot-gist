import { create } from 'zustand'

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  isAdmin: false,
  user: null,
  login: (userData) => set({ 
    isLoggedIn: true, 
    user: userData,
    isAdmin: userData.role === 'admin'
  }),
  logout: () => set({ 
    isLoggedIn: false, 
    user: null,
    isAdmin: false
  }),
}))

export default useAuthStore 