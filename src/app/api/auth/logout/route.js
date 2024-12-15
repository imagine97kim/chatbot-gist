import { cookies } from 'next/headers'

export async function POST() {
  cookies().delete('auth')
  return Response.json({ success: true })
} 