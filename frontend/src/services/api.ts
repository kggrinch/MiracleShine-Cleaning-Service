import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const baseURL = configuredBaseUrl.endsWith('/api/v1')
  ? configuredBaseUrl
  : `${configuredBaseUrl.replace(/\/$/, '')}/api/v1`

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('miracle-shine-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
