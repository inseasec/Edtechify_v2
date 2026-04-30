import { useLocation } from 'react-router-dom'

/** Route prefix for sidebar links: /super-admin, /team-admin, or /career */
export function useAdminBasePath() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/team-admin')) return '/team-admin'
  if (pathname.startsWith('/career')) return '/career'
  return '/super-admin'
}
