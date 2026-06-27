import { Suspense } from 'react'
import { filterJobs } from '@/lib/jobs'
import JobCard from '@/components/JobCard'
import JobFilters from '@/components/JobFilters'
import { Briefcase } from 'lucide-react'

export default async function JobsPage(props: PageProps<'/jobs'>) {
  const params = await props.searchParams
  const query = typeof params?.query === 'string' ? params.query : undefined
  const fn = typeof params?.function === 'string' ? params.function : undefined
  const locationType = typeof params?.locationType === 'string' ? params.locationType : undefined
  const jobType = typeof params?.jobType === 'string' ? params.jobType : undefined
  const experience = typeof params?.experience === 'string' ? params.experience : undefined

  const results = filterJobs({ query, function: fn, locationType, jobType, experience })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Top Product, Tech & Design Jobs
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          Hand-picked roles at India's leading tech companies.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <Suspense>
              <JobFilters />
            </Suspense>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{results.length}</span>{' '}
              {results.length === 1 ? 'job' : 'jobs'} found
            </p>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Briefcase className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-medium text-gray-600">No jobs match your filters</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting or clearing your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
