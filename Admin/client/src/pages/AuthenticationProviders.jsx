import React, { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'

const MODES = [
  { id: 'NORMAL', label: 'Normal sign up', help: 'Email + password only (no OTP, no mobile).' },
  { id: 'EMAIL', label: 'Email OTP', help: 'Verify with email OTP, then set password.' },
  { id: 'MOBILE', label: 'Mobile OTP', help: 'Verify with mobile OTP (SMS), then set password.' },
  { id: 'BOTH', label: 'Email or Mobile OTP', help: 'User can verify with either email or mobile OTP.' },
]

const MASK = '********'

const DEFAULT_SMTP_INSTRUCTIONS = `1. Use a real mailbox you control (example: Gmail). The app will send OTP emails from this account.

2. Open Google Account settings:
   https://myaccount.google.com/
   Sign in with the same Gmail you want to use.

3. Turn ON 2‑Step Verification (required for App Password):
   - Click Security (left menu)
   - Under “How you sign in to Google” → 2‑Step Verification
   - Click Get started → complete setup (phone / authenticator)

4. Create an App Password (this becomes USER_MAIL_PASSWORD):
   https://myaccount.google.com/apppasswords
   - Select app → Mail
   - Select device → Other (Custom name) → type “Rankwell OTP”
   - Generate → copy the 16‑character password (may include spaces)
   - Paste into USER_MAIL_PASSWORD (not your normal Gmail password)

5. Recommended Gmail settings:
   - USER_MAIL_HOST: smtp.gmail.com
   - USER_MAIL_PORT: 587 (STARTTLS)
   - USER_MAIL_USERNAME: your full email address
   - USER_MAIL_SMTP_AUTH: true
   - USER_MAIL_SMTP_STARTTLS: true

Notes:
- If USER_MAIL_PASSWORD shows ********, it is already saved — paste a new value only when you want to rotate it.
- For corporate SMTP (Microsoft 365, SendGrid, SES, etc.), use the provider’s SMTP host/port and an app password / API key (as SMTP password).`

const DEFAULT_TWILIO_INSTRUCTIONS = `1. Create a Twilio account (or sign in):
   https://www.twilio.com/try-twilio

2. Open Twilio Console Dashboard:
   https://console.twilio.com/

3. Get Account SID + Auth Token:
   - In Console, find “Account Info”
   - Copy Account SID → USER_TWILIO_ACCOUNT_SID
   - Reveal/copy Auth Token → USER_TWILIO_AUTH_TOKEN

4. Get a Twilio phone number (this becomes USER_TWILIO_FROM_NUMBER):
   - Console → Phone Numbers → Manage → Buy a number
   - Choose SMS-capable number → buy
   - Use full E.164 format (example: +12184004870)

5. Country code default (optional):
   - USER_TWILIO_DEFAULT_COUNTRY_CODE: +91 (or your default)

Notes:
- For trial accounts, you may need to verify recipient numbers in Twilio before sending SMS.
- If USER_TWILIO_AUTH_TOKEN shows ********, it is already saved — paste a new value only when you want to rotate it.`

const IconMail = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5Z"
      opacity="0.08"
    />
    <path
      fill="#EA4335"
      d="M20 7.2 12.7 12.3a1.2 1.2 0 0 1-1.4 0L4 7.2V6.6A2.6 2.6 0 0 1 6.6 4h10.8A2.6 2.6 0 0 1 20 6.6v.6Z"
      opacity="0.18"
    />
    <path
      fill="currentColor"
      d="M6.6 4h10.8A2.6 2.6 0 0 1 20 6.6v10.8A2.6 2.6 0 0 1 17.4 20H6.6A2.6 2.6 0 0 1 4 17.4V6.6A2.6 2.6 0 0 1 6.6 4Zm0 1.6a1 1 0 0 0-1 1v.15l6.6 4.58a.4.4 0 0 0 .46 0L19.4 6.75V6.6a1 1 0 0 0-1-1H6.6Zm12.8 3.08-5.8 4.02a2 2 0 0 1-2.28 0L5.6 8.68v8.72a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V8.68Z"
    />
  </svg>
)

const IconTwilio = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#F22F46" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
    <circle cx="9" cy="9.2" r="2.2" fill="#fff" />
    <circle cx="15" cy="9.2" r="2.2" fill="#fff" />
    <circle cx="9" cy="14.8" r="2.2" fill="#fff" />
    <circle cx="15" cy="14.8" r="2.2" fill="#fff" />
  </svg>
)

