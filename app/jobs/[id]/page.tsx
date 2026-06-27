import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { getJob, timeAgo } from '@/lib/jobs'
import { generatePostText, decryptToken } from '@/lib/linkedin'
import LinkedInButton from '@/components/LinkedInButton'

const functionColors: Record<string, string> = {
  Product: 'bg-violet-100 text-violet-700',
  Engineering: 'bg-blue-100 text-blue-700',
  Data: 'bg-emerald-100 text-emerald-700',
  Design: 'bg-pink-100 text-pink-700',
  Marketing: 'bg-orange-100 text-orange-700',
}

export default async function JobDetailPage(props: PageProps<'/jobs/[id]'>) {
  const { id } = await props.params
  const job = getJob(id)
  if (!job) notFound()

  // Check LinkedIn auth
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('li_token')?.value
  const isAuthenticated = !!(tokenCookie && decryptToken(tokenCookie))

  const postText = generatePostText(job)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/jobs" className="hover:text-indigo-600 transition-colors">
          Jobs
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${functionColors[job.function] ?? 'bg-gray-100 text-gray-600'}`}>
          {job.function}
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 font-medium truncate">{job.title}</span>
      </nav>

      <div className="flex gap-8 items-start">
        {/* Main content */}
        <article className="flex-1 min-w-0 space-y-6">
          {/* Job header */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-base shrink-0">
                {job.company.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                <p className="mt-1 text-gray-600 font-medium">{job.company}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip icon={<MapPin className="w-3.5 h-3.5" />} label={`${job.location} · ${job.locationType}`} />
                  <Chip icon={<Briefcase className="w-3.5 h-3.5" />} label={job.jobType} />
                  <Chip icon={<DollarSign className="w-3.5 h-3.5" />} label={job.salary} />
                  <Chip icon={<Clock className="w-3.5 h-3.5" />} label={`${job.experience} exp.`} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {timeAgo(job.postedDate)}
              </span>
            </div>
          </div>

          {/* About the role */}
          <Section title="About the Role">
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </Section>

          {/* Requirements */}
          <Section title="Requirements">
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </Section>

          {/* Nice to have */}
          <Section title="Nice to Have">
            <ul className="space-y-2">
              {job.niceToHave.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-gray-500">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {/* About company */}
          <Section title={`About ${job.company}`}>
            <p className="text-gray-700 leading-relaxed">{job.aboutCompany}</p>
          </Section>
        </article>

        {/* Sidebar */}
        <aside className="w-72 shrink-0 hidden lg:block sticky top-24 space-y-3">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Apply Now
              <ExternalLink className="w-4 h-4" />
            </a>

            <LinkedInButton
              postText={postText}
              isAuthenticated={isAuthenticated}
              returnTo={`/jobs/${job.id}`}
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Job Details</h3>
            <dl className="space-y-2 text-sm">
              <Detail label="Function" value={job.function} />
              <Detail label="Job Type" value={job.jobType} />
              <Detail label="Location" value={job.locationType} />
              <Detail label="Experience" value={job.experience} />
              <Detail label="Salary" value={job.salary} />
            </dl>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3 shadow-lg">
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 rounded-xl text-sm"
        >
          Apply Now
        </a>
        <LinkedInButton
          postText={postText}
          isAuthenticated={isAuthenticated}
          returnTo={`/jobs/${job.id}`}
        />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
      {icon}
      {label}
    </span>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  )
}
