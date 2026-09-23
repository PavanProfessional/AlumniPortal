import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react'
import { Button } from '../../components/ui/Primitives'
import { useAppState } from '../../context/AppStateContext'
import type { UserRoleContext } from '../../types'
import { currentTenant } from '../../data/tenants'
import signinImage from '../../assets/college/signinimage.png'

const testimonials = [
  {
    quote: 'We onboarded our entire alumni base and launched mentoring and giving programs in the same quarter — without a single custom code request.',
    author: `Grace Hall · Director of Alumni Relations, ${currentTenant.displayName}`,
  },
  {
    quote: 'One platform now runs our directory, events and fundraising — our chapters finally see the same source of truth.',
    author: `Priya Anand · Head of Advancement, ${currentTenant.displayName}`,
  },
  {
    quote: 'Mentorship matches that used to take weeks of spreadsheet work now happen in minutes.',
    author: `Marcus Boyd · Alumni Engagement Lead, ${currentTenant.displayName}`,
  },
]

export default function Login() {
  const [mode, setMode] = useState<'password' | 'magic' | 'sso'>('password')
  const [email, setEmail] = useState('admin@jnv.com')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const navigate = useNavigate()
  const { setWorkspace } = useAppState()

  useEffect(() => {
    const id = window.setInterval(() => setQuoteIndex((i) => (i + 1) % testimonials.length), 5000)
    return () => window.clearInterval(id)
  }, [])

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
            onSubmit={(e) => { e.preventDefault(); enter('/admin', 'admin') }}
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
                  <input defaultValue="1234" type="password" className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
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
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 lg:flex lg:flex-col lg:justify-center lg:gap-10 lg:p-10">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)' }} />
        <div className="relative overflow-hidden rounded-2xl bg-white/5 shadow-2xl ring-1 ring-white/10">
          <img
            src={signinImage}
            alt={`${currentTenant.displayName} campus`}
            className="w-full object-cover"
          />
        </div>
        <div className="grid text-white">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="col-start-1 row-start-1 transition-all duration-700 ease-out"
              style={{ opacity: i === quoteIndex ? 1 : 0, transform: i === quoteIndex ? 'translateY(0)' : 'translateY(8px)', pointerEvents: i === quoteIndex ? 'auto' : 'none' }}
              aria-hidden={i !== quoteIndex}
            >
              <blockquote className="font-display text-2xl font-semibold leading-snug text-balance">"{t.quote}"</blockquote>
              <p className="mt-4 text-sm text-brand-100">{t.author}</p>
            </div>
          ))}
        </div>
        <div className="relative flex gap-1.5">
          {testimonials.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === quoteIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
