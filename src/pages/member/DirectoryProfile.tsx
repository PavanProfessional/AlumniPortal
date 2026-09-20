import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Briefcase, GraduationCap, CheckCircle2, MessageCircle, Handshake, UserPlus, ExternalLink } from 'lucide-react'
import { Card, Avatar, Button, EmptyState } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { personById } from '../../data/people'
import { alumniPersonById } from '../../data/alumniPeople'
import { formatDate } from '../../utils/dates'

export default function MemberDirectoryProfile() {
  const { personId } = useParams()
  const person = personId ? (personById(personId) ?? alumniPersonById(personId)) : undefined
  const [connected, setConnected] = useState(false)

  if (!person) {
    return <EmptyState title="Profile not found" description="This alumni profile may have been removed or made private." />
  }

  return (
    <div className="space-y-6">
      <Link to="/app/directory" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200">
        <ArrowLeft className="h-4 w-4" /> Back to directory
      </Link>

      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-ink-700 to-ink-900 dark:from-ink-800 dark:to-ink-950" />
        <div className="px-6 pb-6 pt-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-end gap-4">
              <div className="-mt-9 shrink-0 rounded-full ring-4 ring-white dark:ring-ink-900">
                <Avatar name={`${person.firstName} ${person.lastName}`} color={person.avatarColor} size="lg" />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{person.firstName} {person.lastName}</h2>
                  {person.verification === 'institution-verified' && <CheckCircle2 className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />}
                </div>
                <p className="text-sm text-ink-500 dark:text-ink-400">{person.headline}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {person.mentoring.isMentor && <Button variant="outline" size="sm" icon={<Handshake className="h-3.5 w-3.5" />}>Request mentoring</Button>}
              <Button size="sm" onClick={() => setConnected((v) => !v)} icon={connected ? <MessageCircle className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}>
                {connected ? 'Message' : 'Connect'}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
            {person.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {person.location}</span>}
            {person.socialLinks.find((s) => s.platform === 'LinkedIn') && (
              <a
                href={person.socialLinks.find((s) => s.platform === 'LinkedIn')!.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400"
              >
                <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
              </a>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {person.mentoring.isMentor && <Badge tone="info">Mentor</Badge>}
            {person.tags.map((t) => <Badge key={t}>{t.replace(/-/g, ' ')}</Badge>)}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {person.bio && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">About</h3>
              <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">{person.bio}</p>
            </Card>
          )}

          {person.employment.length > 0 && (
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Briefcase className="h-4 w-4" /> Experience</h3>
              <div className="mt-4 space-y-4">
                {person.employment.map((e) => (
                  <div key={e.id} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400"><Briefcase className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{e.title} · {e.company}</p>
                      <p className="text-xs text-ink-400">{e.location} · {formatDate(e.startDate, { month: 'short', year: 'numeric' })} — {e.current ? 'Present' : e.endDate ? formatDate(e.endDate, { month: 'short', year: 'numeric' }) : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {person.academicRecords.length > 0 && (
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><GraduationCap className="h-4 w-4" /> Education</h3>
              <div className="mt-4 space-y-4">
                {person.academicRecords.map((a) => (
                  <div key={a.id}>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{a.degree}{a.program ? `, ${a.program}` : ''}</p>
                    <p className="text-xs text-ink-400">{a.institution} · Class of {a.graduationYear}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {person.skills.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">{person.skills.map((s) => <Badge key={s} tone="brand">{s}</Badge>)}</div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {person.interests.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Interests</h3>
              <div className="mt-3 flex flex-wrap gap-2">{person.interests.map((i) => <Badge key={i}>{i}</Badge>)}</div>
            </Card>
          )}
          {person.volunteerInterests.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Volunteer interests</h3>
              <div className="mt-3 flex flex-wrap gap-2">{person.volunteerInterests.map((i) => <Badge key={i} tone="success">{i}</Badge>)}</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
