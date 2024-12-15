'use client'
import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'

export function Providers({ children }) {
  const checkAuth = useAuthStore(state => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [])

  return children
} 