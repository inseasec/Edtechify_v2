import { useEffect, useState, useMemo } from 'react'
import {
  ToggleLeft,
  ToggleRight,
  Trash2,
  Pencil,
  KeyRound,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react'
import api from '@/lib/api'
import ReusableForm from '@/Components/ReusableForm'
import DeleteConfirmation from '@/utils/DeleteConfirmation'
import ShowAlert from '@/utils/showAlert'
import { showErrorToast, showSuccessToast } from '@/utils/toastUtils'

export default function AdminOverView() {
  const [update, setUpdate] = useState({
    name: '',
    email: '',
    role: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [adminRes, setAdminRes] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [password, setPassword] = useState({ newPassword: '', confirmPassword: '' })
  const [selectedAdminEmail, setSelectedAdminEmail] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)

  const [localAdmins, setLocalAdmins] = useState([])
  const [selectedRole, setSelectedRole] = useState('')

  const refreshAdmins = async () => {
    try {
      const res = await api.get('/admin/getAllAdmins')
      const raw = res.data?.data ?? res.data
      const list = Array.isArray(raw) ? raw : []
      setLocalAdmins(list)
    } catch (err) {
      console.error(err)
      showErrorToast(err?.response?.data?.message || 'Failed to load admins')
    }
  }

  useEffect(() => {
    refreshAdmins()
  }, [])

  const roles = useMemo(
    () => [...new Set(localAdmins.map((u) => u.role).filter(Boolean))],
    [localAdmins],
  )

  const formatDepartments = (admin) => {
    const raw = admin?.departments ?? admin?.department ?? admin?.dept ?? null
    if (Array.isArray(raw)) {
      const names = raw
        .map((d) => (typeof d === 'string' ? d : d?.name ?? d?.deptName ?? d?.departmentName ?? ''))
        .map((s) => String(s).trim())
        .filter(Boolean)
      return names.length ? names.join(', ') : 'All Departments'
    }
    if (typeof raw === 'string') {
      const v = raw.trim()
      return v || 'All Departments'
    }
    return 'All Departments'
  }

  const displayAdmins = useMemo(() => {
    if (!selectedRole) return localAdmins
    return localAdmins.filter((a) => a.role === selectedRole)
  }, [localAdmins, selectedRole])

  const handleAddAdmin = async (adminData) => {
    const payload = {
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      role: adminData.role,
    }

    setLoading(true)
    try {
      const response = await api.post('/admin/create', payload)
      setAdminRes(response.data?.message ?? response.data ?? '')
      await refreshAdmins()
      showSuccessToast('Admin added successfully')
      setOpen(false)
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to add admin')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (email, field, currentValue) => {
    const newValue = !currentValue
    setLocalAdmins((prev) =>
      prev.map((admin) => (admin.email === email ? { ...admin, [field]: newValue } : admin)),
    )
    try {
      await api.put('/admin/updateStatus', { email, [field]: newValue })
      await refreshAdmins()
    } catch (err) {
      console.error(err)
      await refreshAdmins()
      showErrorToast(err?.response?.data?.message || 'Status update failed')
    }
  }

  const handleAdminFreeze = async (email, field, currentValue) => {
    const newVal = !currentValue
    try {
      await api.put('/admin/updateStatus', { email, [field]: newVal })
      await refreshAdmins()
    } catch (error) {
      console.error('Freeze update failed', error)
      showErrorToast(error?.response?.data?.message || 'Update failed')
    }
  }

  const handleDeleteAdmin = async (id) => {
    setLoading(true)
    try {
      await DeleteConfirmation({
        title: 'Confirm deletion',
        text: 'Are you sure you want to delete this admin?',
        successMessage: 'Admin deleted successfully!',
        errorMessage: 'Unable to delete the admin.',
        onConfirm: async () => {
          await api.delete(`/admin/delete/${id}`)
        },
        onCancel: () => {},
        onSuccess: () => refreshAdmins(),
      })
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setLoading(false)
    }
  }

  const resetPasswordFields = () => {
    setPassword({ newPassword: '', confirmPassword: '' })
  }

  const sendMail = async (email, sendToSuperAdmin = false) => {
    setLoading(true)
    try {
      const payload = { email }
      if (sendToSuperAdmin) payload.sendMailToSuperAdmin = true
      await api.post('/admin/sendPasswordToMail', payload)
      ShowAlert('success', 'Mail sent successfully')
    } catch (err) {
      console.error(err)
      ShowAlert('error', err?.response?.data?.message || 'Error sending mail.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAdmin = async (adminData) => {
    const payload = {
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
    }
    if (adminData.password) payload.password = adminData.password

    try {
      await api.put(`/admin/update/${encodeURIComponent(update.email)}`, payload)
      showSuccessToast('Admin updated successfully')
      setEditOpen(false)
      await refreshAdmins()
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Update failed')
      console.error('Update failed', error)
    }
  }

  const loadAdminToEdit = (admin) => {
    setIsEditing(true)
    setUpdate({
      email: admin.email,
      name: admin.name,
      role: admin.role,
    })
  }

  const changePassword = async () => {
    if (!password.newPassword || !password.confirmPassword) {
      showErrorToast('All fields are required')
      return
    }
    if (password.newPassword !== password.confirmPassword) {
      showErrorToast('Passwords do not match')
      return
    }
    if (!selectedAdminEmail) {
      showErrorToast('Admin email not found')
      return
    }

    setLoading(true)
    try {
      await api.put(`/admin/updatePasswordBySuperAdmin/${encodeURIComponent(selectedAdminEmail)}`, {
        newPassword: password.newPassword,
        confirmNewPassword: password.confirmPassword,
      })
      ShowAlert('success', 'Password updated successfully')
      resetPasswordFields()
      setIsDialogOpen(false)
      setSelectedAdminEmail(null)
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePass = (e) => {
    const { name, value } = e.target
    setPassword((prev) => ({ ...prev, [name]: value }))
  }

  const fields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email',
      readOnly: isEditing,
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter name',
      readOnly: isEditing,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter password',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
        { value: 'TEAM_ADMIN', label: 'TEAM_ADMIN' },
        { value: 'SUB_ADMIN', label: 'SUB_ADMIN' },
        { value: 'HR', label: 'HR' },
      ],
      placeholder: 'Select role',
    },
  ]

  const editfields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email',
      readOnly: true,
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter name',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
        { value: 'TEAM_ADMIN', label: 'TEAM_ADMIN' },
        { value: 'SUB_ADMIN', label: 'SUB_ADMIN' },
        { value: 'HR', label: 'HR' },
      ],
      placeholder: 'Select role',
      readOnly: isEditing,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[100%] px-2 sm:px-0 mt-[2%]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Admin List</h1>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false)
            setOpen(true)
          }}
          className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Add
        </button>
      </div>
  
      {/* Add Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-40 p-2">
          <div className="bg-white p-4 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <h2 className="text-sm font-semibold mb-2">Add admin</h2>
            <ReusableForm
              onSubmit={handleAddAdmin}
              initialValues={{ name: '', email: '', password: '', role: '' }}
              fields={fields}
              buttonLabel="Submit"
              cancelButtonLabel="Cancel"
              onCancel={() => setOpen(false)}
              res={adminRes}
            />
          </div>
        </div>
      )}
  
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead className="border-b">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left w-[120px]">Email</th>
              <th className="p-2 text-left">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border px-1 py-0.5 text-xs"
                >
                  <option value="">All</option>
                  {roles.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </th>
              <th className="p-2 text-left">Dept</th>
              <th className="p-2 text-center">Active</th>
              <th className="p-2 text-center">Delete</th>
              <th className="p-2 text-center">Edit</th>
              <th className="p-2 text-center">Change Password</th>
              <th className="p-2 text-left">Password send email</th>
              <th className="p-2 text-center">2FA</th>
              <th className="p-2 text-center">Freeze</th>
            </tr>
          </thead>
  
          <tbody>
            {displayAdmins.map((admin) => (
              <tr
                key={admin.email}
                className={`border-b ${
                  admin.role === 'SUPER_ADMIN'
                    ? 'bg-orange-50/60'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="p-2">{admin.name}</td>
  
                <td className="p-2">
                  <div className="truncate max-w-[120px]" title={admin.email}>
                    {admin.email}
                  </div>
                </td>
  
                <td className="p-2">{admin.role}</td>
  
                <td className="p-2">{formatDepartments(admin)}</td>
  
                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      handleToggleStatus(admin.email, 'isActive', admin.isActive)
                    }
                  >
                    {admin.isActive ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
  
                <td className="p-2 text-center">
                  <button
                    disabled={admin.role === 'SUPER_ADMIN'}
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className={
                      admin.role === 'SUPER_ADMIN'
                        ? 'opacity-40 cursor-not-allowed'
                        : 'text-red-600'
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
  
                <td className="p-2 text-center">
                  <button
                    onClick={() => {
                      loadAdminToEdit(admin)
                      setEditOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td>
  
                <td className="p-2 text-center">
                  <button
                    onClick={() => {
                      setSelectedAdminEmail(admin.email)
                      setIsDialogOpen(true)
                    }}
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                </td>
  
                <td className="p-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => sendMail(admin.email, true)}
                      className="bg-gray-700 text-white px-2 py-0.5 text-xs"
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => sendMail(admin.email)}
                      className="bg-gray-700 text-white px-2 py-0.5 text-xs"
                    >
                      User
                    </button>
                  </div>
                </td>
  
                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      handleToggleStatus(
                        admin.email,
                        'is2FAEnabled',
                        admin.is2FAEnabled
                      )
                    }
                  >
                    {admin.is2FAEnabled ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
  
                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      handleAdminFreeze(
                        admin.email,
                        'freezeAccess',
                        admin.freezeAccess
                      )
                    }
                  >
                    {admin.freezeAccess ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2">
          <div className="bg-white p-4 w-full max-w-md">
            <h2 className="text-sm font-semibold mb-2">Edit Admin</h2>
            <ReusableForm
              key={update.email}
              onSubmit={handleEditAdmin}
              initialValues={update}
              fields={editfields}
              buttonLabel="Submit"
              cancelButtonLabel="Cancel"
              onCancel={() => setEditOpen(false)}
            />
          </div>
        </div>
      )}
  
      {/* Password Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-2">
          <div className="bg-white w-full max-w-sm p-4 relative">
            <button
              onClick={() => {
                setIsDialogOpen(false)
                resetPasswordFields()
              }}
              className="absolute top-2 right-3 text-gray-400"
            >
              ✕
            </button>
  
            <h2 className="text-sm font-semibold mb-2">Change password</h2>
  
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              placeholder="New password"
              value={password.newPassword}
              onChange={handleChangePass}
              className="w-full border p-1 text-xs mb-2"
            />
  
            <input
              type={showPassword2 ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm password"
              value={password.confirmPassword}
              onChange={handleChangePass}
              className="w-full border p-1 text-xs mb-2"
            />
  
            <button
              onClick={changePassword}
              className="w-full bg-red-500 text-white py-1 text-xs"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
