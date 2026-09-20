import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Users, Bookmark, Share2, CheckCircle2, Sparkles } from 'lucide-react'
import { Card, Button, EmptyState } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { jobById, myApplications, savedJobIds } from '../../data/careers'
import { formatRelative, formatDate } from '../../utils/dates'

export default function MemberJobDetail() {
  const { jobId } = useParams()
  const job = jobId ? jobById(jobId) : undefined
  const [applied, setApplied] = useState(() => myApplications.some((a) => a.jobId === jobId))
  const [saved, setSaved] = useState(() => (jobId ? savedJobIds.includes(jobId) : false))

  if (!job) return <EmptyState title="Job not found" />

  const matchScore = 87
  const matchReasons = ['Skills overlap with your profile', 'Similar past role', 'Location match']

  return (
    <div className="space-y-6">
      <Link to="/app/careers" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-lg font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">{job.employerLogo}</div>
            <div>
              <h1 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">{job.title}</h1>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{job.employer} · {job.location}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="brand">{job.employmentType}</Badge>
                <Badge>{job.remoteMode}</Badge>
                <Badge>{job.experience}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaved((v) => !v)} icon={<Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-brand-500 text-brand-500' : ''}`} />}>{saved ? 'Saved' : 'Save'}</Button>
            <Button variant="outline" size="sm" icon={<Share2 className="h-3.5 w-3.5" />}>Share</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-400">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Posted {formatRelative(job.postedAt)}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.applicantCount} applicants</span>
          <span>Closes {formatDate(job.expiresAt)}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Job description</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{job.description}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">{job.skills.map((s) => <Badge key={s} tone="brand">{s}</Badge>)}</div>
          </Card>
          {job.referralAllowed && (
            <Card className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400"><Users className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Know someone great for this role?</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">Alumni referrals get priority review from {job.employer}.</p>
              </div>
              <Button variant="outline" size="sm">Refer someone</Button>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            {applied ? (
              <div className="flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2.5 text-sm font-medium text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
                <CheckCircle2 className="h-4 w-4" /> Application submitted
              </div>
            ) : (
              <Button className="w-full justify-center" size="lg" onClick={() => setApplied(true)}>Apply now</Button>
            )}
            {job.salaryVisible && job.salaryRange && (
              <p className="mt-3 text-center text-sm font-semibold text-ink-700 dark:text-ink-200">{job.salaryRange}</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Sparkles className="h-4 w-4 text-brand-500" /> Why this matches you</h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-brand-600 dark:text-brand-400">{matchScore}%</span>
              <span className="text-xs text-ink-400">match score</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {matchReasons.map((r) => (
                <li key={r} className="flex items-start gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-accent-500" /> {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
