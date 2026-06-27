import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { decryptToken, postToLinkedIn } from '@/lib/linkedin'
import { getPostHog } from '@/lib/analytics'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('li_token')?.value

  if (!tokenCookie) {
    return NextResponse.json({ error: 'Not authenticated with LinkedIn' }, { status: 401 })
  }

  const tokenData = decryptToken(tokenCookie)
  if (!tokenData) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
  }

  let text: string
  try {
    const body = await request.json()
    text = body.text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Post text is required' }, { status: 400 })
    }
    if (text.length > 3000) {
      return NextResponse.json({ error: 'Post text exceeds LinkedIn 3000 character limit' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    await postToLinkedIn(tokenData.accessToken, tokenData.personId, text)
    getPostHog()?.capture({
      distinctId: tokenData.personId,
      event: 'post_published',
      properties: { finalLength: text.length },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('LinkedIn post error:', err)
    return NextResponse.json(
      { error: 'Failed to post to LinkedIn. Your session may have expired.' },
      { status: 500 }
    )
  }
}
