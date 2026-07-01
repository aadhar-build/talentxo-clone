import { NextResponse } from 'next/server'
import { getPostHog } from '@/lib/analytics'

type TrackCopyRequest = {
  jobId: string
  generationId?: string
  angle?: string
  wasEdited?: boolean
  tone?: string
  audience?: string
  regenerationCount?: number
  personId?: string
}

export async function POST(request: Request) {
  let body: TrackCopyRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
  }

  getPostHog()?.capture({
    distinctId: body.personId ?? 'anonymous',
    event: 'post_copied',
    properties: {
      jobId: body.jobId,
      generationId: body.generationId,
      angle: body.angle,
      wasEdited: !!body.wasEdited,
      tone: body.tone,
      audience: body.audience,
      regenerationCount: body.regenerationCount ?? 0,
    },
  })

  return NextResponse.json({ success: true })
}
