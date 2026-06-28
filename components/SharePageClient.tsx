'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw, CheckCircle, ArrowLeft, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import type { Job } from '@/lib/jobs'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talentxo-clone-production.up.railway.app'

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function buildDefaultPost(job: Job): string {
  const tags = job.tags.slice(0, 3).map(t => '#' + t.replace(/[\s-]+/g, ''))
  const fnTag = '#' + job.function.replace(/\s+/g, '')
  return [
    `🚀 We're hiring a ${job.title} at ${job.company}!`,
    '',
    `If you're passionate about ${job.tags[0] ?? job.function} and want to work on high-impact problems, this could be your next move.`,
    '',
    `📍 ${job.location} · ${job.locationType}`,
    `💼 ${job.jobType} · ${job.experience} experience`,
    `💰 ${job.salary}`,
    '',
    `Apply here 👉 ${APP_URL}/jobs/${job.id}`,
    '',
    `${tags.join(' ')} #Hiring ${fnTag} #TalentXO`,
  ].join('\n')
}

function LinkedInFeedCard({ post, name, bio, job }: { post: string; name: string; bio: string; job: Job }) {
  const initials = name.trim()
    ? name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'RX'
  const companyInitials = job.company.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Post header */}
      <div className="p-3 pb-0 flex items-start gap-2.5">
        <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="font-semibold text-[#000000E0] text-sm leading-tight">{name || 'Your Name'}</div>
          <div className="text-xs text-[#00000099] leading-snug mt-0.5 truncate">{bio || 'Tech Recruiter at TalentXO'}</div>
          <div className="text-[11px] text-[#00000066] mt-0.5">1,284 followers · 1st</div>
        </div>
        <button className="text-[#00000066] hover:text-[#000000CC] shrink-0 mt-0.5 p-1">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* Post text */}
      <div className="px-4 pt-2.5 pb-3 text-sm text-[#000000E0] leading-snug whitespace-pre-line">
        {post}
      </div>

      {/* Job link preview card — mimics LinkedIn link attachment */}
      <div className="border-t border-b border-gray-200 flex items-center gap-3 px-3 py-3 bg-[#f3f2ef] hover:bg-[#eae8e4] transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
          {companyInitials}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[#000000E0] truncate leading-tight">{job.title}</div>
          <div className="text-xs text-[#00000099] truncate mt-0.5">{job.company} · {job.location}</div>
          <div className="text-[11px] text-[#00000066] mt-0.5">talentxo-clone-production.up.railway.app</div>
        </div>
      </div>

      {/* Reactions row */}
      <div className="px-2 py-0.5 flex items-center">
        {[
          { icon: '👍', label: 'Like' },
          { icon: '💬', label: 'Comment' },
          { icon: '🔁', label: 'Repost' },
          { icon: '✉️', label: 'Send' },
        ].map(r => (
          <button
            key={r.label}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-[#00000066] py-3 hover:bg-[#00000008] rounded-lg transition-colors"
          >
            <span className="text-base leading-none">{r.icon}</span>
            <span className="hidden sm:inline">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

type Tone = 'Professional' | 'Casual' | 'Enthusiastic'
type Audience = 'General' | 'Senior ICs' | 'Fresh Grads' | 'Career Switchers'

type Props = {
  job: Job
  jobId: string
  recruiterName: string
  isAuthenticated: boolean
  personId?: string
}

const TONES: Tone[] = ['Professional', 'Casual', 'Enthusiastic']
const AUDIENCES: Audience[] = ['General', 'Senior ICs', 'Fresh Grads', 'Career Switchers']
const SESSION_KEY = 'talentxo_share_state'

export default function SharePageClient({ job, jobId, recruiterName: initialName, isAuthenticated, personId }: Props) {
  const router = useRouter()

  const [name, setName] = useState(initialName)
  const [recruiterBio, setRecruiterBio] = useState('')
  const [personalNote, setPersonalNote] = useState('')
  const [tone, setTone] = useState<Tone>('Professional')
  const [audience, setAudience] = useState<Audience>('General')

  const [shortPost, setShortPost] = useState(() => buildDefaultPost(job))
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [regenerationCount, setRegenerationCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  const [postStatus, setPostStatus] = useState<'idle' | 'posting' | 'success' | 'error'>('idle')
  const [postError, setPostError] = useState('')

  // Restore from sessionStorage after OAuth redirect
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const s = JSON.parse(saved)
        if (s.jobId === jobId) {
          if (s.recruiterBio) setRecruiterBio(s.recruiterBio)
          if (s.personalNote) setPersonalNote(s.personalNote)
          if (s.tone) setTone(s.tone)
          if (s.audience) setAudience(s.audience)
          if (s.shortPost) setShortPost(s.shortPost)
        }
        sessionStorage.removeItem(SESSION_KEY)
      }
    } catch {}
  }, [jobId])

  const saveToSession = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        jobId, recruiterBio, personalNote, tone, audience, shortPost,
      }))
    } catch {}
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerateError('')
    const isRegen = regenerationCount > 0

    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job, tone, audience, recruiterName: name, recruiterBio, personalNote,
          personId, isRegeneration: isRegen,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Generation failed')
      }
      const data = await res.json()
      setShortPost(data.short)
      setRegenerationCount((c) => c + 1)
      setPostStatus('idle')
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePost = async () => {
    if (!isAuthenticated) {
      saveToSession()
      window.location.href = `/api/auth/linkedin?returnTo=${encodeURIComponent(`/jobs/${jobId}/share`)}`
      return
    }
    setPostStatus('posting')
    setPostError('')
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: shortPost }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to post')
      }
      setPostStatus('success')
    } catch (err) {
      setPostStatus('error')
      setPostError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <button
        onClick={() => router.push(`/jobs/${jobId}`)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {job.title}
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Craft your LinkedIn post</h1>
        <p className="mt-1 text-gray-500 text-sm">
          Personalise the post for <span className="font-medium text-gray-700">{job.title}</span> at <span className="font-medium text-gray-700">{job.company}</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left — Personalization Panel */}
        <div className="w-full lg:w-96 shrink-0 space-y-4">
          {/* Recruiter Profile */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Your profile</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role / headline</label>
              <input
                type="text"
                value={recruiterBio}
                onChange={(e) => setRecruiterBio(e.target.value)}
                placeholder="e.g. Tech Recruiter at TalentXO"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tone */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Tone</h2>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                    tone === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Target audience</h2>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                    audience === a
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Note */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Personal note <span className="font-normal text-gray-400">(optional)</span></h2>
            <textarea
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              rows={3}
              placeholder="Why are you excited about this role? What makes this company special?"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : regenerationCount > 0 ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Regenerate with AI
              </>
            ) : (
              'Generate with AI'
            )}
          </button>

          {generateError && (
            <p className="text-sm text-red-500 text-center">{generateError}</p>
          )}
        </div>

        {/* Right — LinkedIn Feed Preview */}
        <div className="flex-1 min-w-0 space-y-4">
          {postStatus === 'success' ? (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 flex flex-col items-center gap-3 text-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <p className="font-semibold text-gray-900">Posted to LinkedIn!</p>
              <p className="text-sm text-gray-500">Your post is now live on your profile.</p>
              <button
                onClick={() => setPostStatus('idle')}
                className="mt-2 text-sm text-indigo-600 hover:underline"
              >
                Post again
              </button>
            </div>
          ) : (
            <>
              {/* Label */}
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Preview — how it looks on LinkedIn</p>

              {/* Feed card */}
              {isGenerating ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0A66C2]" />
                </div>
              ) : (
                <LinkedInFeedCard
                  post={shortPost}
                  name={name}
                  bio={recruiterBio}
                  job={job}
                />
              )}

              {/* Edit toggle */}
              {!isGenerating && (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setIsEditing(e => !e)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Pencil className="w-3.5 h-3.5 text-gray-400" />
                      Edit post text
                    </span>
                    {isEditing
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </button>

                  {isEditing && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                      <textarea
                        value={shortPost}
                        onChange={(e) => setShortPost(e.target.value)}
                        rows={10}
                        className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent leading-relaxed"
                      />
                      <div className="flex justify-end">
                        <span className={`text-xs ${shortPost.length > 3000 ? 'text-red-500' : 'text-gray-400'}`}>
                          {shortPost.length} / 3000
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {postStatus === 'error' && (
                <p className="text-sm text-red-500 text-center">{postError}</p>
              )}

              {/* Post button */}
              <button
                onClick={handlePost}
                disabled={postStatus === 'posting' || shortPost.length > 3000 || shortPost.trim().length === 0 || isGenerating}
                className="flex items-center justify-center gap-2 w-full bg-[#0A66C2] hover:bg-[#084d93] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {postStatus === 'posting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <LinkedInIcon />
                    {isAuthenticated ? 'Post to LinkedIn' : 'Connect LinkedIn & Post'}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
