import Link from 'next/link'
import { MapPin, Clock, DollarSign, Briefcase } from 'lucide-react'
import type { Job } from '@/lib/jobs'
import { timeAgo } from '@/lib/jobs'

const functionColors: Record<string, string> = {
  Product: 'bg-violet-100 text-violet-700',
  Engineering: 'bg-blue-100 text-blue-700',
  Data: 'bg-emerald-100 text-emerald-700',
  Design: 'bg-pink-100 text-pink-700',
  Marketing: 'bg-orange-100 text-orange-700',
}

const locationTypeColors: Record<string, string> = {
  Remote: 'bg-green-100 text-green-700',
  Hybrid: 'bg-yellow-100 text-yellow-700',
  'On-site': 'bg-gray-100 text-gray-700',
}

export default function JobCard({ job }: { job: Job }) {
  const initials = job.company
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-start gap-4">
          {/* Company logo placeholder */}
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 font-bold text-sm">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
              </div>
              <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${functionColors[job.function] ?? 'bg-gray-100 text-gray-600'}`}>
                {job.function}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {job.salary}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {job.experience}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${locationTypeColors[job.locationType]}`}>
                  {job.locationType}
                </span>
                {job.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {timeAgo(job.postedDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
