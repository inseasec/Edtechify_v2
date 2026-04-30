import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Users } from 'lucide-react'

export default function TopDashboard() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/getAllUsers')
        const raw = res.data?.data ?? res.data
        setUsers(Array.isArray(raw) ? raw : [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchUsers()
  }, [])

  const totalUsers = users.length

  return (
    <div className="bg-gray-100 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-[-1.25rem] rounded-lg ">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl">
          <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Total Users</p>
              <h2 className="text-4xl font-bold text-gray-800 mt-2">{totalUsers}</h2>
            </div>
            <div className="bg-green-100 p-4 rounded-xl">
              <Users className="text-green-600" size={28} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
