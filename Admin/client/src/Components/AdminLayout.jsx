import { Outlet, useNavigate } from 'react-router-dom'
import { clearAuth } from '@/utils/auth'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-[#0f172b] px-6 py-3">
          <h3 className="text-sm font-semibold text-white">Rankwell Admin</h3>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-auto px-6 pb-6 pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
