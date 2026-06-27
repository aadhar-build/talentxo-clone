import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getJob } from '@/lib/jobs'
import { decryptToken } from '@/lib/linkedin'
import { getPostHog } from '@/lib/analytics'
import SharePageClient from '@/components/SharePageClient'

export default async function SharePage(props: PageProps<'/jobs/[id]/share'>) {
  const { id } = await props.params
  const job = getJob(id)
  if (!job) notFound()

  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('li_token')?.value
  const tokenData = tokenCookie ? decryptToken(tokenCookie) : null
  const isAuthenticated = !!tokenData
  const recruiterName = tokenData?.name ?? ''

  getPostHog()?.capture({
    distinctId: tokenData?.personId ?? 'anonymous',
    event: 'share_page_viewed',
    properties: {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      isAuthenticated,
    },
  })

  return (
    <SharePageClient
      job={job}
      jobId={id}
      recruiterName={recruiterName}
      isAuthenticated={isAuthenticated}
      personId={tokenData?.personId}
    />
  )
}
