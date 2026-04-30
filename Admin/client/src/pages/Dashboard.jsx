import { getUserRole } from '@/utils/auth'
import TopDashboard from '@/Components/TopDashboard'

export default function Dashboard() {
  const role = getUserRole()
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null

  return (
    <div className="max-w-4xl text-left">
      {/* <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="mt-2 text-slate-600">
          Welcome{email ? `, ${email}` : ''}.
          {role ? <span className="mt-2 block text-sm text-slate-500">Role: {role}</span> : null}
        </p>
      </div> */}

      <TopDashboard />
    </div>
  )
}
