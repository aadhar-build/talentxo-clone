import jobsData from '@/data/jobs.json'

export type Job = {
  id: string
  title: string
  company: string
  location: string
  locationType: 'Remote' | 'Hybrid' | 'On-site'
  salary: string
  jobType: string
  experience: string
  function: string
  postedDate: string
  tags: string[]
  description: string
  requirements: string[]
  niceToHave: string[]
  aboutCompany: string
  applyUrl: string
}

export const jobs: Job[] = jobsData as Job[]

export function getJob(id: string): Job | undefined {
  return jobs.find((j) => j.id === id)
}

export function filterJobs(params: {
  query?: string
  function?: string
  locationType?: string
  experience?: string
  jobType?: string
}): Job[] {
  return jobs.filter((job) => {
    if (params.query) {
      const q = params.query.toLowerCase()
      if (
        !job.title.toLowerCase().includes(q) &&
        !job.company.toLowerCase().includes(q) &&
        !job.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false
      }
    }
    if (params.function && params.function !== 'All' && job.function !== params.function) {
      return false
    }
    if (params.locationType && params.locationType !== 'All' && job.locationType !== params.locationType) {
      return false
    }
    if (params.jobType && params.jobType !== 'All' && job.jobType !== params.jobType) {
      return false
    }
    if (params.experience && params.experience !== 'All') {
      const expMap: Record<string, (e: string) => boolean> = {
        '0–3 years': (e) => parseInt(e) <= 3,
        '3–6 years': (e) => parseInt(e) >= 3 && parseInt(e) <= 6,
        '6–10 years': (e) => parseInt(e) >= 6 && parseInt(e) <= 10,
        '10+ years': (e) => parseInt(e) >= 10,
      }
      const check = expMap[params.experience]
      if (check && !check(job.experience)) return false
    }
    return true
  })
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
}

export const FUNCTIONS = ['All', 'Product', 'Engineering', 'Data', 'Design', 'Marketing']
export const LOCATION_TYPES = ['All', 'Remote', 'Hybrid', 'On-site']
export const JOB_TYPES = ['All', 'Full-time', 'Contract', 'Part-time']
export const EXPERIENCE_LEVELS = ['All', '0–3 years', '3–6 years', '6–10 years', '10+ years']
