import { useState } from 'react'
import { Bell, CalendarDays, Users2, Briefcase, Handshake, Gift, Info, Newspaper } from 'lucide-react'
import { SectionHeading, Card, Button, EmptyState } from '../../components/ui/Primitives'
import { notifications as seed } from '../../data/notifications'
import { formatRelative } from '../../utils/dates'
import clsx from 'clsx'

const categoryIcon: Record<string, typeof Bell> = {
  event: CalendarDays, community: Users2, career: Briefcase, mentorship: Handshake,
  giving: Gift, system: Info, content: Newspaper,
}

export default function MemberNotifications() {
  const [items, setItems] = useState(seed)

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Inbox"
        title="Notifications"
        description="Everything that needs your attention, in one place."
        action={<Button variant="outline" size="sm" onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}>Mark all as read</Button>}
      />

      {items.length === 0 ? (
        <EmptyState icon={<Bell className="h-5 w-5" />} title="You're all caught up" />
      ) : (
        <Card className="divide-y divide-ink-100 dark:divide-ink-800">
          {items.map((n) => {
            const Icon = categoryIcon[n.category] ?? Info
            return (
              <button
                key={n.id}
                onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                className={clsx('flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-ink-50 dark:hover:bg-ink-800/50', !n.read && 'bg-brand-50/40 dark:bg-brand-500/5')}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"><Icon className="h-4.5 w-4.5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{n.title}</p>
                  <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{n.body}</p>
                  <p className="mt-1 text-[11px] text-ink-400">{formatRelative(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
              </button>
            )
          })}
        </Card>
      )}
    </div>
  )
}
