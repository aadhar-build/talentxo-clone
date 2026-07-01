import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
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

Generate exactly 3 distinct variants of the post, each using a different angle AND a different structure — not just a different opening line:

1. "direct" — Short, declarative sentences. No rhetorical questions, no narrative setup. Lead with the single most compelling concrete fact from above, state the ask, close fast. End with an imperative CTA like "Apply now" or "Apply today."
2. "story" — Open by naming a real industry trend or problem (never a rhetorical question). Stay focused on that trend/problem throughout, keep the recruiter's first-person voice minimal, and only pivot to this specific role in the second half. End with an invitational CTA like "Here's the role" or "Read more below."
3. "personal" — Written entirely in first person, as the recruiter. Use the recruiter's personal note as the opening line if one was given; otherwise open with one specific, concrete reason this exact role stands out (not a generic "I'm excited"). End with a direct, personal CTA like "DM me" or "Reach out directly."

Formatting rules (apply to all 3):
- Use ONLY facts stated above. Never invent metrics, client names, products, team sizes, or numbers that aren't explicitly given — if a detail isn't provided, describe it qualitatively instead of making one up.
- Break each post into short lines or 1–2 sentence chunks separated by a blank line — never one dense paragraph. It should read like a real scannable LinkedIn post, not an essay.
- Always leave a space (or line break) between sentences — never let two sentences run together with no separator (e.g. never "...pain points?Razorpay is...").
- Put the apply link placeholder [APPLY_LINK] on its own line near the end.
- End with 4–5 relevant hashtags on their own line. Where it fits naturally, let 1–2 hashtags also reflect the target audience (${audience}) alongside the role/company tags — a nice-to-have, not required.
- Never use generic AI-sounding phrasing: no rhetorical-question openers ("Are you a...?"), "unlock your potential," "in today's fast-paced world," "look no further," "we're thrilled to announce," or similar clichés.

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
  const generationId = randomUUID()
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
            temperature: 0.7,
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
      generationId,
      jobId: job.id,
      tone,
      audience,
      hasPersonalNote: !!personalNote,
      model: 'gemini-2.5-flash',
      temperature: 0.7,
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
      generationId,
      tone,
      audience,
      jobId: job.id,
      hasPersonalNote: !!personalNote,
    },
  })

  return NextResponse.json({ variants, generationId })
}
