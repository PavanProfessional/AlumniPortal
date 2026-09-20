import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Mail, Phone, CheckCircle2, ShieldAlert, Download, ScrollText, GraduationCap, Briefcase } from 'lucide-react'
import { Card, CardHeader, Avatar, Button, EmptyState } from '../../components/ui/Primitives'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { useToast } from '../../components/ui/Toast'
import { personById } from '../../data/people'
import { alumniPersonById } from '../../data/alumniPeople'
import { auditEvents } from '../../data/audit'
import { formatDate, formatRelative } from '../../utils/dates'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'academic', label: 'Academic & employment' },
  { key: 'activity', label: 'Activity & audit' },
]

export default function AdminMemberDetail() {
  const { personId } = useParams()
  const notify = useToast()
  const person = personId ? (personById(personId) ?? alumniPersonById(personId)) : undefined
  const [tab, setTab] = useState('overview')

  if (!person) return <EmptyState title="Member not found" />

  const relatedAudit = auditEvents.filter((a) => a.actor === `${person.firstName} ${person.lastName}`)
  const fullName = `${person.firstName} ${person.lastName}`

  function exportData() {
    notify({ message: `Exporting ${fullName}'s data`, description: 'A download link will be emailed when ready.', type: 'info', position: 'bottom-right' })
  }
  function suspend() {
    notify({ message: `${fullName} suspended`, type: 'warning', position: 'bottom-right' })
  }
  function verifyProfile() {
    notify({ message: `${fullName}'s profile marked verified`, type: 'success', position: 'bottom-right' })
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/members" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200">
        <ArrowLeft className="h-4 w-4" /> Back to members
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={`${person.firstName} ${person.lastName}`} color={person.avatarColor} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{person.firstName} {person.lastName}</h1>
                {person.verification === 'institution-verified' && <CheckCircle2 className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />}
              </div>
              <p className="text-sm text-ink-500 dark:text-ink-400">{person.headline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {person.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {person.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {person.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={exportData}>Export data</Button>
            <Button variant="outline" size="sm" icon={<ShieldAlert className="h-3.5 w-3.5" />} onClick={suspend}>Suspend</Button>
            <Button size="sm" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={verifyProfile}>Verify profile</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge status={person.status} />
          <StatusBadge status={person.verification} />
          <Badge tone="brand">{person.role}</Badge>
          {person.tags.map((t) => <Badge key={t}>{t.replace(/-/g, ' ')}</Badge>)}
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {person.bio && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Bio</h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{person.bio}</p>
              </Card>
            )}
            {person.skills.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">{person.skills.map((s) => <Badge key={s} tone="brand">{s}</Badge>)}</div>
              </Card>
            )}
            {!person.bio && person.skills.length === 0 && (
              <Card className="p-5">
                <p className="text-sm text-ink-400">No bio or skills on file for this member yet.</p>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Consent & privacy</h3>
              <div className="mt-3 space-y-2 text-xs">
                <ConsentRow label="Directory listed" value={person.consent.directoryListed} />
                <ConsentRow label="Marketing email" value={person.consent.marketingEmail} />
                <ConsentRow label="SMS" value={person.consent.sms} />
                <div className="flex items-center justify-between pt-1"><span className="text-ink-500">Profile visibility</span><Badge>{person.consent.profileVisibility}</Badge></div>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Engagement</h3>
              <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{person.engagementScore}<span className="text-sm font-normal text-ink-400">/100</span></p>
              <p className="mt-1 text-xs text-ink-400">Profile completion {person.profileCompletion}%</p>
            </Card>
          </div>
        </div>
      )}

      {tab === 'academic' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><GraduationCap className="h-4 w-4" /> Academic records</h3>
            <div className="mt-4 space-y-4">
              {person.academicRecords.length === 0 && <p className="text-sm text-ink-400">No academic records on file.</p>}
              {person.academicRecords.map((a) => (
                <div key={a.id} className="text-sm">
                  <p className="font-medium text-ink-800 dark:text-ink-100">{a.degree}{a.program ? `, ${a.program}` : ''}</p>
                  <p className="text-xs text-ink-400">{a.institution}{a.department ? ` · ${a.department}` : ''} · Batch {a.batch}{a.studentId ? ` · ID ${a.studentId}` : ''}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Briefcase className="h-4 w-4" /> Employment</h3>
            <div className="mt-4 space-y-4">
              {person.employment.length === 0 && <p className="text-sm text-ink-400">No employment history on file.</p>}
              {person.employment.map((e) => (
                <div key={e.id} className="text-sm">
                  <p className="font-medium text-ink-800 dark:text-ink-100">{e.title} · {e.company}</p>
                  <p className="text-xs text-ink-400">{e.location} · {formatDate(e.startDate, { month: 'short', year: 'numeric' })} — {e.current ? 'Present' : ''}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'activity' && (
        <Card>
          <CardHeader title="Audit trail" subtitle="Actions performed by or affecting this member" />
          {relatedAudit.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-400">No audit events recorded for this member in the sample data.</p>
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {relatedAudit.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <ScrollText className="h-4 w-4 shrink-0 text-ink-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{a.action.replace(/\./g, ' ')}</p>
                    <p className="text-[11px] text-ink-400">{a.resource}</p>
                  </div>
                  <span className="text-[11px] text-ink-400">{formatRelative(a.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

function ConsentRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <Badge tone={value ? 'success' : 'neutral'}>{value ? 'Granted' : 'Not granted'}</Badge>
    </div>
  )
}
