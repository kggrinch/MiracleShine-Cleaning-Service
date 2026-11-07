import axios from 'axios'

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const normalizedBaseURL = configuredBaseURL.replace(/\/+$/, '')
const baseURL = normalizedBaseURL.endsWith('/api/v1')
  ? normalizedBaseURL
  : `${normalizedBaseURL}/api/v1`

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('miracleshine-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      sessionStorage.getItem('miracleshine-token')
    ) {
      sessionStorage.removeItem('miracleshine-token')
      window.dispatchEvent(new Event('miracleshine:auth-expired'))
    }
    return Promise.reject(error)
  },
)

export default api
