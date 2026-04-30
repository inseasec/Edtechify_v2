import React, { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { showErrorToast, showSuccessToast } from '@/utils/toastUtils'

export default function CareersSettingsPanel() {
  const [settings, setSettings] = useState({
    applyingFor: '',
    description: '',
    roleType: '',
  })
  const [loading, setLoading] = useState(false)
  const [savedList, setSavedList] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [filterType, setFilterType] = useState('ALL')

  const fetchSavedData = async () => {
    try {
      const response = await api.get('/applyfor/getAllJobs')
      setSavedList(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error(error.response?.data || error.message)
      showErrorToast('Failed to load saved roles')
    }
  }

  useEffect(() => {
    fetchSavedData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'roleType') {
      const normalized = value.toUpperCase()
      setSettings((prev) => ({ ...prev, roleType: normalized }))
      if (filterType === 'ALL') setFilterType(normalized)
      return
    }
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setSettings({ applyingFor: '', description: '', roleType: '' })
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!settings.applyingFor.trim() || !settings.description.trim() || !settings.roleType) return
    if (editingId) return

    setLoading(true)
    try {
      await api.post('/applyfor/create', settings)
      showSuccessToast('Saved successfully')
      resetForm()
      fetchSavedData()
    } catch (error) {
      console.error(error.response?.data || error.message)
      showErrorToast('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!settings.applyingFor.trim() || !settings.description.trim() || !settings.roleType) return
    if (!editingId) return

    setLoading(true)
    try {
      await api.put(`/applyfor/updateById/${editingId}`, settings)
      showSuccessToast('Updated successfully')
      resetForm()
      fetchSavedData()
    } catch (error) {
      console.error(error.response?.data || error.message)
      showErrorToast('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/applyfor/deleteById/${id}`)
      showSuccessToast('Deleted successfully')
      if (editingId === id) resetForm()
      fetchSavedData()
    } catch (error) {
      console.error(error.response?.data || error.message)
      showErrorToast('Something went wrong')
    }
  }

  const filteredList = useMemo(() => {
    if (filterType === 'ALL') return savedList
    return savedList.filter((item) => (item.roleType || '').toUpperCase() === filterType)
  }, [filterType, savedList])

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="mx-auto max-w-6xl px-2 pt-4">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Career Settings</h2>
        <hr className="mt-4 mb-6" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="roleType"
                value={settings.roleType}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select Category</option>
                <option value="TECH">Teching</option>
                <option value="NON_TECH">Non-Teching</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                name="applyingFor"
                value={settings.applyingFor}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                className="w-full border rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={settings.description}
                onChange={handleChange}
                placeholder="Describe what the candidate should talk about..."
                rows={4}
                className="w-full border rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex justify-center items-center">
              <button
                type="button"
                onClick={editingId ? handleUpdate : handleSave}
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (editingId ? 'Updating...' : 'Saving...') : editingId ? 'Update' : 'Save'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="ml-3 text-sm text-gray-500 hover:underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {savedList.length > 0 && (
            <div className="bg-white border rounded-xl p-6 shadow-sm max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Saved Roles</h3>
                <div className="w-full sm:w-60">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Category
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value.toUpperCase())}
                    className="w-full border rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="ALL">All</option>
                    <option value="TECH">Teching</option>
                    <option value="NON_TECH">Non-Teching</option>
                  </select>
                </div>
              </div>

              <table className="mt-4 w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2">Role</th>
                    <th className="border-b px-4 py-2">Description</th>
                    <th className="border-b px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item, index) => {
                    const id = item?._id ?? item?.id ?? index
                    const rowActive = editingId === id
                    return (
                      <tr key={id} className={`hover:bg-gray-50 ${rowActive ? 'bg-gray-100' : ''}`}>
                        <td className="border-b px-4 py-2">{item?.applyingFor}</td>
                        <td className="border-b px-4 py-2">{item?.description}</td>
                        <td className="border-b px-4 py-2 text-center">
                          <div className="flex justify-center items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSettings({
                                  applyingFor: item?.applyingFor ?? '',
                                  description: item?.description ?? '',
                                  roleType: (item?.roleType ?? '').toUpperCase(),
                                })
                                setEditingId(id)
                              }}
                              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                              aria-label="Edit"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                              aria-label="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

