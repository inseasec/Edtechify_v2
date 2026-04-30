/**
 * First screen after login (inside sidebar shell).
 * @param {string | null} role from JWT
 */
export function getPathForRole(role) {
  if (role === 'TEAM_ADMIN' || role === 'SUB_ADMIN') return '/team-admin/dashboard'
  if (role === 'HR') return '/career/dashboard'
  return '/super-admin/dashboard'
}
