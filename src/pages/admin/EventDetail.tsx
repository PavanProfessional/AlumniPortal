import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users, QrCode, Download, MapPin, CalendarDays } from 'lucide-react'
import { Card, CardHeader, StatCard, Avatar, Button, EmptyState } from '../../components/ui/Primitives'
import { StatusBadge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { ComparisonBars } from '../../components/charts/Charts'
import { eventById, registrationsForEvent } from '../../data/events'
import { personById } from '../../data/people'
import type { Registration } from '../../types'
import { formatDate, formatDateTime } from '../../utils/dates'
import { formatPercent } from '../../utils/format'
import { useAppState } from '../../context/AppStateContext'

const tabs = [{ key: 'registrations', label: 'Registrations' }, { key: 'analytics', label: 'Analytics' }, { key: 'details', label: 'Details' }]

export default function AdminEventDetail() {
  const { tenant } = useAppState()
  const { eventId } = useParams()
  const event = eventId ? eventById(eventId) : undefined
  const [tab, setTab] = useState('registrations')

  if (!event) return <EmptyState title="Event not found" />

  const regs = registrationsForEvent(event.id)
  const attendanceRate = event.registeredCount ? Math.round((event.attendedCount / event.registeredCount) * 100) : 0
  const noShow = regs.filter((r) => r.state === 'no_show').length

  const columns: Column<Registration>[] = [
    { header: 'Attendee', accessor: (r) => {
      const p = personById(r.personId)
      return p ? (
        <div className="flex items-center gap-2.5">
          <Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="sm" />
          <span className="font-medium text-ink-800 dark:text-ink-100">{p.firstName} {p.lastName}</span>
        </div>
      ) : '—'
    } },
    { header: 'Source', accessor: (r) => <span className="text-xs">{r.source}</span> },
    { header: 'Registered', accessor: (r) => <span className="text-xs">{formatDate(r.registeredAt)}</span> },
    { header: 'Status', accessor: (r) => <StatusBadge status={r.state} /> },
  ]

  const sourceBreakdown = ['Direct', 'Email Campaign', 'Directory', 'Referral', 'Community Post'].map((s) => ({ name: s, value: regs.filter((r) => r.source === s).length }))

  return (
    <div className="space-y-6">
      <Link to="/admin/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <Card className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2"><StatusBadge status={event.status} /><span className="text-xs font-medium uppercase text-ink-400">{event.type}</span></div>
            <h1 className="mt-2 font-display text-xl font-bold text-ink-900 dark:text-ink-50">{event.title}</h1>
            <p className="mt-1 flex items-center gap-4 text-xs text-ink-400">
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateTime(event.startAt)}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.mode === 'In-person' ? event.venue : event.mode}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<QrCode className="h-3.5 w-3.5" />}>Check-in scanner</Button>
            <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />}>Export list</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Registered" value={event.registeredCount} icon={<Users className="h-4 w-4" />} sub={`of ${event.capacity} capacity`} />
        <StatCard label="Waitlisted" value={event.waitlistCount} />
        <StatCard label="Attendance rate" value={formatPercent(attendanceRate)} deltaTone={attendanceRate > 70 ? 'success' : 'neutral'} />
        <StatCard label="No-shows" value={noShow} deltaTone="danger" />
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'registrations' && <DataTable columns={columns} rows={regs} keyFn={(r) => r.id} />}

      {tab === 'analytics' && (
        <Card className="p-5">
          <CardHeader title="Registration source breakdown" className="border-0 px-0 pt-0" />
          <ComparisonBars data={sourceBreakdown} layout="vertical" color={tenant.brandColor} />
        </Card>
      )}

      {tab === 'details' && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Description</h3>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{event.description}</p>
          <h3 className="mt-5 text-sm font-semibold text-ink-800 dark:text-ink-100">Agenda</h3>
          <div className="mt-3 space-y-2">
            {event.agenda.map((a, i) => <div key={i} className="flex gap-4 text-sm"><span className="w-20 shrink-0 text-ink-500">{a.time}</span><span className="text-ink-700 dark:text-ink-200">{a.item}</span></div>)}
          </div>
        </Card>
      )}
    </div>
  )
}
