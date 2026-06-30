'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, RefreshCw, CheckCircle, ArrowLeft, Pencil, ChevronDown, ChevronUp,
  ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal, Globe,
  Sparkles, SlidersHorizontal, Copy, Check,
} from 'lucide-react'
import type { Job } from '@/lib/jobs'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://talentxo-clone-production.up.railway.app'

function LinkedInIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function getInitials(name: string, fallback = 'RX'): string {
  const trimmed = name.trim()
  if (!trimmed) return fallback
  return trimmed.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
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

const REACTION_BADGES = [
  { bg: '#378fe9', emoji: '👍' },
  { bg: '#e06847', emoji: '❤️' },
  { bg: '#f5bb5c', emoji: '💡' },
]

function LinkedInFeedCard({ post, name, bio, job }: { post: string; name: string; bio: string; job: Job }) {
  const initials = getInitials(name)
  const companyInitials = job.company.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const domain = APP_URL.replace(/^https?:\/\//, '')

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Post header */}
      <div className="px-4 pt-3 flex items-start gap-2.5">
        <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="font-semibold text-[#000000E0] text-sm leading-tight truncate">{name || 'Your Name'}</div>
          <div className="text-xs text-[#00000099] leading-snug mt-0.5 truncate">{bio || 'Tech Recruiter at TalentXO'}</div>
          <div className="flex items-center gap-1 text-xs text-[#00000066] mt-0.5">
            <span>Now</span>
            <span aria-hidden>·</span>
            <Globe className="w-3 h-3" aria-label="Visibility: Anyone" />
          </div>
        </div>
        <button className="text-[#00000066] hover:bg-[#00000008] rounded-full shrink-0 mt-0.5 p-1.5 transition-colors" aria-label="Open control menu">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Post text */}
      <div className="px-4 pt-2.5 pb-3 text-sm text-[#000000E0] leading-snug whitespace-pre-line">
        {post}
      </div>

      {/* Job link preview card — full-bleed image + footer, mimics LinkedIn's URL unfurl */}
      <div className="border-t border-gray-200">
        <div className="aspect-[1.91/1] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-3xl font-bold tracking-wide">{companyInitials}</div>
            <div className="text-sm opacity-90 mt-1">{job.company}</div>
          </div>
        </div>
        <div className="bg-[#f3f2ef] px-3 py-2.5">
          <div className="text-sm font-semibold text-[#00000099] leading-snug line-clamp-2">
            {job.title} — {job.company}
          </div>
          <div className="text-xs text-[#00000066] mt-0.5 uppercase tracking-wide truncate">{domain}</div>
        </div>
      </div>

      {/* Reaction summary row */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-[#00000066] border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {REACTION_BADGES.map((r, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] ring-2 ring-white"
                style={{ backgroundColor: r.bg }}
              >
                {r.emoji}
              </span>
            ))}
          </div>
          <span className="ml-1">38</span>
        </div>
        <div className="flex items-center gap-3">
          <span>4 comments</span>
          <span>2 reposts</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Action row */}
      <div className="px-1 py-0.5 flex items-center">
        {[
          { icon: ThumbsUp, label: 'Like' },
          { icon: MessageCircle, label: 'Comment' },
          { icon: Repeat2, label: 'Repost' },
          { icon: Send, label: 'Send' },
        ].map((r) => (
          <button
            key={r.label}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-[#00000099] py-2.5 hover:bg-[#00000008] rounded-lg transition-colors"
          >
            <r.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

type Tone = 'Professional' | 'Casual' | 'Enthusiastic'
type Audience = 'General' | 'Senior ICs' | 'Fresh Grads' | 'Career Switchers'
type Variant = { angle: string; label: string; text: string }

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
const LINKEDIN_FEED_URL = 'https://www.linkedin.com/feed/'

export default function SharePageClient({ job, jobId, recruiterName: initialName, isAuthenticated, personId }: Props) {
  const router = useRouter()

  const [name, setName] = useState(initialName)
  const [recruiterBio, setRecruiterBio] = useState('')
  const [personalNote, setPersonalNote] = useState('')
  const [tone, setTone] = useState<Tone>('Professional')
  const [audience, setAudience] = useState<Audience>('General')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [posts, setPosts] = useState<Variant[]>(() => [
    { angle: 'template', label: 'Quick start', text: buildDefaultPost(job) },
  ])
  const [activeIndex, setActiveIndex] = useState(0)
  const activePost = posts[activeIndex]?.text ?? ''

  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [regenerationCount, setRegenerationCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  const [postStatus, setPostStatus] = useState<'idle' | 'posting' | 'success' | 'error'>('idle')
  const [postError, setPostError] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  // Sticky bar appears once the user scrolls into the "Personalize" section
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
          if (Array.isArray(s.posts) && s.posts.length > 0) setPosts(s.posts)
          if (typeof s.activeIndex === 'number') setActiveIndex(s.activeIndex)
        }
        sessionStorage.removeItem(SESSION_KEY)
      }
    } catch {}
  }, [jobId])

  const saveToSession = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        jobId, recruiterBio, personalNote, tone, audience, posts, activeIndex,
      }))
    } catch {}
  }

  const updateActiveText = (text: string) => {
    setPosts((prev) => prev.map((p, i) => (i === activeIndex ? { ...p, text } : p)))
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
      setPosts(data.variants)
      setActiveIndex(0)
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
        body: JSON.stringify({ text: activePost }),
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activePost)
      setCopyStatus('copied')
      window.open(LINKEDIN_FEED_URL, '_blank', 'noopener,noreferrer')
    } catch {
      setCopyStatus('error')
    } finally {
      setTimeout(() => setCopyStatus('idle'), 2500)
    }
  }

  const initials = getInitials(name)

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showStickyBar && postStatus !== 'success' ? 'pb-24' : ''}`}>
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

      {/* Hero — LinkedIn feed preview, front and center */}
      <div className="max-w-xl mx-auto space-y-4">
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
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide text-center">Preview — how it looks in the LinkedIn feed</p>

            {posts.length > 1 && !isGenerating && (
              <div className="flex items-center justify-center gap-2">
                {posts.map((p, i) => (
                  <button
                    key={p.angle}
                    onClick={() => setActiveIndex(i)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      i === activeIndex
                        ? 'bg-[#0A66C2] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {isGenerating ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#0A66C2]" />
              </div>
            ) : (
              <LinkedInFeedCard
                post={activePost}
                name={name}
                bio={recruiterBio}
                job={job}
              />
            )}

            {/* Generate / regenerate — kept on the hero card so first-time visitors see it immediately */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating 3 versions…
                </>
              ) : regenerationCount > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate 3 versions
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate 3 AI versions
                </>
              )}
            </button>

            {generateError && (
              <p className="text-sm text-red-500 text-center">{generateError}</p>
            )}

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
                      value={activePost}
                      onChange={(e) => updateActiveText(e.target.value)}
                      rows={10}
                      className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <span className={`text-xs ${activePost.length > 3000 ? 'text-red-500' : 'text-gray-400'}`}>
                        {activePost.length} / 3000
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {postStatus === 'error' && (
              <p className="text-sm text-red-500 text-center">{postError}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePost}
                disabled={postStatus === 'posting' || activePost.length > 3000 || activePost.trim().length === 0 || isGenerating}
                className="flex-1 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#084d93] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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

              <button
                onClick={handleCopy}
                disabled={activePost.trim().length === 0 || isGenerating}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : copyStatus === 'error' ? (
                  <>Couldn&apos;t copy — try manually</>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy &amp; open LinkedIn
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              No LinkedIn connection needed — copies the post so you can paste it yourself.
            </p>
          </>
        )}
      </div>

      {/* Customize — personalization controls, below the fold */}
      {postStatus !== 'success' && (
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div ref={sentinelRef} />
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personalize this post</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recruiter Profile */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Your profile</h3>
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

            {/* Personal Note */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Personal note <span className="font-normal text-gray-400">(optional)</span></h3>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                rows={3}
                placeholder="Why are you excited about this role? What makes this company special?"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400">Used as the hook for the &ldquo;Personal&rdquo; version.</p>
            </div>
          </div>

          {/* Advanced options — tone & audience, collapsed by default */}
          <div className="mt-4 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAdvanced((a) => !a)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                Advanced options — tone &amp; audience
              </span>
              {showAdvanced
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>

            {showAdvanced && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">Tone</h3>
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

                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">Target audience</h3>
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky mini-bar — keeps Post/Copy reachable once the user scrolls past the hero */}
      {showStickyBar && postStatus !== 'success' && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {initials}
            </div>
            <p className="flex-1 min-w-0 text-xs text-gray-500 truncate">{activePost}</p>
            <button
              onClick={handleCopy}
              disabled={activePost.trim().length === 0 || isGenerating}
              className="shrink-0 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-60"
              aria-label="Copy post and open LinkedIn"
            >
              {copyStatus === 'copied' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePost}
              disabled={postStatus === 'posting' || activePost.length > 3000 || activePost.trim().length === 0 || isGenerating}
              className="shrink-0 flex items-center gap-1.5 bg-[#0A66C2] hover:bg-[#084d93] text-white font-semibold text-sm py-2 px-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {postStatus === 'posting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkedInIcon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAuthenticated ? 'Post' : 'Connect'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
