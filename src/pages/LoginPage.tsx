import { useState, type FormEvent, type ReactNode } from 'react'
import { Database, Eye, EyeOff, Loader2, ScanSearch, ShieldCheck } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { LinkedInIcon, XIcon } from '../components/SocialIcons'

const DASHBOARD_PATH = '/admin/dashboard'

const FEATURES = [
  { icon: ScanSearch, label: 'Découverte automatique des données sensibles' },
  { icon: ShieldCheck, label: 'Masquage et tokenisation conformes (RGPD, PCI DSS)' },
  { icon: Database, label: 'Intégrité référentielle entre toutes vos bases' },
]

const SOCIAL_LINKS = [
  { href: 'https://www.linkedin.com/company/accutive-security', label: 'LinkedIn', Icon: LinkedInIcon },
  { href: 'https://x.com/accutivesec', label: 'X (Twitter)', Icon: XIcon },
]

const CURRENT_YEAR = new Date().getFullYear()

// Style des champs repris du formulaire HubSpot de la page contact
const INPUT_CLASS =
  'h-10 w-full rounded-none border border-form-border bg-form-field px-[15px] font-field text-base leading-[22px] text-form-text transition-[border-color] duration-200 outline-none placeholder:text-form-placeholder focus:border-form-focus'

function FormField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="mb-[18px]">
      <label htmlFor={id} className="mb-1 block text-base leading-5 font-medium text-form-label">
        {label} <span className="text-form-required">*</span>
      </label>
      {children}
    </div>
  )
}

export default function LoginPage() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!username.trim() || !password) {
      setError("Veuillez saisir votre nom d'utilisateur et votre mot de passe.")
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const loggedUser = await login(username.trim(), password)
      if (loggedUser.role !== 'admin') {
        await logout()
        setError('Accès réservé aux administrateurs.')
        return
      }
      navigate(DASHBOARD_PATH, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Nom d'utilisateur ou mot de passe incorrect."
          : 'Impossible de joindre le serveur. Réessayez plus tard.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Administrateur déjà connecté : inutile de revoir le formulaire
  if (user?.role === 'admin') return <Navigate to={DASHBOARD_PATH} replace />

  return (
    <main className="flex min-h-screen bg-night-800">
      {/* Panneau de marque (masqué sur mobile) */}
      <section className="relative hidden w-1/2 overflow-hidden bg-linear-to-br from-night-950 via-night-800 to-brand-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-accent-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-brand-700/60 blur-3xl" />

        {/* Logo violet passé en blanc par filtre pour le fond sombre */}
        <img src="/accutive-logo.png" alt="Accutive Security" className="relative h-11 w-auto self-start brightness-0 invert" />

        <div className="relative max-w-md">
          <h1 className="text-4xl leading-tight font-medium text-white">
            Data Discovery &amp; Masking Platform
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Découvrez, classifiez et protégez vos données sensibles avant qu'elles ne quittent la production.
          </p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-white/85">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-accent-400/40 bg-white/5">
                  <Icon className="size-5 text-accent-400" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Pied de page repris du site : copyright + réseaux sociaux */}
        <div className="relative flex items-center justify-between gap-4 font-display text-xs leading-[15.36px] text-footer-text">
          <p>
            Copyright © {CURRENT_YEAR}{' '}
            <a href="https://accutivesecurity.com/" target="_blank" rel="noopener noreferrer" className="transition hover:text-footer-hover">
              Accutive Security
            </a>
            . All rights reserved.
          </p>
          <ul className="flex items-center gap-[13px]">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="block transition hover:opacity-80">
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Formulaire : carte blanche sur fond violet, comme la page contact (section 60/80/80, carte 60/36) */}
      <section className="flex w-full items-center justify-center bg-night-800 px-4 py-10 sm:px-10 lg:w-1/2 lg:px-20 lg:pt-[60px] lg:pb-20">
        <div className="w-full max-w-[572px] rounded-lg bg-white px-6 py-10 shadow-card sm:px-9 sm:py-[60px]">
          <img src="/accutive-logo.png" alt="Accutive Security" className="mb-8 h-10 w-auto lg:hidden" />

          <h2 className="text-[28px] leading-[38px] font-semibold text-black">Connexion</h2>

          <form onSubmit={handleSubmit} noValidate className="mt-12">
            <FormField id="username" label="Nom d'utilisateur">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField id="password" label="Mot de passe">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${INPUT_CLASS} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-form-label transition hover:text-form-text"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </FormField>

            {error && (
              <p role="alert" className="text-sm text-form-error">
                {error}
              </p>
            )}

            <div className="my-[18px] py-[17px] text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-none border border-form-button bg-form-button px-6 py-3 font-sans text-base leading-4 font-bold text-white transition duration-150 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? 'Connexion…' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
