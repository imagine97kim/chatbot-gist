import { cookies } from 'next/headers'

export async function GET() {
  const authCookie = cookies().get('auth')
  
  if (!authCookie) {
    return Response.json({ isLoggedIn: false })
  }

  try {
    const userData = JSON.parse(authCookie.value)
    return Response.json({
      isLoggedIn: true,
      user: userData
    })
  } catch {
    return Response.json({ isLoggedIn: false })
  }
} 