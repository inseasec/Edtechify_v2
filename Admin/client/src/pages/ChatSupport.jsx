import { useState, useEffect, useCallback } from 'react'
import { Headset, Info, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import { showErrorToast, showSuccessToast } from '@/utils/toastUtils'

/** Backend paths (Spring): base URL should be origin only, e.g. http://localhost:8080 */
const CHATBOT_GET = '/api/chatbot/get'
const CHATBOT_SAVE = '/api/chatbot/save'

const emptyConfig = () => ({
  mobileNo: '',
  whatsappEnabled: false,
  talkToEnabled: false,
  talkToKey: '',
  email: '',
  password: '',
})

const normalizeConfig = (raw) => {
  if (!raw || typeof raw !== 'object') return emptyConfig()
  return {
    mobileNo: raw.mobileNo ?? '',
    whatsappEnabled: Boolean(raw.whatsappEnabled),
    talkToEnabled: Boolean(raw.talkToEnabled),
    talkToKey: raw.talkToKey ?? '',
    email: raw.email ?? '',
    password: raw.password ?? '',
  }
}

const extractTawkKey = (value) => {
  const v = String(value || '').trim()
  // Accept:
  // - https://embed.tawk.to/{propertyId}/{widgetId}
  // - https://tawk.to/chat/{propertyId}/{widgetId}
  // - {propertyId}/{widgetId}
  const embed = v.match(/embed\.tawk\.to\/([^?\s"'<>]+)/i)
  if (embed?.[1]) return embed[1].replace(/^\/+/, '').replace(/\/+$/, '')
  const chat = v.match(/tawk\.to\/chat\/([^?\s"'<>]+)/i)
  if (chat?.[1]) return chat[1].replace(/^\/+/, '').replace(/\/+$/, '')
  return v.replace(/^\/+/, '').replace(/\/+$/, '')
}

export default function ChatSupport() {
  const [config, setConfig] = useState(emptyConfig)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const patchConfig = useCallback((updates) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetchConfig = async () => {
      try {
        setFetching(true)
        const res = await api.get(CHATBOT_GET)
        const body = res.data?.data ?? res.data
        if (!cancelled) setConfig(normalizeConfig(body))
      } catch (err) {
        console.error('Chat config fetch failed', err)
        if (!cancelled) showErrorToast(err?.response?.data?.message || 'Could not load chat configuration')
      } finally {
        if (!cancelled) setFetching(false)
      }
    }
    fetchConfig()
    return () => {
      cancelled = true
    }
  }, [])

  const handleToggleChange = (e) => {
    const { name, checked } = e.target
    patchConfig({ [name]: checked })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await api.post(CHATBOT_SAVE, config)
      showSuccessToast('Config saved successfully')
    } catch (err) {
      console.error(err)
      showErrorToast(err?.response?.data?.message || 'Error saving config')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'border border-gray-200 rounded-lg px-4 py-2 w-full min-w-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm'

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Chat Configuration</h3>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || fetching}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 shrink-0"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {fetching ? (
          <p className="text-sm text-gray-500 py-8">Loading configuration…</p>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 overflow-x-auto">
              <div className="min-w-[640px] sm:min-w-0">
                <div className="grid grid-cols-[1.2fr_1.5fr_1.5fr_2fr_1fr] gap-3 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-3 mb-4">
                  <span>Name</span>
                  <span className="text-center">Email</span>
                  <span className="text-center">Password</span>
                  <span className="text-center">Tawk.to Key</span>
                  <span className="text-center">Active</span>
                </div>

                <div className="grid grid-cols-[1.2fr_1.5fr_1.5fr_2fr_1fr] items-center gap-3 sm:gap-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-red-500 rounded-full text-white h-8 w-8 flex justify-center items-center shrink-0">
                      <Headset className="h-4 w-4" aria-hidden />
                    </div>
                    <span className="font-medium text-sm truncate">Tawk.to</span>
                  </div>

                  <input
                    type="email"
                    autoComplete="off"
                    value={config.email}
                    placeholder="Enter email"
                    onChange={(e) => patchConfig({ email: e.target.value })}
                    className={inputClass}
                  />

                  <div className="relative w-full min-w-0">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={config.password}
                      placeholder="Enter password"
                      onChange={(e) => patchConfig({ password: e.target.value })}
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="text"
                      value={config.talkToKey}
                      placeholder="Paste Tawk.to key or embed URL…"
                      onChange={(e) =>
                        patchConfig({
                          talkToKey: extractTawkKey(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowInfo(true)}
                      className="text-gray-500 hover:text-gray-800 shrink-0 p-1 rounded"
                      aria-label="How to get Tawk.to key"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <label className="relative inline-block w-11 h-6 cursor-pointer">
                      <input
                        type="checkbox"
                        name="talkToEnabled"
                        checked={config.talkToEnabled}
                        onChange={handleToggleChange}
                        className="peer sr-only"
                      />
                      <span className="absolute inset-0 bg-gray-300 rounded-full transition peer-checked:bg-green-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400" />
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] gap-4 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-3 mb-4">
                <span>Name</span>
                <span>Phone number</span>
                <span className="sm:text-right sm:pr-4">Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt=""
                    className="w-8 h-8 shrink-0"
                  />
                  <span className="font-medium">WhatsApp</span>
                </div>

                <input
                  type="tel"
                  inputMode="tel"
                  value={config.mobileNo}
                  placeholder="e.g. +91 9876543210"
                  onChange={(e) => patchConfig({ mobileNo: e.target.value })}
                  className={inputClass + ' sm:max-w-md'}
                />

                <div className="flex sm:justify-end sm:pr-2">
                  <label className="relative inline-block w-11 h-6 cursor-pointer">
                    <input
                      type="checkbox"
                      name="whatsappEnabled"
                      checked={config.whatsappEnabled}
                      onChange={handleToggleChange}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 bg-gray-300 rounded-full transition peer-checked:bg-green-500 peer-focus-visible:ring-2 peer-focus-visible:ring-green-500" />
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5" />
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tawk-help-title"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-black text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>

            <h2 id="tawk-help-title" className="text-xl font-bold text-gray-800 mb-1 pr-8">
              Get Your Tawk.to Key
            </h2>
            <p className="text-sm text-gray-500 mb-4">Follow these steps to connect live chat:</p>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex gap-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  Open Tawk.to website
                  <div>
                    <a
                      href="https://www.tawk.to"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-xs"
                    >
                      Visit Tawk.to
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
                  2
                </div>
                <div>Sign up or log in to your account</div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  Click on <span className="font-semibold text-black">Live Chat</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
                  4
                </div>
                <div>
                  Enter your:
                  <ul className="list-disc ml-5 text-xs text-gray-600 mt-1">
                    <li>Website URL (localhost is fine)</li>
                    <li>Organization name</li>
                    <li>Set up your account and save</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
                  5
                </div>
                <div>
                  Go to:
                  <div className="bg-gray-100 px-2 py-1 rounded text-xs mt-1 font-medium">
                    Dashboard → Settings → Chat Widget
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">
                  6
                </div>
                <div>
                  Copy the direct chat link key from the widget code or dashboard, then paste the key
                  (or full embed URL) into the field here — we extract the key automatically.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-bold shrink-0">
                  ✓
                </div>
                <div>Paste it into the input field on this page</div>
              </div>
            </div>

            <div className="mt-5 text-xs text-gray-400 border-t pt-3">
              Do not invent a key manually — it must come from your Tawk.to account.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
