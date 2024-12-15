import { create } from 'zustand'
import axios from 'axios'

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  isAdmin: false,
  user: null,
  isLoading: true,
  
  checkAuth: async () => {
    try {
      const response = await axios.get('/api/auth/check')
      const { isLoggedIn, user } = response.data
      
      if (isLoggedIn && user) {
        set({ 
          isLoggedIn: true, 
          user,
          isAdmin: user.role === 'admin',
          isLoading: false
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      set({ isLoading: false })
    }
  },

  login: async (userData) => {
    try {
      await axios.post('/api/auth/login', userData)
      set({ 
        isLoggedIn: true, 
        user: userData,
        isAdmin: userData.role === 'admin',
        isLoading: false
      })
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  logout: async () => {
    try {
      await axios.post('/api/auth/logout')
      set({ 
        isLoggedIn: false, 
        user: null,
        isAdmin: false,
        isLoading: false
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  },
}))

export default useAuthStore