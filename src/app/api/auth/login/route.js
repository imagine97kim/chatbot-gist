import { cookies } from 'next/headers'

export async function POST(request) {
  const body = await request.json()
  const { username, role } = body

  const cookieData = {
    name: 'auth',
    value: JSON.stringify({ username, role }),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  }

  // 쿠키 설정
  cookies().set(cookieData)

  // 응답 헤더에 Set-Cookie를 명시적으로 포함
  return new Response(
    JSON.stringify({ success: true }), 
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
} 