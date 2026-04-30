import axios from 'axios'

const base = window._CONFIG_.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: base || undefined,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    // Axios v1 uses AxiosHeaders — set() keeps Authorization on multipart requests.
    if (config.headers?.set) {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  // Multipart: browser must set Content-Type + boundary; default application/json breaks @RequestPart.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers?.delete) {
      config.headers.delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
  }
  return config
})

export default api
