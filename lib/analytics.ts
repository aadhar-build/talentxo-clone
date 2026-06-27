import { PostHog } from 'posthog-node'

let _posthog: PostHog | null = null

export function getPostHog(): PostHog | null {
  const token = process.env.POSTHOG_PROJECT_TOKEN
  const host = process.env.POSTHOG_HOST
  if (!token || !host) return null
  if (!_posthog) {
    _posthog = new PostHog(token, {
      host,
      flushAt: 1,
      flushInterval: 0,
    })
  }
  return _posthog
}
