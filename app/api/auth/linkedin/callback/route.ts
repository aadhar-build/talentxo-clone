import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { exchangeCodeForToken, encryptToken } from '@/lib/linkedin'

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

  try {
    const { accessToken, personId } = await exchangeCodeForToken(code)
    const encrypted = encryptToken({ accessToken, personId })

    cookieStore.set('li_token', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days (LinkedIn token lifetime)
      path: '/',
    })
  } catch (err) {
    console.error('LinkedIn token exchange error:', err)
    redirect('/jobs?error=token_exchange_failed')
  }

  redirect(returnTo ?? '/jobs')
}
