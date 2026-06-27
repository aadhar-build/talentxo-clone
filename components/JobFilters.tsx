'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { FUNCTIONS, LOCATION_TYPES, JOB_TYPES, EXPERIENCE_LEVELS } from '@/lib/jobs'

export default function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const get = (key: string) => searchParams.get(key) ?? ''

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'All') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/jobs?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const clearAll = () => router.push('/jobs', { scroll: false })

  const hasFilters =
    get('query') || get('function') || get('locationType') || get('jobType') || get('experience')

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs, companies..."
          defaultValue={get('query')}
          onChange={(e) => update('query', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          <X className="w-3.5 h-3.5" />
          Clear all filters
        </button>
      )}

      {/* Function */}
      <FilterGroup
        label="Function"
        options={FUNCTIONS}
        value={get('function') || 'All'}
        onChange={(v) => update('function', v)}
      />

      {/* Location Type */}
      <FilterGroup
        label="Location"
        options={LOCATION_TYPES}
        value={get('locationType') || 'All'}
        onChange={(v) => update('locationType', v)}
      />

      {/* Job Type */}
      <FilterGroup
        label="Job Type"
        options={JOB_TYPES}
        value={get('jobType') || 'All'}
        onChange={(v) => update('jobType', v)}
      />

      {/* Experience */}
      <FilterGroup
        label="Experience"
        options={EXPERIENCE_LEVELS}
        value={get('experience') || 'All'}
        onChange={(v) => update('experience', v)}
      />
    </div>
  )
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">{label}</h3>
      <div className="space-y-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
              value === opt
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
