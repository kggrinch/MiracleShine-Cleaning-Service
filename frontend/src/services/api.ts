import axios from 'axios'

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const normalizedBaseURL = configuredBaseURL.replace(/\/+$/, '')
const baseURL = normalizedBaseURL.endsWith('/api/v1')
  ? normalizedBaseURL
  : `${normalizedBaseURL}/api/v1`

export default axios.create({
  baseURL,
})
