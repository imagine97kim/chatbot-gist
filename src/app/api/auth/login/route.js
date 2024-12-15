import { cookies } from 'next/headers'

export async function POST(request) {
  const body = await request.json()
  const { username, role } = body

  // 실제 인증 로직은 여기서 구현

  // 쿠키 설정
  cookies().set({
    name: 'auth',
    value: JSON.stringify({ username, role }),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return Response.json({ success: true })
} 