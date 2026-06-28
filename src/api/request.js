const API_BASE = import.meta.env.VITE_API_BASE || ''

export function buildUrl(path, params = {}) {
  const query = new URLSearchParams()
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })
  const qs = query.toString()
  return `${API_BASE}${path}${qs ? `?${qs}` : ''}`
}

export async function request(path, params) {
  const response = await fetch(buildUrl(path, params))
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }
  return response.json()
}
