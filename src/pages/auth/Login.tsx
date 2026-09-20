import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, ShieldCheck, UserCircle, Building2, ArrowRight, KeyRound } from 'lucide-react'
import { Button } from '../../components/ui/Primitives'
import { useAppState } from '../../context/AppStateContext'
import type { UserRoleContext } from '../../types'
import { currentTenant } from '../../data/tenants'

const quickStart: { key: UserRoleContext; label: string; desc: string; icon: typeof UserCircle; href: string }[] = [
  { key: 'member', label: 'Alumni Member', desc: 'Browse the member experience', icon: UserCircle, href: '/app' },
  { key: 'admin', label: 'Institution Admin', desc: `Manage ${currentTenant.displayName}`, icon: ShieldCheck, href: '/admin' },
  { key: 'superadmin', label: 'Platform Super Admin', desc: 'Operate the SaaS platform', icon: Building2, href: '/platform' },
]

export default function Login() {
  const [mode, setMode] = useState<'password' | 'magic' | 'sso'>('password')
  const [email, setEmail] = useState('pavan.kumar@alumnimail.com')
  const navigate = useNavigate()
  const { setWorkspace } = useAppState()

  function enter(target: string, workspace: UserRoleContext) {
    setWorkspace(workspace)
    navigate(target)
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"><GraduationCap className="h-4.5 w-4.5" /></div>
            <span className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">Alumnia</span>
          </Link>

          <h1 className="mt-8 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Sign in to {currentTenant.displayName}'s alumni platform.</p>

          <div className="mt-6 flex rounded-lg border border-ink-200 bg-ink-50 p-1 text-xs font-medium dark:border-ink-700 dark:bg-ink-900">
            {(['password', 'magic', 'sso'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md py-1.5 transition-colors ${mode === m ? 'bg-white text-ink-900 shadow-soft dark:bg-ink-800 dark:text-ink-50' : 'text-ink-500'}`}
              >
                {m === 'password' ? 'Password' : m === 'magic' ? 'Magic link' : 'SSO'}
              </button>
            ))}
          </div>

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => { e.preventDefault(); enter('/app', 'member') }}
          >
            <div>
              <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Email address</label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
              </div>
            </div>
            {mode === 'password' && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Password</label>
                  <button type="button" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">Forgot password?</button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input defaultValue="12345" type="password" className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
                </div>
              </div>
            )}
            {mode === 'sso' && (
              <div className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-xs text-ink-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400">
                <KeyRound className="mb-1 h-4 w-4" /> Your institution has SAML SSO enabled — you'll be redirected to your identity provider.
              </div>
            )}
            <Button type="submit" className="w-full justify-center" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              {mode === 'magic' ? 'Send magic link' : mode === 'sso' ? 'Continue with SSO' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 border-t border-ink-100 pt-6 dark:border-ink-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Quick demo access</p>
            <div className="mt-3 space-y-2">
              {quickStart.map((q) => (
                <button
                  key={q.key}
                  onClick={() => enter(q.href, q.key)}
                  className="flex w-full items-center gap-3 rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/50 dark:border-ink-700 dark:bg-ink-900 dark:hover:bg-ink-800"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300"><q.icon className="h-4.5 w-4.5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{q.label}</p>
                    <p className="truncate text-xs text-ink-400">{q.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 lg:flex lg:flex-col lg:justify-center lg:gap-10 lg:p-10">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)' }} />
        <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
          <img
            src="https://scontent.fblr1-5.fna.fbcdn.net/v/t39.30808-6/480613512_976421511253492_1294322888548864530_n.jpg?stp=dst-jpg_tt6&cstp=mx3344x1254&ctp=p720x720&_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=rhy01IE71CsQ7kNvwGNQAxr&_nc_oc=AdpGfYh9gjcOypQX165XX2-AwCULUa5wghUONhtTdLpxhMgcrPulGd9e5vlcDilLMaVlsjcvOaG_AknpgVnxOhVm&_nc_zt=23&_nc_ht=scontent.fblr1-5.fna&_nc_gid=tC6bJBmYf-NGW0W53EHbLw&_nc_ss=7b289&oh=00_AQKQLrcQsB-FzKkX87GFQ9RFOqr4wBdIi_Fbi33TDRcZfA&oe=6AB1EC21"
            alt={`${currentTenant.displayName} campus`}
            className="w-full object-cover"
          />
        </div>
        <div className="relative text-white">
          <blockquote className="font-display text-2xl font-semibold leading-snug text-balance">
            "We onboarded our entire alumni base and launched mentoring and giving programs in the same quarter — without a single custom code request."
          </blockquote>
          <p className="mt-4 text-sm text-brand-100">Grace Hall · Director of Alumni Relations, {currentTenant.displayName}</p>
        </div>
      </div>
    </div>
  )
}
