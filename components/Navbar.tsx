import Link from 'next/link'
import { BriefcaseBusiness } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <BriefcaseBusiness className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">TalentXO</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/jobs" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Jobs
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Companies
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              For Recruiters
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="#"
              className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
