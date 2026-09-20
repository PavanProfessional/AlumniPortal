import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, MapPin, Video, Users, Clock, Share2, CheckCircle2 } from 'lucide-react'
import { Card, Button, Avatar, ProgressBar, EmptyState } from '../../components/ui/Primitives'
import { StatusBadge } from '../../components/ui/Badge'
import { eventById, registrationsForEvent } from '../../data/events'
import { personById } from '../../data/people'
import { formatDate, formatDateTime } from '../../utils/dates'

export default function MemberEventDetail() {
  const { eventId } = useParams()
  const event = eventId ? eventById(eventId) : undefined
  const [registered, setRegistered] = useState(false)

  if (!event) return <EmptyState title="Event not found" description="This event may have been removed." />

  const attendeeSample = registrationsForEvent(event.id).slice(0, 8).map((r) => personById(r.personId)).filter(Boolean)
  const pct = (event.registeredCount / event.capacity) * 100
  const isFull = event.registeredCount >= event.capacity

  return (
    <div className="space-y-6">
      <Link to="/app/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <div className="overflow-hidden rounded-xl2" style={{ background: `linear-gradient(135deg, ${event.coverColor}, ${event.coverColor}aa)` }}>
        <div className="flex flex-col gap-4 p-8 text-white sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">{event.type}</span>
              <StatusBadge status={event.status} />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{event.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/90">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDateTime(event.startAt)}</span>
              <span className="flex items-center gap-1.5">{event.mode === 'Virtual' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />} {event.mode === 'In-person' ? event.venue : event.mode}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">About this event</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{event.description}</p>
          </Card>

          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Clock className="h-4 w-4" /> Agenda</h3>
            <div className="mt-4 space-y-3">
              {event.agenda.map((a, i) => (
                <div key={i} className="flex gap-4 text-sm">
                  <span className="w-20 shrink-0 font-medium text-ink-500 dark:text-ink-400">{a.time}</span>
                  <span className="text-ink-700 dark:text-ink-200">{a.item}</span>
                </div>
              ))}
            </div>
          </Card>

          {event.speakers.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Speakers</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {event.speakers.map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <Avatar name={s.name} size="md" />
                    <div>
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{s.name}</p>
                      <p className="text-xs text-ink-400">{s.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {attendeeSample.length > 0 && (
            <Card className="p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Users className="h-4 w-4" /> Who's attending</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {attendeeSample.map((p) => p && (
                  <div key={p.id} className="flex items-center gap-2 rounded-full bg-ink-50 py-1 pl-1 pr-3 dark:bg-ink-800">
                    <Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="xs" />
                    <span className="text-xs font-medium text-ink-600 dark:text-ink-300">{p.firstName} {p.lastName}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            {registered ? (
              <div className="flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2.5 text-sm font-medium text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
                <CheckCircle2 className="h-4 w-4" /> You're registered
              </div>
            ) : (
              <Button className="w-full justify-center" size="lg" onClick={() => setRegistered(true)}>
                {isFull ? 'Join waitlist' : event.price > 0 ? `Register — $${event.price}` : 'Register for free'}
              </Button>
            )}
            <Button variant="outline" className="mt-2 w-full justify-center" icon={<Share2 className="h-3.5 w-3.5" />}>Share event</Button>

            <div className="mt-5 space-y-3 border-t border-ink-100 pt-4 dark:border-ink-800">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-500">Capacity</span>
                  <span className="font-medium text-ink-700 dark:text-ink-200">{event.registeredCount}/{event.capacity}</span>
                </div>
                <ProgressBar value={pct} className="mt-1.5" tone={isFull ? 'warning' : 'brand'} />
                {event.waitlistCount > 0 && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{event.waitlistCount} on waitlist</p>}
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                <p><strong className="text-ink-700 dark:text-ink-200">Organizer:</strong> {event.organizer}</p>
                <p className="mt-1"><strong className="text-ink-700 dark:text-ink-200">Ends:</strong> {formatDate(event.endAt)}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">{event.tags.map((t) => <span key={t} className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-500 dark:bg-ink-800 dark:text-ink-400">#{t}</span>)}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
