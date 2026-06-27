import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import type { Job } from './jobs'

const ALGORITHM = 'aes-256-gcm'
const KEY_LEN = 32

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY ?? ''
  return Buffer.from(raw.padEnd(KEY_LEN, '0').slice(0, KEY_LEN))
}

export function encryptToken(data: { accessToken: string; personId: string }): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const plain = JSON.stringify(data)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64url')
}

export function decryptToken(encoded: string): { accessToken: string; personId: string } | null {
  try {
    const buf = Buffer.from(encoded, 'base64url')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const data = buf.subarray(28)
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
    decipher.setAuthTag(tag)
    const plain = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
    return JSON.parse(plain)
  } catch {
    return null
  }
}

export function buildAuthUrl(state: string, returnTo: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`
  const scope = 'openid profile w_member_social'
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: `${state}::${returnTo}`,
    scope,
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`
}

export async function exchangeCodeForToken(
  code: string
): Promise<{ accessToken: string; personId: string }> {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }
  const { access_token } = await res.json()

  // Get person ID via OpenID Connect userinfo
  const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!meRes.ok) throw new Error('Failed to fetch LinkedIn profile')
  const profile = await meRes.json()
  // sub is the LinkedIn member URN id
  const personId = profile.sub as string

  return { accessToken: access_token, personId }
}

export async function postToLinkedIn(
  accessToken: string,
  personId: string,
  text: string
): Promise<void> {
  const body = {
    author: `urn:li:person:${personId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LinkedIn post failed: ${err}`)
  }
}

export function generatePostText(job: Job): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourapp.com'
  const firstTwoReqs = job.requirements.slice(0, 3)
  const hashtags = [
    `#${job.function}`,
    '#Hiring',
    '#Jobs',
    `#${job.company.replace(/\s+/g, '')}`,
    '#TalentXO',
  ].join(' ')

  return `🚀 Exciting opportunity at ${job.company}!

We're hiring a ${job.title} to join the team.

📍 ${job.location} · ${job.locationType}
💼 ${job.jobType} · ${job.experience}
💰 ${job.salary}

Key requirements:
${firstTwoReqs.map((r) => `• ${r}`).join('\n')}

Apply here 👉 ${appUrl}/jobs/${job.id}

${hashtags}`
}
