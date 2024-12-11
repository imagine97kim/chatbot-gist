'use client'

import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import Login from '@/components/Login'
import Chat from '@/components/Chat'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Home() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)

  return (
    <main>
      {isLoggedIn ? <Chat /> : <Login />}
    </main>
  )
}
