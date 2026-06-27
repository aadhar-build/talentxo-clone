import { NextResponse } from 'next/server'
import { getPostHog } from '@/lib/analytics'
import type { Job } from '@/lib/jobs'

type GenerateRequest = {
  job: Job
  tone: 'Professional' | 'Casual' | 'Enthusiastic'
  audience: 'General' | 'Senior ICs' | 'Fresh Grads' | 'Career Switchers'
  recruiterName: string
  recruiterBio: string
  personalNote: string
  personId?: string
  isRegeneration?: boolean
}

function buildPrompt(req: GenerateRequest): string {
  const { job, tone, audience, recruiterName, recruiterBio, personalNote } = req
  const toneDesc = {
    Professional: 'formal, authoritative language',
    Casual: 'conversational, approachable tone',
    Enthusiastic: 'high energy, excitement-driven language',
  }[tone]

  const reqs = job.requirements.slice(0, 2).join('; ')

  return `You are a LinkedIn content expert helping a recruiter write a short post about a job opening.

JOB:
Title: ${job.title} at ${job.company}
Location: ${job.location} (${job.locationType}) | ${job.salary} | ${job.experience}
Function: ${job.function} | Tags: ${job.tags.join(', ')}
Key requirements: ${reqs}

RECRUITER:
Name: ${recruiterName || 'the recruiter'}
Role: ${recruiterBio || 'Talent professional'}
Personal note: ${personalNote || 'N/A'}

SETTINGS:
Tone: ${tone} — use ${toneDesc}
Target audience: ${audience}

Write ONE short LinkedIn post (3–5 lines): punchy, direct, ends with apply link placeholder [APPLY_LINK].
It must feel like the recruiter's own voice. End with 4–5 relevant hashtags.

Respond ONLY with valid JSON, no markdown fences: {"short": "..."}`
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 503 })
  }

  let body: GenerateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { job, tone, audience, recruiterName, recruiterBio, personalNote, personId, isRegeneration } = body
  if (!job || !tone || !audience) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const prompt = buildPrompt(body)
  const t0 = Date.now()

  let rawText = ''
  let usageInput = 0
  let usageOutput = 0

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9 },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Gemini error:', err)
      return NextResponse.json({ error: 'Failed to generate post' }, { status: 502 })
    }

    const data = await res.json()
    rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    usageInput = data?.usageMetadata?.promptTokenCount ?? 0
    usageOutput = data?.usageMetadata?.candidatesTokenCount ?? 0
  } catch (err) {
    console.error('Gemini fetch error:', err)
    return NextResponse.json({ error: 'Failed to generate post' }, { status: 502 })
  }

  const latencyMs = Date.now() - t0

  // Strip any markdown fences just in case
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()

  let short: string
  try {
    const parsed = JSON.parse(cleaned)
    short = parsed.short
    if (!short || typeof short !== 'string') throw new Error('Missing short field')
  } catch {
    return NextResponse.json({ error: 'Failed to parse generated content' }, { status: 502 })
  }

  // Replace apply link placeholder
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  short = short.replace('[APPLY_LINK]', `${appUrl}/jobs/${job.id}`)

  const ph = getPostHog()
  const distinctId = personId ?? 'anonymous'

  ph?.capture({
    distinctId,
    event: isRegeneration ? 'post_regenerated' : 'post_generated',
    properties: {
      jobId: job.id,
      tone,
      audience,
      hasPersonalNote: !!personalNote,
      model: 'gemini-2.5-flash',
      latencyMs,
      shortLength: short.length,
    },
  })

  ph?.capture({
    distinctId,
    event: '$ai_generation',
    properties: {
      $ai_provider: 'google',
      $ai_model: 'gemini-2.5-flash',
      $ai_input: [{ role: 'user', content: prompt }],
      $ai_output_choices: [{ message: { role: 'assistant', content: rawText } }],
      $ai_input_tokens: usageInput,
      $ai_output_tokens: usageOutput,
      $ai_latency: latencyMs / 1000,
      tone,
      audience,
      jobId: job.id,
      hasPersonalNote: !!personalNote,
    },
  })

  return NextResponse.json({ short })
}
