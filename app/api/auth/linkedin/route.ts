import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { buildAuthUrl } from '@/lib/linkedin'
import { getPostHog } from '@/lib/analytics'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const returnTo = searchParams.get('returnTo') ?? '/jobs'
  getPostHog()?.capture({ distinctId: 'anonymous', event: 'linkedin_auth_triggered', properties: { returnTo } })

  const state = randomBytes(16).toString('hex')

  const cookieStore = await cookies()
  cookieStore.set('li_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  redirect(buildAuthUrl(state, returnTo))
}
