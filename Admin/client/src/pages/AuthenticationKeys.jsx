import React, { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'

const MODES = [
  { id: 'MOBILE', label: 'Mobile OTP', help: 'Verify with mobile OTP (SMS), then set password.' },
  { id: 'BOTH', label: 'Email or Mobile OTP', help: 'User can verify with either email or mobile OTP.' },
]

const MASK = '********'

const DEFAULT_GOOGLE_INSTRUCTIONS = `How to create USER_GOOGLE_CLIENT_ID (Web client)

1. Open Google Cloud Console (Credentials):
   https://console.cloud.google.com/apis/credentials

2. Select your project (top bar) or create a new project.

3. Click Create credentials → OAuth client ID

4. If asked, configure the OAuth consent screen first, then come back to create the client.

5. For Application type, choose Web application.

6. Add your User frontend domain in Authorized JavaScript origins (scheme + domain + optional port; no path).
   - Local dev example: http://localhost:5173
   - Production example: https://your-user-domain.com

7. (Only if you use OAuth redirect flow) add Authorized redirect URIs.
   Redirect URIs must match exactly.
   - Example: https://your-api-domain.com/auth/google/callback
   - Example (local): http://localhost:8080/auth/google/callback

8. Copy the Client ID (ends with .apps.googleusercontent.com) and paste it into USER_GOOGLE_CLIENT_ID.`

const DEFAULT_FACEBOOK_INSTRUCTIONS = `How to create USER_FACEBOOK_APP_ID and USER_FACEBOOK_APP_SECRET

1. Open Meta for Developers:
   https://developers.facebook.com/

2. Go to My Apps → Create App.

3. Choose the correct use-case / app type, then create.

4. Add the Facebook Login product (Web).

5. In Settings → Basic:
   - Copy App ID → USER_FACEBOOK_APP_ID
   - Click Show and copy App Secret → USER_FACEBOOK_APP_SECRET

6. Configure OAuth redirect / valid domains as required by your deployment.`

const DEFAULT_GITHUB_INSTRUCTIONS = `How to create USER_GITHUB_CLIENT_ID and USER_GITHUB_CLIENT_SECRET

1. Open GitHub Developer settings:
   https://github.com/settings/developers

2. Create a new OAuth App.

3. Fill the app details (Homepage URL, Callback URL, etc.) as per your environment.

4. Copy Client ID → USER_GITHUB_CLIENT_ID

5. Generate a Client Secret → USER_GITHUB_CLIENT_SECRET`

const IconGoogle = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303C33.656 32.657 29.2 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.949 6.053 29.727 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691 12.88 19.51C14.659 15.108 18.965 12 24 12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.949 6.053 29.727 4 24 4c-7.682 0-14.347 4.328-17.694 10.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.102 0 10.188-1.95 13.83-5.593l-6.39-5.41C29.476 34.598 26.86 36 24 36c-5.176 0-9.61-3.318-11.264-7.946l-6.57 5.062C9.47 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-3.863 5.0l.003-.002 6.39 5.41C37.379 38.98 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
)

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.414c0-3.034 1.792-4.714 4.533-4.714 1.312 0 2.686.236 2.686.236v2.98h-1.513c-1.49 0-1.953.93-1.953 1.887v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
    />
  </svg>
)

