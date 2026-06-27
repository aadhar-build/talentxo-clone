'use client'

import { useState } from 'react'
import { X, Send, Loader2, CheckCircle } from 'lucide-react'

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

type Props = {
  initialText: string
  onClose: () => void
}

export default function PostModal({ initialText, onClose }: Props) {
  const [text, setText] = useState(initialText)
  const [status, setStatus] = useState<'idle' | 'posting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handlePost = async () => {
    setStatus('posting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to post')
      }
      setStatus('success')
      setTimeout(onClose, 2000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0A66C2] p-1.5 rounded-lg text-white">
              <LinkedInIcon />
            </div>
            <h2 className="font-semibold text-gray-900">Post to LinkedIn</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-900">Posted to LinkedIn!</p>
              <p className="text-sm text-gray-500">Your post is now live on your profile.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Edit the post below before sharing to your LinkedIn profile.
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className="w-full text-sm border border-gray-200 rounded-xl p-3.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent font-mono leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${text.length > 3000 ? 'text-red-500' : 'text-gray-400'}`}>
                  {text.length} / 3000 characters
                </span>
                {status === 'error' && (
                  <span className="text-xs text-red-500">{errorMsg}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {status !== 'success' && (
          <div className="flex items-center justify-end gap-3 px-5 pb-5">
            <button
              onClick={onClose}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={status === 'posting' || text.length > 3000 || text.trim().length === 0}
              className="flex items-center gap-2 text-sm font-semibold bg-[#0A66C2] text-white px-5 py-2 rounded-lg hover:bg-[#084d93] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'posting' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {status === 'posting' ? 'Posting...' : 'Post Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
