/** Offline demo login (super admin). Remove or gate for production. */
export const STATIC_DEMO_EMAIL = 'super1@gmail.com'
export const STATIC_DEMO_PASSWORD = 'super1@123'

/** JWT-shaped token jwt-decode can read; payload role SUPER_ADMIN */
export const STATIC_DEMO_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiU1VQRVJfQURNSU4ifQ.dev-static-sig'

export function isStaticDemoLogin(email, password) {
  return (
    String(email).trim().toLowerCase() === STATIC_DEMO_EMAIL &&
    password === STATIC_DEMO_PASSWORD
  )
}

export function isStaticDemoEmail(email) {
  return String(email).trim().toLowerCase() === STATIC_DEMO_EMAIL
}
