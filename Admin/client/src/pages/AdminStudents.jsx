import { useState, useMemo, useEffect, useCallback } from 'react'
import { KeyRound, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils'

const usersPerPage = 10

export default function AdminStudents() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [city] = useState('')
  const [state] = useState('')
  const [status, setStatus] = useState('Yes')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [invoices, setInvoices] = useState([])

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPw, setShowPw] = useState({ new: false, confirm: false })

  const baseUrl = window._CONFIG_.VITE_API_BASE_URL;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/users/getAllUsers')
      const raw = res.data?.data ?? res.data ?? []
      const list = Array.isArray(raw) ? raw : []
      setUsers(
        list.map((u) => ({
          ...u,
          frozen: u.frozen ?? u.freeze ?? false,
        })),
      )
    } catch (error) {
      console.error('Error fetching users:', error)
      showErrorToast(error?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await api.get('/invoice/getAllInvoices')
      const raw = res.data?.data ?? res.data ?? []
      setInvoices(Array.isArray(raw) ? raw : [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchInvoices()
  }, [fetchUsers, fetchInvoices])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, city, state, status])

  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()
    return users.filter((user) => {
      const searchMatch =
        !searchTerm ||
        user.userName?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        String(user.mobileNo ?? '')
          .toLowerCase()
          .includes(searchTerm)

      const cityMatch = !city || user.city?.toLowerCase() === city.toLowerCase()
      const stateMatch = !state || user.state?.toLowerCase() === state.toLowerCase()

      const userId = user.id ?? user._id
      const isPurchased = invoices.some((inv) => inv.users?.id === userId)
      const userStatus = isPurchased ? 'Yes' : 'No'

      return searchMatch && cityMatch && stateMatch && (status ? userStatus === status : true)
    })
  }, [users, invoices, search, city, state, status])

  useEffect(() => {
    const tp = Math.ceil(filteredUsers.length / usersPerPage)
    if (tp === 0) {
      setCurrentPage(1)
      return
    }
    setCurrentPage((p) => Math.min(p, tp))
  }, [filteredUsers.length])

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const handleChangePassword = async () => {
    if (!selectedUser) return
    if (form.newPassword !== form.confirmPassword) {
      showErrorToast('Passwords do not match')
      return
    }
    try {
      const res = await api.put(`/users/updatePassword/${selectedUser.id ?? selectedUser._id}`, {
        newPassword: form.newPassword,
      })
      setShowPasswordModal(false)
      setForm({ newPassword: '', confirmPassword: '' })
      setSelectedUser(null)

      const raw = res.data?.message ?? res.data
      const msg = typeof raw === 'string' ? raw : JSON.stringify(raw ?? '')
      if (msg.toLowerCase().includes('success')) {
        showSuccessToast(msg)
      } else {
        showErrorToast(msg || 'Update completed')
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === 'string' ? err.response.data : null) ??
        err?.message ??
        'Something went wrong'
      showErrorToast(String(errorMsg))
    }
  }

  const isUserPurchased = (userId) =>
    invoices.some((inv) => inv.users?.id === userId)

  const toggleUserFreeze = async (userId, currentFrozen) => {
    try {
      await api.put(`/users/admin/toggle-freeze/${userId}`)
      setUsers((prev) =>
        prev.map((u) =>
          (u.id ?? u._id) === userId ? { ...u, frozen: !currentFrozen } : u,
        ),
      )
    } catch (err) {
      console.error(err)
      showErrorToast(err?.response?.data?.message || 'Could not update freeze status')
    }
  }

  const avatarSrc = (userImg) =>
    userImg ? `${baseUrl}/${userImg}` : null

  return (
    <div className="bg-[#f3f4f6] min-h-screen -mx-4 sm:mx-0 sm:px-0">
      {/* <div className="flex justify-between items-center mb-3">
        <h3 className="text-2xl font-semibold text-gray-800">Students</h3>
      </div> */}

      <div className="bg-[#f7f7f7] border border-gray-200 mt-[1%] rounded-lg p-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-wrap items-center gap-3 lg:w-[35%]">
            <h2 className="text-sm font-medium uppercase text-gray-700">
              Clients enrolled
            </h2>
            <select
              className="border border-gray-300 bg-white px-2 py-1.5 rounded-md text-xs h-[30px]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Yes">Yes</option>
              <option value="">All</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2 lg:ml-8">
            <input
              type="text"
              placeholder="Search…"
              className="min-w-[200px] flex-1 max-w-md border border-black rounded-md px-2 py-1.5 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setStatus('Yes')
              }}
              className="bg-black text-white text-xs px-3 py-1.5 rounded-md hover:bg-gray-900"
            >
              Reset filters
            </button>
          </div>
          <p className="text-sm bg-black text-white font-semibold rounded-md px-3 py-2 lg:w-auto text-center">
            Showing {filteredUsers.length} applicants
          </p>
        </div>
      </div>

      <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-600">Loading…</div>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[#f9fafb] border-b text-gray-600">
              <tr>
                <th className="p-2.5 text-left font-medium">Name</th>
                <th className="p-2.5 text-left font-medium">Email</th>
                <th className="p-2.5 text-left font-medium">Phone</th>
                <th className="p-2.5 text-left font-medium">Password</th>
                <th className="p-2.5 text-left font-medium">Enable / Disable</th>
                <th className="p-2.5 text-left font-medium">Courses enrolled</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => {
                const uid = user.id ?? user._id
                return (
                  <tr key={uid} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        {avatarSrc(user.userImg) ? (
                          <img
                            src={avatarSrc(user.userImg)}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover shrink-0 bg-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                        )}
                        <span>{user.userName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2">{user.email}</td>
                    <td className="py-2 px-2">{user.mobileNo}</td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        className="text-gray-600 hover:text-blue-600 p-1"
                        onClick={() => {
                          setSelectedUser(user)
                          setForm({ newPassword: '', confirmPassword: '' })
                          setShowPasswordModal(true)
                        }}
                        aria-label="Change password"
                      >
                        <KeyRound className="h-5 w-5 ml-2" />
                      </button>
                    </td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => toggleUserFreeze(uid, user.frozen)}
                        className="inline-flex items-center justify-center p-1"
                        aria-label={user.frozen ? 'Unfreeze user' : 'Freeze user'}
                      >
                        {user.frozen ? (
                          <ToggleRight className="h-8 w-8 text-red-600" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-green-600" />
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-2">
                      {isUserPurchased(uid) ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">No</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="p-4 text-center text-gray-500">No users found</div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page ? 'bg-black text-white border-black' : 'border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}

      {showPasswordModal && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setShowPasswordModal(false)
            setSelectedUser(null)
          }}
        >
          <div
            className="bg-white p-6 rounded-2xl w-full max-w-[380px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-5 text-center text-gray-900">Change password</h2>
            <p className="text-xs text-gray-500 mb-3 text-center truncate">{selectedUser.email}</p>

            <div className="relative mb-4">
              <input
                type={showPw.new ? 'text' : 'password'}
                placeholder="New password"
                className="w-full p-2 border border-gray-300 rounded pr-10"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowPw((s) => ({ ...s, new: !s.new }))}
              >
                {showPw.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative mb-5">
              <input
                type={showPw.confirm ? 'text' : 'password'}
                placeholder="Confirm password"
                className="w-full p-2 border border-gray-300 rounded pr-10"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
              >
                {showPw.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
