import { Mail, Phone, MapPin, Home, GraduationCap, CalendarDays, ExternalLink, BookOpen } from 'lucide-react'
import { Card, Avatar } from '../ui/Primitives'
import { Badge } from '../ui/Badge'
import type { SafeAlumniRecord } from '../../data/alumniSource'
import { avatarPalette } from '../../data/reference'

export function colorFor(index: number) {
  return avatarPalette[index % avatarPalette.length]
}

// One accent color per field, reused identically everywhere an alumnus's
// safe-field record is shown (directory card, directory side panel, feed).
export const fieldTone = {
  phone: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  email: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  linkedin: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
  batch: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  passoutYear: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400',
  education: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  nativePlace: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
  workingPlace: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
} as const

export function IconBadge({ icon: Icon, tone, size = 'md' }: { icon: typeof Phone; tone: string; size?: 'sm' | 'md' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full ${tone} ${size === 'sm' ? 'h-7 w-7' : 'h-10 w-10'}`}>
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'} />
    </span>
  )
}

function DetailRow({ icon, tone, label, value, href, className }: { icon: typeof Phone; tone: string; label: string; value?: string; href?: string; className?: string }) {
  if (!value) return null
  return (
    <div className={`flex items-start gap-3 ${className ?? ''}`}>
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="break-words text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">{value}</a>
        ) : (
          <p className="break-words text-sm text-ink-800 dark:text-ink-100">{value}</p>
        )}
      </div>
    </div>
  )
}

export function AlumniDetail({ record }: { record: SafeAlumniRecord }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex items-center gap-4">
          <Avatar name={record.name} color={colorFor(record.index)} size="lg" />
          <div>
            <p className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{record.name}</p>
            <p className="text-sm text-ink-500 dark:text-ink-400">{record.occupation || 'KLE Tech Alumnus'}</p>
          </div>
        </div>
        {record.occupationType && <Badge tone="brand" className="shrink-0">{record.occupationType}</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 border-t border-ink-100 p-5 dark:border-ink-800 sm:grid-cols-2">
        <DetailRow icon={Phone} tone={fieldTone.phone} label="Phone" value={record.phone} />
        <DetailRow icon={Mail} tone={fieldTone.email} label="Email" value={record.email} />
        <DetailRow icon={Home} tone={fieldTone.nativePlace} label="Native place" value={record.nativePlace} />
        <DetailRow icon={MapPin} tone={fieldTone.workingPlace} label="Working place" value={record.workingPlace} />
        <DetailRow icon={GraduationCap} tone={fieldTone.batch} label="Batch" value={record.batch} />
        <DetailRow icon={CalendarDays} tone={fieldTone.passoutYear} label="Passout year" value={record.passoutYear} />
        <DetailRow icon={BookOpen} tone={fieldTone.education} label="Education" value={record.education} className="sm:col-span-2" />
        <DetailRow icon={ExternalLink} tone={fieldTone.linkedin} label="LinkedIn" value={record.linkedin} href={record.linkedin} className="sm:col-span-2" />
      </div>
    </Card>
  )
}