export default function AuthenticationProviders() {
  const [mode, setMode] = useState('BOTH')
  const [comm, setComm] = useState({
    USER_MAIL_HOST: '',
    USER_MAIL_PORT: '',
    USER_MAIL_USERNAME: '',
    USER_MAIL_PASSWORD: '',
    USER_MAIL_SMTP_AUTH: 'true',
    USER_MAIL_SMTP_STARTTLS: 'true',
    USER_TWILIO_ENABLED: 'false',
    USER_TWILIO_ACCOUNT_SID: '',
    USER_TWILIO_AUTH_TOKEN: '',
    USER_TWILIO_FROM_NUMBER: '',
    USER_TWILIO_DEFAULT_COUNTRY_CODE: '+91',
    USER_MAIL_INSTRUCTIONS: '',
    USER_TWILIO_INSTRUCTIONS: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingInstructions, setSavingInstructions] = useState({ smtp: false, twilio: false })
  const [instructionsDirty, setInstructionsDirty] = useState({ smtp: false, twilio: false })
  const [instructionsOpen, setInstructionsOpen] = useState({ smtp: false, twilio: false })
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState({ smtp: false, twilio: false })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([api.get('/admin/signup-auth'), api.get('/admin/user-comm-config')])
      .then(([authRes, commRes]) => {
        if (!mounted) return
        const m = authRes?.data?.mode
        if (typeof m === 'string' && m.trim()) setMode(m.trim().toUpperCase())
        setComm((prev) => ({
          ...prev,
          USER_MAIL_HOST: String(commRes?.data?.USER_MAIL_HOST || ''),
          USER_MAIL_PORT: String(commRes?.data?.USER_MAIL_PORT || ''),
          USER_MAIL_USERNAME: String(commRes?.data?.USER_MAIL_USERNAME || ''),
          USER_MAIL_PASSWORD: String(commRes?.data?.USER_MAIL_PASSWORD || ''),
          USER_MAIL_SMTP_AUTH: String(commRes?.data?.USER_MAIL_SMTP_AUTH || 'true'),
          USER_MAIL_SMTP_STARTTLS: String(commRes?.data?.USER_MAIL_SMTP_STARTTLS || 'true'),
          USER_TWILIO_ENABLED: String(commRes?.data?.USER_TWILIO_ENABLED || 'false'),
          USER_TWILIO_ACCOUNT_SID: String(commRes?.data?.USER_TWILIO_ACCOUNT_SID || ''),
          USER_TWILIO_AUTH_TOKEN: String(commRes?.data?.USER_TWILIO_AUTH_TOKEN || ''),
          USER_TWILIO_FROM_NUMBER: String(commRes?.data?.USER_TWILIO_FROM_NUMBER || ''),
          USER_TWILIO_DEFAULT_COUNTRY_CODE: String(commRes?.data?.USER_TWILIO_DEFAULT_COUNTRY_CODE || '+91'),
          USER_MAIL_INSTRUCTIONS: String(commRes?.data?.USER_MAIL_INSTRUCTIONS || DEFAULT_SMTP_INSTRUCTIONS),
          USER_TWILIO_INSTRUCTIONS: String(commRes?.data?.USER_TWILIO_INSTRUCTIONS || DEFAULT_TWILIO_INSTRUCTIONS),
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
      const [authRes] = await Promise.all([
        api.post('/admin/signup-auth', { mode }),
        api.post('/admin/user-comm-config', comm),
      ])
      setMessage(`Saved: ${authRes?.data?.mode || mode}`)
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveInstructionsOnly = async (kind) => {
    setSavingInstructions((p) => ({ ...p, [kind]: true }))
    setMessage(null)
    setError(null)
    try {
      // Persist the already-committed value from `comm`.
      // Editing uses a draft; only clicking "Done" commits draft into `comm`.
      const patch =
        kind === 'smtp'
          ? { USER_MAIL_INSTRUCTIONS: String(comm.USER_MAIL_INSTRUCTIONS ?? '') }
          : { USER_TWILIO_INSTRUCTIONS: String(comm.USER_TWILIO_INSTRUCTIONS ?? '') }
      const res = await api.post('/admin/user-comm-config', { ...comm, ...patch })
      setComm((prev) => ({
        ...prev,
        USER_MAIL_INSTRUCTIONS: String(res?.data?.USER_MAIL_INSTRUCTIONS ?? prev.USER_MAIL_INSTRUCTIONS ?? ''),
        USER_TWILIO_INSTRUCTIONS: String(res?.data?.USER_TWILIO_INSTRUCTIONS ?? prev.USER_TWILIO_INSTRUCTIONS ?? ''),
      }))
      setMessage('Instructions saved.')
      setInstructionsDirty((p) => ({ ...p, [kind]: false }))
    } catch (e) {
      setError(e?.response?.data || e?.message || 'Failed to save instructions')
    } finally {
      setSavingInstructions((p) => ({ ...p, [kind]: false }))
    }
  }

  const setCommField = (key) => (eOrValue) => {
    const value = typeof eOrValue === 'string' ? eOrValue : eOrValue?.target?.value ?? ''
    setComm((p) => ({ ...p, [key]: value }))
  }

  const Field = ({ label, value, onChange, placeholder, sensitive }) => (
    <label className="block">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={onChange}
        onFocus={() => {
          // When backend returns masked secrets, clear on focus so paste/typing replaces the mask.
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
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        type={sensitive ? 'password' : 'text'}
      />
      {sensitive && value === MASK ? (
        <p className="mt-1 text-xs text-slate-500">Value is masked. Paste a new value to update.</p>
      ) : null}
    </label>
  )

  const Instructions = ({ label, value, onChange, kind, defaultValue }) => {
    const isEditing = Boolean(editing?.[kind])
    const isOpen = Boolean(instructionsOpen?.[kind])
    const textareaRef = useRef(null)
    const [draft, setDraft] = useState(value || '')

    // Keep draft in sync with server/state when not editing.
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

    // Reset draft back to the currently-saved value (latest saved), not the built-in template.
    const resetDraftToSaved = () => {
      setDraft(String(value ?? ''))
    }

    // Optional: load the original template only when explicitly requested.
    const loadTemplate = () => {
      setDraft(String(defaultValue ?? ''))
    }

    const toggleEdit = () => {
      if (isEditing) {
        commitDraft()
        setEditing((p) => ({ ...p, [kind]: false }))
        return
      }
      setEditing((p) => ({ ...p, [kind]: true }))
      queueMicrotask(() => textareaRef.current?.focus?.())
    }

    const handleSaveInstructions = async () => {
      await saveInstructionsOnly(kind)
    }

    return (
      <details
        className="group mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
        open={isOpen}
      >
        <summary
          className="cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden"
          onClick={(e) => {
            // Fully control open/close. Prevent native toggling and toggle state ourselves.
            e.preventDefault()
            setInstructionsOpen((p) => ({ ...p, [kind]: !Boolean(p?.[kind]) }))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setInstructionsOpen((p) => ({ ...p, [kind]: !Boolean(p?.[kind]) }))
            }
          }}
        >
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
              <p className="text-sm font-medium text-slate-800">{label}</p>
            </div>
            <p className="text-xs text-slate-500">Click to {`open / close`}</p>
          </div>
        </summary>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
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
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSaveInstructions()
              }}
              // Force order: Edit → (Reset/Type) → Done (commit) → Save instructions (persist)
              disabled={isEditing || savingInstructions?.[kind]}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                instructionsDirty?.[kind]
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
              title="Save only the instructions text"
            >
              {savingInstructions?.[kind] ? 'Saving…' : 'Save instructions'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                resetDraftToSaved()
              }}
              disabled={!isEditing}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Discard draft and revert to latest saved text"
            >
              Reset changes
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                loadTemplate()
              }}
              disabled={!isEditing}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Load the original default template"
            >
              Load template
            </button>
          </div>

          <textarea
            value={effectiveValue}
            ref={textareaRef}
            onChange={isEditing ? (e) => setDraft(e?.target?.value ?? '') : undefined}
            readOnly={!isEditing}
            spellCheck={false}
            className={`mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs leading-relaxed text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 ${
              isEditing ? 'bg-white focus:border-slate-400' : 'bg-slate-100/60'
            }`}
            rows={12}
          />
          <p className="mt-2 text-xs text-slate-600">
            Tip: click <span className="font-medium">Done</span> to apply edits, then{' '}
            <span className="font-medium">Save instructions</span> to persist.
          </p>
        </div>
      </details>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="relative flex items-start justify-center">
        <h2 className="absolute left-1/2 top-0 -translate-x-1/2 text-lg font-semibold tracking-tight text-slate-900 text-center">
          Authentication Setup Options
        </h2>
      </div>

      {message ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{String(error)}</div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6">
        {/* <section className="rounded-xl border border-slate-200 bg-white p-5"> */}
          {/* <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Signup verification</h3>
              <p className="mt-1 text-sm text-slate-600">Choose how users verify their identity while signing up.</p>
            </div>
            {loading ? <span className="text-xs text-slate-500">Loading…</span> : <span className="text-xs text-slate-500">Current: {mode}</span>}
          </div> */}

          <div className="mt-4 grid grid-cols-1 gap-3">
            {MODES.map((m) => {
              const inputId = `signupMode-${m.id}`
              return (
                <div
                  key={m.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    mode === m.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={inputId}
                      type="radio"
                      name="signupMode"
                      value={m.id}
                      checked={mode === m.id}
                      onChange={() => setMode(m.id)}
                      className="mt-1 h-4 w-4 accent-slate-900"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-7">
                        <label
                          htmlFor={inputId}
                          className="cursor-pointer text-sm font-semibold text-slate-900"
                        >
                          {m.label}
                        </label>
                      {mode === m.id ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleSave()
                          }}
                          disabled={loading || saving}
                          className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ml-[600px]"
                        >
                          {saving ? 'Saving…' : 'Save changes'}
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{m.help}</p>

                    {mode === m.id && (m.id === 'EMAIL' || m.id === 'BOTH') ? (
                      <details className="group mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/60">
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
                              <IconMail />
                              <p className="text-sm font-semibold text-slate-900">Mail Server Configration</p>
                            </div>
                            {/* <span className="text-xs text-slate-500">SMTP</span> */}
                          </div>
                        </summary>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field
                            label="USER_MAIL_HOST"
                            value={comm.USER_MAIL_HOST}
                            onChange={setCommField('USER_MAIL_HOST')}
                            placeholder="smtp.gmail.com"
                          />
                          <Field
                            label="USER_MAIL_PORT"
                            value={comm.USER_MAIL_PORT}
                            onChange={setCommField('USER_MAIL_PORT')}
                            placeholder="587"
                          />
                          <Field
                            label="USER_MAIL_USERNAME"
                            value={comm.USER_MAIL_USERNAME}
                            onChange={setCommField('USER_MAIL_USERNAME')}
                            placeholder="your@email.com"
                          />
                          <Field
                            label="USER_MAIL_PASSWORD"
                            value={comm.USER_MAIL_PASSWORD}
                            onChange={setCommField('USER_MAIL_PASSWORD')}
                            placeholder={MASK}
                            sensitive
                          />
                          <Field
                            label="USER_MAIL_SMTP_AUTH"
                            value={comm.USER_MAIL_SMTP_AUTH}
                            onChange={setCommField('USER_MAIL_SMTP_AUTH')}
                            placeholder="true"
                          />
                          <Field
                            label="USER_MAIL_SMTP_STARTTLS"
                            value={comm.USER_MAIL_SMTP_STARTTLS}
                            onChange={setCommField('USER_MAIL_SMTP_STARTTLS')}
                            placeholder="true"
                          />
                        </div>

                        <Instructions
                          label="SMTP instructions (editable)"
                          kind="smtp"
                          value={comm.USER_MAIL_INSTRUCTIONS}
                          onChange={setCommField('USER_MAIL_INSTRUCTIONS')}
                          defaultValue={DEFAULT_SMTP_INSTRUCTIONS}
                        />
                      </details>
                    ) : null}

                    {mode === m.id && (m.id === 'MOBILE' || m.id === 'BOTH') ? (
                      <details className="group mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/60">
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
                              <IconTwilio />
                              <p className="text-sm font-semibold text-slate-900">SMS Service Configration</p>
                            </div>
                            {/* <span className="text-xs text-slate-500">Twilio</span> */}
                          </div>
                        </summary>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field
                            label="USER_TWILIO_ENABLED"
                            value={comm.USER_TWILIO_ENABLED}
                            onChange={setCommField('USER_TWILIO_ENABLED')}
                            placeholder="true"
                          />
                          <Field
                            label="USER_TWILIO_ACCOUNT_SID"
                            value={comm.USER_TWILIO_ACCOUNT_SID}
                            onChange={setCommField('USER_TWILIO_ACCOUNT_SID')}
                            placeholder="AC..."
                          />
                          <Field
                            label="USER_TWILIO_AUTH_TOKEN"
                            value={comm.USER_TWILIO_AUTH_TOKEN}
                            onChange={setCommField('USER_TWILIO_AUTH_TOKEN')}
                            placeholder={MASK}
                            sensitive
                          />
                          <Field
                            label="USER_TWILIO_FROM_NUMBER"
                            value={comm.USER_TWILIO_FROM_NUMBER}
                            onChange={setCommField('USER_TWILIO_FROM_NUMBER')}
                            placeholder="+12184004870"
                          />
                          <Field
                            label="USER_TWILIO_DEFAULT_COUNTRY_CODE"
                            value={comm.USER_TWILIO_DEFAULT_COUNTRY_CODE}
                            onChange={setCommField('USER_TWILIO_DEFAULT_COUNTRY_CODE')}
                            placeholder="+91"
                          />
                        </div>

                        <Instructions
                          label="Twilio instructions (editable)"
                          kind="twilio"
                          value={comm.USER_TWILIO_INSTRUCTIONS}
                          onChange={setCommField('USER_TWILIO_INSTRUCTIONS')}
                          defaultValue={DEFAULT_TWILIO_INSTRUCTIONS}
                        />
                      </details>
                    ) : null}

                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        {/* </section> */}
      </div>
    </div>
  )
}

