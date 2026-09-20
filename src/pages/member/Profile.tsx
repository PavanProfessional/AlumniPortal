import { useState } from 'react'
import {
  MapPin, Mail, Phone, Pencil, GraduationCap, Briefcase, Award, Sparkles,
  Shield, Link2, CheckCircle2,
} from 'lucide-react'
import { SectionHeading, Card, Avatar, Button, ProgressBar } from '../../components/ui/Primitives'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { SidePanel } from '../../components/ui/SidePanel'
import { useToast } from '../../components/ui/Toast'
import { useAppState } from '../../context/AppStateContext'
import { formatDate } from '../../utils/dates'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'academic', label: 'Academic history' },
  { key: 'experience', label: 'Experience' },
  { key: 'privacy', label: 'Privacy & consent' },
]

export default function MemberProfile() {
  const { currentUser } = useAppState()
  const notify = useToast()
  const [tab, setTab] = useState('overview')
  const [bio, setBio] = useState(currentUser.bio)
  const [headline, setHeadline] = useState(currentUser.headline)
  const [location, setLocation] = useState(currentUser.location)
  const [editingBio, setEditingBio] = useState(false)
  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [draft, setDraft] = useState({ headline, location, bio })

  function saveBioInline() {
    setEditingBio(false)
    notify({ message: 'Bio updated', type: 'success', position: 'top-right' })
  }

  function openEditPanel() {
    setDraft({ headline, location, bio })
    setEditPanelOpen(true)
  }

  function saveProfilePanel() {
    setHeadline(draft.headline)
    setLocation(draft.location)
    setBio(draft.bio)
    setEditPanelOpen(false)
    notify({ message: 'Profile updated', description: 'Your changes are visible to the directory based on your privacy settings.', type: 'success', position: 'top-right' })
  }

  const completionItems = [
    { label: 'Basic info', done: true }, { label: 'Academic history', done: true },
    { label: 'Employment', done: currentUser.employment.length > 0 }, { label: 'Skills', done: currentUser.skills.length > 0 },
    { label: 'Certifications', done: currentUser.certifications.length > 0 }, { label: 'Profile photo', done: false },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Your profile" title="My Profile" description="This is how other alumni and administrators see you, based on your privacy settings." />

      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-600 to-accent-600" />
        <div className="px-6 pb-6 pt-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-end gap-4">
              <div className="-mt-10 shrink-0 rounded-full ring-4 ring-white dark:ring-ink-900">
                <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} color={currentUser.avatarColor} size="lg" />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{currentUser.firstName} {currentUser.lastName}</h2>
                  {currentUser.verification === 'institution-verified' && <CheckCircle2 className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />}
                </div>
                <p className="text-sm text-ink-500 dark:text-ink-400">{headline}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={openEditPanel}>Edit profile</Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {location}</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {currentUser.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {currentUser.phone}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={currentUser.verification} />
            {currentUser.mentoring.isMentor && <Badge tone="info">Mentor</Badge>}
            <Badge tone="brand">{currentUser.givingTier} donor</Badge>
            {currentUser.tags.map((t) => <Badge key={t}>{t.replace(/-/g, ' ')}</Badge>)}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />

          {tab === 'overview' && (
            <div className="space-y-6">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">About</h3>
                  <button onClick={() => (editingBio ? saveBioInline() : setEditingBio(true))} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">{editingBio ? 'Save' : 'Edit'}</button>
                </div>
                {editingBio ? (
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-3 w-full rounded-lg border border-ink-200 bg-white p-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
                ) : (
                  <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">{bio}</p>
                )}
              </Card>

              <Card className="p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Sparkles className="h-4 w-4" /> Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">{currentUser.skills.map((s) => <Badge key={s} tone="brand">{s}</Badge>)}</div>
              </Card>

              <Card className="p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Award className="h-4 w-4" /> Certifications & Achievements</h3>
                <div className="mt-3 space-y-2">
                  {currentUser.certifications.length === 0 && currentUser.achievements.length === 0 && <p className="text-xs text-ink-400">Nothing added yet.</p>}
                  {currentUser.certifications.map((c) => <p key={c} className="text-sm text-ink-600 dark:text-ink-300">🎓 {c}</p>)}
                  {currentUser.achievements.map((a) => <p key={a} className="text-sm text-ink-600 dark:text-ink-300">🏆 {a}</p>)}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Social links</h3>
                <div className="mt-3 flex gap-3">
                  {currentUser.socialLinks.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-brand-300 dark:border-ink-700 dark:text-ink-300">
                      <Link2 className="h-3.5 w-3.5" /> {l.platform}
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === 'academic' && (
            <div className="space-y-4">
              {currentUser.academicRecords.map((a) => (
                <Card key={a.id} className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><GraduationCap className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{a.degree}, {a.program}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">{a.institution} · {a.department}</p>
                    <p className="mt-1 text-xs text-ink-400">Class of {a.graduationYear} · Student ID {a.studentId}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === 'experience' && (
            <div className="space-y-4">
              {currentUser.employment.map((e) => (
                <Card key={e.id} className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400"><Briefcase className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{e.title}</p>
                      {e.current && <Badge tone="success">Current</Badge>}
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400">{e.company} · {e.location}</p>
                    <p className="mt-1 text-xs text-ink-400">{formatDate(e.startDate, { month: 'short', year: 'numeric' })} — {e.current ? 'Present' : e.endDate ? formatDate(e.endDate, { month: 'short', year: 'numeric' }) : ''}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === 'privacy' && (
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Shield className="h-4 w-4" /> Privacy preferences</h3>
              <div className="mt-4 divide-y divide-ink-100 dark:divide-ink-800">
                {[
                  { label: 'Directory listing', desc: 'Show my profile in the alumni directory', value: currentUser.consent.directoryListed },
                  { label: 'Marketing emails', desc: 'Receive newsletters and campaign emails', value: currentUser.consent.marketingEmail },
                  { label: 'SMS notifications', desc: 'Receive event reminders via SMS', value: currentUser.consent.sms },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{row.label}</p>
                      <p className="text-xs text-ink-400">{row.desc}</p>
                    </div>
                    <Toggle defaultOn={row.value} />
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-ink-100 pt-4 dark:border-ink-800">
                <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Default profile visibility</label>
                <select defaultValue={currentUser.consent.profileVisibility} className="mt-1.5 h-9 w-full max-w-xs rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100">
                  <option value="public">Public</option>
                  <option value="alumni">Alumni members only</option>
                  <option value="organisation">Organisation only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Profile completion</h3>
            <div className="mt-3 flex items-center gap-3">
              <p className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{currentUser.profileCompletion}%</p>
              <ProgressBar value={currentUser.profileCompletion} className="flex-1" />
            </div>
            <div className="mt-4 space-y-2">
              {completionItems.map((i) => (
                <div key={i.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className={`h-3.5 w-3.5 ${i.done ? 'text-accent-500' : 'text-ink-200 dark:text-ink-700'}`} />
                  <span className={i.done ? 'text-ink-600 dark:text-ink-300' : 'text-ink-400'}>{i.label}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Verification</h3>
            <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">Your profile is <strong className="text-ink-700 dark:text-ink-200">institution-verified</strong>. This gives your directory listing a trust badge and unlocks mentoring and referrals.</p>
          </Card>
        </div>
      </div>

      <SidePanel
        open={editPanelOpen}
        onClose={() => setEditPanelOpen(false)}
        title="Edit profile"
        description="Update how you appear across the directory and your public profile."
        defaultSize="M"
        footer={<><Button variant="ghost" onClick={() => setEditPanelOpen(false)}>Cancel</Button><Button onClick={saveProfilePanel}>Save changes</Button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Headline</label>
            <input value={draft.headline} onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Location</label>
            <input value={draft.location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 dark:text-ink-300">About</label>
            <textarea rows={5} value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white p-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
          </div>
        </div>
      </SidePanel>
    </div>
  )
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button onClick={() => setOn((v) => !v)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}