const IconGithub = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 0C5.37 0 0 5.508 0 12.302c0 5.433 3.438 10.039 8.205 11.665.6.114.82-.268.82-.596 0-.295-.01-1.076-.016-2.112-3.338.746-4.042-1.65-4.042-1.65-.546-1.419-1.333-1.796-1.333-1.796-1.09-.766.082-.75.082-.75 1.205.087 1.84 1.27 1.84 1.27 1.07 1.87 2.807 1.33 3.492 1.016.108-.8.418-1.33.762-1.636-2.665-.312-5.467-1.368-5.467-6.086 0-1.345.465-2.444 1.235-3.306-.124-.313-.535-1.57.116-3.273 0 0 1.008-.332 3.3 1.263a11.21 11.21 0 0 1 3.006-.42c1.02.005 2.045.14 3.006.42 2.29-1.595 3.296-1.263 3.296-1.263.653 1.703.242 2.96.118 3.273.77.862 1.233 1.961 1.233 3.306 0 4.73-2.807 5.77-5.48 6.076.43.378.814 1.124.814 2.266 0 1.636-.015 2.955-.015 3.356 0 .331.216.716.825.595C20.565 22.336 24 17.732 24 12.302 24 5.508 18.627 0 12 0z"
    />
  </svg>
)

export default function AuthenticationKeys() {
  const [mode, setMode] = useState('BOTH')
  const [providers, setProviders] = useState({
    googleEnabled: true,
    facebookEnabled: true,
    githubEnabled: true,
  })
  const [socialOpen, setSocialOpen] = useState({
    google: false,
    facebook: false,
    github: false,
  })
  const [socialConfigOpen, setSocialConfigOpen] = useState({
    google: false,
    facebook: false,
    github: false,
  })
  const [oauth, setOauth] = useState({
    USER_GOOGLE_CLIENT_ID: '',
    USER_FACEBOOK_APP_ID: '',
    USER_FACEBOOK_APP_SECRET: '',
    USER_GITHUB_CLIENT_ID: '',
    USER_GITHUB_CLIENT_SECRET: '',
    USER_GOOGLE_INSTRUCTIONS: '',
    USER_FACEBOOK_INSTRUCTIONS: '',
    USER_GITHUB_INSTRUCTIONS: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingInstructions, setSavingInstructions] = useState({ google: false, facebook: false, github: false })
  const [instructionsDirty, setInstructionsDirty] = useState({ google: false, facebook: false, github: false })
  const [instructionsOpen, setInstructionsOpen] = useState({ google: false, facebook: false, github: false })
  const [editingInstructions, setEditingInstructions] = useState({ google: false, facebook: false, github: false })
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([api.get('/admin/signup-auth'), api.get('/admin/oauth-config')])
      .then(([authRes, oauthRes]) => {
        if (!mounted) return
        const m = authRes?.data?.mode
        if (typeof m === 'string' && m.trim()) setMode(m.trim().toUpperCase())
        setProviders({
          googleEnabled: Boolean(authRes?.data?.googleEnabled),
          facebookEnabled: Boolean(authRes?.data?.facebookEnabled),
          githubEnabled: Boolean(authRes?.data?.githubEnabled),
        })
        setOauth((prev) => ({
          ...prev,
          USER_GOOGLE_CLIENT_ID: String(oauthRes?.data?.USER_GOOGLE_CLIENT_ID || ''),
          USER_FACEBOOK_APP_ID: String(oauthRes?.data?.USER_FACEBOOK_APP_ID || ''),
          USER_FACEBOOK_APP_SECRET: String(oauthRes?.data?.USER_FACEBOOK_APP_SECRET || ''),
          USER_GITHUB_CLIENT_ID: String(oauthRes?.data?.USER_GITHUB_CLIENT_ID || ''),
          USER_GITHUB_CLIENT_SECRET: String(oauthRes?.data?.USER_GITHUB_CLIENT_SECRET || ''),
          USER_GOOGLE_INSTRUCTIONS: String(oauthRes?.data?.USER_GOOGLE_INSTRUCTIONS || DEFAULT_GOOGLE_INSTRUCTIONS),
          USER_FACEBOOK_INSTRUCTIONS: String(oauthRes?.data?.USER_FACEBOOK_INSTRUCTIONS || DEFAULT_FACEBOOK_INSTRUCTIONS),
          USER_GITHUB_INSTRUCTIONS: String(oauthRes?.data?.USER_GITHUB_INSTRUCTIONS || DEFAULT_GITHUB_INSTRUCTIONS),
        }))
        setError(null)
      })
      .catch((e) => {
        if (!mounted) return
        setError(e?.response?.data || e?.message || 'Failed to load settings')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await Promise.all([
        api.post('/admin/signup-auth', { mode, ...providers }),
        api.post('/admin/oauth-config', oauth),
      ])
      const enabled = [
        providers.googleEnabled ? 'Google' : null,
        providers.facebookEnabled ? 'Facebook' : null,
        providers.githubEnabled ? 'GitHub' : null,
      ].filter(Boolean)
      setMessage(
        enabled.length
          ? `Settings saved successfully. Enabled: ${enabled.join(', ')}.`
          : 'Settings saved successfully. All social providers are disabled.'
      )
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const setOauthField = (key) => (eOrValue) => {
    const value = typeof eOrValue === 'string' ? eOrValue : eOrValue?.target?.value ?? ''
    setOauth((p) => ({ ...p, [key]: value }))
  }

  const saveProviderInstructionsOnly = async (kind) => {
    setSavingInstructions((p) => ({ ...p, [kind]: true }))
    setMessage(null)
    setError(null)
    try {
      const patch =
        kind === 'google'
          ? { USER_GOOGLE_INSTRUCTIONS: String(oauth.USER_GOOGLE_INSTRUCTIONS ?? '') }
          : kind === 'facebook'
            ? { USER_FACEBOOK_INSTRUCTIONS: String(oauth.USER_FACEBOOK_INSTRUCTIONS ?? '') }
            : { USER_GITHUB_INSTRUCTIONS: String(oauth.USER_GITHUB_INSTRUCTIONS ?? '') }
      const res = await api.post('/admin/oauth-config', { ...oauth, ...patch })
      setOauth((prev) => ({
        ...prev,
        USER_GOOGLE_INSTRUCTIONS: String(res?.data?.USER_GOOGLE_INSTRUCTIONS ?? prev.USER_GOOGLE_INSTRUCTIONS ?? ''),
        USER_FACEBOOK_INSTRUCTIONS: String(res?.data?.USER_FACEBOOK_INSTRUCTIONS ?? prev.USER_FACEBOOK_INSTRUCTIONS ?? ''),
        USER_GITHUB_INSTRUCTIONS: String(res?.data?.USER_GITHUB_INSTRUCTIONS ?? prev.USER_GITHUB_INSTRUCTIONS ?? ''),
      }))
      setMessage('Instructions saved.')
      setInstructionsDirty((p) => ({ ...p, [kind]: false }))
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Failed to save instructions')
    } finally {
      setSavingInstructions((p) => ({ ...p, [kind]: false }))
    }
  }

  const InstructionsEditor = ({ kind, label, value, onChange, template }) => {
    const isOpen = Boolean(instructionsOpen?.[kind])
    const isEditing = Boolean(editingInstructions?.[kind])
    const textareaRef = useRef(null)
    const [draft, setDraft] = useState(value || '')

    useEffect(() => {
      if (!isEditing) setDraft(value || '')
    }, [isEditing, value])

    const effectiveValue = isEditing ? draft : value || ''

    const commitDraft = () => {
      const next = String(draft ?? '')
      if (next !== String(value ?? '')) {
        onChange(next)
        setInstructionsDirty((p) => ({ ...p, [kind]: true }))
      }
    }

    const toggleEdit = () => {
      if (isEditing) {
        commitDraft()
        setEditingInstructions((p) => ({ ...p, [kind]: false }))
        return
      }
      setEditingInstructions((p) => ({ ...p, [kind]: true }))
      queueMicrotask(() => textareaRef.current?.focus?.())
    }

    const resetDraftToSaved = () => setDraft(String(value ?? ''))
    const loadTemplate = () => setDraft(String(template ?? ''))

    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => {
            setInstructionsOpen((p) => {
              const next = !Boolean(p?.[kind])
              // Auto-close other instruction panels when opening one.
              return { google: false, facebook: false, github: false, [kind]: next }
            })
            // If closing, also exit edit mode for this panel.
            if (isOpen && isEditing) {
              setEditingInstructions((s) => ({ ...s, [kind]: false }))
            }
          }}
          className="w-full cursor-pointer select-none px-4 py-3 flex items-center justify-between gap-3"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-slate-800">{label}</p>
          </div>
          <p className="text-xs text-slate-500">Click to open / close</p>
        </button>

        {isOpen ? (
          <div className="px-4 pb-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleEdit()
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                saveProviderInstructionsOnly(kind)
              }}
              disabled={isEditing || savingInstructions?.[kind]}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                instructionsDirty?.[kind]
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {savingInstructions?.[kind] ? 'Saving…' : 'Save instructions'}
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                resetDraftToSaved()
              }}
              disabled={!isEditing}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset changes
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                loadTemplate()
              }}
              disabled={!isEditing}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load template
            </button>
          </div>

          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e?.target?.value ?? '')}
              spellCheck={false}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              rows={12}
            />
          ) : (
            <pre className="mt-3 w-full whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-100/60 px-3 py-2 text-xs leading-relaxed text-slate-800">
              {effectiveValue}
            </pre>
          )}
          <p className="mt-2 text-xs text-slate-600">
            Tip: click <span className="font-medium">Done</span> to apply edits, then{' '}
            <span className="font-medium">Save instructions</span> to persist.
          </p>
          </div>
        ) : null}
      </div>
    )
  }

  const ExternalLink = ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
    >
      {children}
    </a>
  )

  const Field = ({ label, value, onChange, placeholder, sensitive, disabled }) => (
    <label className="block">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => {
          if (sensitive && value === MASK) onChange('')
        }}
        onPaste={(e) => {
          if (!sensitive) return
          if (value !== MASK) return
          const text = e?.clipboardData?.getData?.('text')
          if (typeof text !== 'string') return
          e.preventDefault()
          onChange(text)
        }}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
        type={sensitive ? 'password' : 'text'}
      />
      {sensitive && value === MASK ? (
        <p className="mt-1 text-xs text-slate-500">
          Value is masked. Paste a new value to update.
        </p>
      ) : null}
    </label>
  )

  const ProviderCheckbox = ({ checked, onChange, label }) => (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-green-900"
      />
      <span>{label}</span>
    </label>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {/* <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M14 10a4 4 0 1 0-2.3 3.63L14 16h3v-2h2v-2h2v-2h-5.2l-1.25-1.26A4 4 0 0 0 14 10Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </span> */}
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 ml-[310px]">
          Social Login Providers
        </h2>
          </div>
          {/* <p className="mt-1 text-sm text-slate-600">
            Add or update Google, Facebook and GitHub keys used by the User app.
          </p> */}
        </div>
       
      </div>

      {message ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{String(error)}</div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6">
        {/* <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Signup verification</h3>
              <p className="mt-1 text-sm text-slate-600">Choose how users verify their identity while signing up.</p>
            </div>
            {loading ? <span className="text-xs text-slate-500">Loading…</span> : <span className="text-xs text-slate-500">Current: {mode}</span>}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <label
                key={m.id}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                  mode === m.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="signupMode"
                    value={m.id}
                    checked={mode === m.id}
                    onChange={() => setMode(m.id)}
                    className="mt-1 h-4 w-4 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                    <p className="mt-1 text-xs text-slate-600">{m.help}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section> */}

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          {/* <h3 className="text-center text-sm font-semibold text-slate-900">Social Provider</h3> */}
          {/* <p className="mt-1 text-sm text-slate-600">Turn social sign-in on/off for the User app.</p> */}

          <div className="mt-4 space-y-3">
            <details
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/60"
              open={socialOpen.google}
              onToggle={(e) => {
                const isOpen = e.currentTarget?.open ?? false
                setSocialOpen((s) => ({ ...s, google: isOpen }))
              }}
            >
              <summary className="cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <IconGoogle />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Google</p>
                      {/* <p className="mt-0.5 text-xs text-slate-600">One Tap / GIS</p> */}
                    </div>
                  </div>
                  <div onClick={(ev) => ev.stopPropagation()} onKeyDown={(ev) => ev.stopPropagation()}>
                    <ProviderCheckbox
                      checked={providers.googleEnabled}
                      onChange={() => {
                        const next = !providers.googleEnabled
                        setProviders((p) => ({ ...p, googleEnabled: next }))
                      }}
                      label={providers.googleEnabled ? 'Enabled' : 'Disabled'}
                    />
                  </div>
                </div>
              </summary>
              <div className="mt-4">
                {!providers.googleEnabled ? (
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Google login is currently <span className="font-semibold">disabled</span>. You can still view settings here.
                  </div>
                ) : null}
                <details
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/40 group-open:ring-2 group-open:ring-slate-200"
                  open={socialConfigOpen.google}
                  onToggle={(e) => {
                    const isOpen = e.currentTarget?.open ?? false
                    setSocialConfigOpen((s) => ({ ...s, google: isOpen }))
                  }}
                >
                    <summary className="cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm font-semibold text-slate-900">Google Server Configration</p>
                        </div>
                        <span className="text-xs text-slate-500">Keys</span>
                      </div>
                    </summary>

                    <div className="mt-4">
                      <Field
                        label="USER_GOOGLE_CLIENT_ID"
                        value={oauth.USER_GOOGLE_CLIENT_ID}
                        onChange={setOauthField('USER_GOOGLE_CLIENT_ID')}
                        placeholder="123...apps.googleusercontent.com"
                        disabled={!providers.googleEnabled}
                      />
                    </div>

                    <InstructionsEditor
                      kind="google"
                      label="Google instructions (editable)"
                      value={oauth.USER_GOOGLE_INSTRUCTIONS}
                      onChange={setOauthField('USER_GOOGLE_INSTRUCTIONS')}
                      template={DEFAULT_GOOGLE_INSTRUCTIONS}
                    />
                </details>
              </div>
            </details>

            <details
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/60"
              open={socialOpen.facebook}
              onToggle={(e) => {
                const isOpen = e.currentTarget?.open ?? false
                setSocialOpen((s) => ({ ...s, facebook: isOpen }))
              }}
            >
              <summary className="cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <IconFacebook />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Facebook</p>
                      {/* <p className="mt-0.5 text-xs text-slate-600">JS SDK</p> */}
                    </div>
                  </div>
                  <div onClick={(ev) => ev.stopPropagation()} onKeyDown={(ev) => ev.stopPropagation()}>
                    <ProviderCheckbox
                      checked={providers.facebookEnabled}
                      onChange={() => {
                        const next = !providers.facebookEnabled
                        setProviders((p) => ({ ...p, facebookEnabled: next }))
                      }}
                      label={providers.facebookEnabled ? 'Enabled' : 'Disabled'}
                    />
                  </div>
                </div>
              </summary>
              <div className="mt-4">
                {!providers.facebookEnabled ? (
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Facebook login is currently <span className="font-semibold">disabled</span>. You can still view settings here.
                  </div>
                ) : null}
                <details
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/40 group-open:ring-2 group-open:ring-slate-200"
                  open={socialConfigOpen.facebook}
                  onToggle={(e) => {
                    const isOpen = e.currentTarget?.open ?? false
                    setSocialConfigOpen((s) => ({ ...s, facebook: isOpen }))
                  }}
                >
                    <summary className="cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm font-semibold text-slate-900">Facebook Server Configration</p>
                        </div>
                        <span className="text-xs text-slate-500">Keys</span>
                      </div>
                    </summary>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="USER_FACEBOOK_APP_ID"
                        value={oauth.USER_FACEBOOK_APP_ID}
                        onChange={setOauthField('USER_FACEBOOK_APP_ID')}
                        placeholder="App ID"
                        disabled={!providers.facebookEnabled}
                      />
                      <Field
                        label="USER_FACEBOOK_APP_SECRET"
                        value={oauth.USER_FACEBOOK_APP_SECRET}
                        onChange={setOauthField('USER_FACEBOOK_APP_SECRET')}
                        placeholder="App Secret"
                        sensitive
                        disabled={!providers.facebookEnabled}
                      />
                    </div>

                    <InstructionsEditor
                      kind="facebook"
                      label="Facebook instructions (editable)"
                      value={oauth.USER_FACEBOOK_INSTRUCTIONS}
                      onChange={setOauthField('USER_FACEBOOK_INSTRUCTIONS')}
                      template={DEFAULT_FACEBOOK_INSTRUCTIONS}
                    />
                </details>
              </div>
            </details>

            <details
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/60"
              open={socialOpen.github}
              onToggle={(e) => {
                const isOpen = e.currentTarget?.open ?? false
                setSocialOpen((s) => ({ ...s, github: isOpen }))
              }}
            >
              <summary className="cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-900">
                      <IconGithub />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">GitHub</p>
                      {/* <p className="mt-0.5 text-xs text-slate-600">OAuth redirect</p> */}
                    </div>
                  </div>
                  <div onClick={(ev) => ev.stopPropagation()} onKeyDown={(ev) => ev.stopPropagation()}>
                    <ProviderCheckbox
                      checked={providers.githubEnabled}
                      onChange={() => {
                        const next = !providers.githubEnabled
                        setProviders((p) => ({ ...p, githubEnabled: next }))
                      }}
                      label={providers.githubEnabled ? 'Enabled' : 'Disabled'}
                    />
                  </div>
                </div>
              </summary>
              <div className="mt-4">
                {!providers.githubEnabled ? (
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    GitHub login is currently <span className="font-semibold">disabled</span>. You can still view settings here.
                  </div>
                ) : null}
                <details
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/40 group-open:ring-2 group-open:ring-slate-200"
                  open={socialConfigOpen.github}
                  onToggle={(e) => {
                    const isOpen = e.currentTarget?.open ?? false
                    setSocialConfigOpen((s) => ({ ...s, github: isOpen }))
                  }}
                >
                    <summary className="cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm font-semibold text-slate-900">GitHub Server Configration</p>
                        </div>
                        <span className="text-xs text-slate-500">Keys</span>
                      </div>
                    </summary>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="USER_GITHUB_CLIENT_ID"
                        value={oauth.USER_GITHUB_CLIENT_ID}
                        onChange={setOauthField('USER_GITHUB_CLIENT_ID')}
                        placeholder="Client ID"
                        disabled={!providers.githubEnabled}
                      />
                      <Field
                        label="USER_GITHUB_CLIENT_SECRET"
                        value={oauth.USER_GITHUB_CLIENT_SECRET}
                        onChange={setOauthField('USER_GITHUB_CLIENT_SECRET')}
                        placeholder="Client Secret"
                        sensitive
                        disabled={!providers.githubEnabled}
                      />
                    </div>

                    <InstructionsEditor
                      kind="github"
                      label="GitHub instructions (editable)"
                      value={oauth.USER_GITHUB_INSTRUCTIONS}
                      onChange={setOauthField('USER_GITHUB_INSTRUCTIONS')}
                      template={DEFAULT_GITHUB_INSTRUCTIONS}
                    />
                </details>
              </div>
            </details>
            
          </div>
        </section>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
          className="rounded-lg bg-slate-900 w-25 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ml-[85%] "
        >
          {saving ? 'Saving…' : 'Submit'}
        </button>
        {/* Google/Facebook/GitHub server configuration is shown inside Social providers cards */}
      </div>
    </div>
  )
}

