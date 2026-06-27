import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { exchangeCodeForToken, encryptToken } from '@/lib/linkedin'
import { getPostHog } from '@/lib/analytics'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state') ?? ''
  const errorParam = searchParams.get('error')

  if (errorParam) {
    redirect(`/jobs?error=${encodeURIComponent(errorParam)}`)
  }

  if (!code) {
    redirect('/jobs?error=missing_code')
  }

  // Validate state to prevent CSRF
  const cookieStore = await cookies()
  const storedState = cookieStore.get('li_oauth_state')?.value ?? ''
  const [state, returnTo] = stateParam.split('::')

  if (!state || state !== storedState) {
    redirect('/jobs?error=invalid_state')
  }

  cookieStore.delete('li_oauth_state')

  let personId = ''
  try {
    const token = await exchangeCodeForToken(code)
    personId = token.personId
    const encrypted = encryptToken({ accessToken: token.accessToken, personId: token.personId, name: token.name })

    cookieStore.set('li_token', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60,
      path: '/',
    })

    getPostHog()?.capture({ distinctId: token.personId, event: 'linkedin_connected' })
  } catch (err) {
    console.error('LinkedIn token exchange error:', err)
    redirect('/jobs?error=token_exchange_failed')
  }

  redirect(returnTo ?? '/jobs')
}
