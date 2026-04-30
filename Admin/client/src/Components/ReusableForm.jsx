import { useState, useEffect } from 'react'

function normalizeInitials(initialValues, fields) {
  const base = {
    name: '',
    email: '',
    password: '',
    role: '',
    departments: [],
    ...initialValues,
  }
  let deps = base.departments
  if (Array.isArray(deps) && deps.length > 0 && typeof deps[0] === 'object' && deps[0] !== null) {
    deps = deps.map((d) => String(d.id ?? d))
  } else if (!Array.isArray(deps)) {
    deps = []
  } else {
    deps = deps.map(String)
  }
  return { ...base, departments: deps }
}

export default function ReusableForm({
  initialValues = {},
  fields = [],
  onSubmit,
  onCancel,
  buttonLabel = 'Submit',
  cancelButtonLabel = 'Cancel',
  res,
}) {
  const [values, setValues] = useState(() => normalizeInitials(initialValues, fields))

  useEffect(() => {
    setValues(normalizeInitials(initialValues, fields))
  }, [JSON.stringify(initialValues)])

  const setField = (name, value) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'role' && value === 'HR') next.departments = []
      return next
    })
  }

  const toggleDept = (fieldName, optionValue, checked) => {
    const v = String(optionValue)
    setValues((prev) => {
      const set = new Set(prev[fieldName] || [])
      if (checked) set.add(v)
      else set.delete(v)
      return { ...prev, [fieldName]: Array.from(set) }
    })
  }

  return (
    <form
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit(values)
      }}
    >
      {fields.map((field) => {
        if (field.hide?.(values)) return null

        if (field.type === 'checkbox') {
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <div className="flex flex-wrap gap-3">
                {field.options?.map((opt) => (
                  <label key={String(opt.value)} className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={(values[field.name] || []).includes(String(opt.value))}
                      onChange={(e) => toggleDept(field.name, opt.value, e.target.checked)}
                      disabled={field.readOnly}
                      className="rounded border-gray-300"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )
        }

        if (field.type === 'select') {
          return (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <select
                value={values[field.name] ?? ''}
                disabled={field.readOnly}
                onChange={(e) => setField(field.name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">{field.placeholder || 'Select…'}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )
        }

        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            <input
              type={field.type || 'text'}
              readOnly={field.readOnly}
              placeholder={field.placeholder}
              value={values[field.name] ?? ''}
              onChange={(e) => setField(field.name, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white read-only:bg-gray-50"
            />
          </div>
        )
      })}

      {res != null && res !== '' && (
        <p className="text-sm text-green-700 break-words">
          {typeof res === 'string' ? res : JSON.stringify(res)}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
          {buttonLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg text-sm font-medium"
        >
          {cancelButtonLabel}
        </button>
      </div>
    </form>
  )
}
