'use client'

import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import Login from '@/components/Login'
import Chat from '@/components/Chat'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Home() {
  const { isLoggedIn, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className={"loadingContainer"}>
        <div className={"loadingSpinner"}></div>
      </div>
    )
  }

  return isLoggedIn ? <Chat /> : <Login />
}
