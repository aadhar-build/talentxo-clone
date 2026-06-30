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

type Variant = { angle: string; label: string; text: string }

const ANGLE_LABELS: Record<string, string> = {
  direct: 'Direct',
  story: 'Story',
  personal: 'Personal',
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    variants: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          angle: { type: 'string', enum: ['direct', 'story', 'personal'] },
          label: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['angle', 'label', 'text'],
      },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['variants'],
}

function buildPrompt(req: GenerateRequest): string {
  const { job, tone, audience, recruiterName, recruiterBio, personalNote } = req
  const toneDesc = {
    Professional: 'formal, authoritative language',
    Casual: 'conversational, approachable tone',
    Enthusiastic: 'high energy, excitement-driven language',
  }[tone]

  return `You are a LinkedIn content expert helping a recruiter write a short post about a job opening.

JOB:
Title: ${job.title} at ${job.company}
Location: ${job.location} (${job.locationType}) | ${job.salary} | ${job.experience}
Function: ${job.function} | Tags: ${job.tags.join(', ')}

About the role: ${job.description}

Requirements: ${job.requirements.join('; ')}
Nice to have: ${job.niceToHave.join('; ')}

About ${job.company}: ${job.aboutCompany}

RECRUITER:
Name: ${recruiterName || 'the recruiter'}
Role: ${recruiterBio || 'Talent professional'}
Personal note: ${personalNote || 'N/A'}

SETTINGS:
Tone: ${tone} — use ${toneDesc}
Target audience: ${audience}

Generate exactly 3 distinct variants of the post (3–5 lines each), each using a different angle:
1. "direct" — punchy, leads straight with the opportunity and urgency.
2. "story" — opens by naming a problem or trend the reader relates to, then pivots into the role.
3. "personal" — opens using the recruiter's own personal note as the hook. If no personal note was given, open with an authentic, specific reason the recruiter is excited about this particular role — not generic.

Ground every variant in the specific details above — name real things mentioned in the role description or company description (e.g. actual products, named clients, specific metrics, concrete responsibilities) instead of generic resume-speak like "exciting opportunity," "leading company," or "seasoned professional." Each variant should read like it could only be written about this exact job at this exact company, not a template with the name swapped in.

Every variant must: end with the apply link placeholder [APPLY_LINK], end with 4–5 relevant hashtags, and sound like the recruiter's own voice.

Respond with JSON only, matching: {"variants":[{"angle":"direct","label":"Direct","text":"..."},{"angle":"story","label":"Story","text":"..."},{"angle":"personal","label":"Personal","text":"..."}]}`
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
          generationConfig: {
            temperature: 0.9,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
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

  let variants: Variant[]
  try {
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed.variants) || parsed.variants.length === 0) {
      throw new Error('Missing variants array')
    }
    variants = parsed.variants.map((v: Partial<Variant>, i: number) => {
      const angle = typeof v.angle === 'string' ? v.angle : ['direct', 'story', 'personal'][i] ?? `variant-${i}`
      const label = typeof v.label === 'string' && v.label ? v.label : ANGLE_LABELS[angle] ?? angle
      if (typeof v.text !== 'string' || !v.text) throw new Error('Missing variant text')
      return { angle, label, text: v.text }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to parse generated content' }, { status: 502 })
  }

  // Replace apply link placeholder in every variant
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  variants = variants.map((v) => ({
    ...v,
    text: v.text.replace('[APPLY_LINK]', `${appUrl}/jobs/${job.id}`),
  }))

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
      variantCount: variants.length,
      variantAngles: variants.map((v) => v.angle),
      variantLengths: variants.map((v) => v.text.length),
    },
  })

  ph?.capture({
    distinctId,
    event: '$ai_generation',
    properties: {
      $ai_provider: 'google',
      $ai_model: 'gemini-2.5-flash',
      $ai_input: [{ role: 'user', content: prompt }],
      $ai_output_choices: variants.map((v) => ({ message: { role: 'assistant', content: v.text }, angle: v.angle })),
      $ai_input_tokens: usageInput,
      $ai_output_tokens: usageOutput,
      $ai_latency: latencyMs / 1000,
      tone,
      audience,
      jobId: job.id,
      hasPersonalNote: !!personalNote,
    },
  })

  return NextResponse.json({ variants })
}
