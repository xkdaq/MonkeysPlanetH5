const API_BASE = import.meta.env.VITE_API_BASE || ''

export function reportVisit(payload) {
  const body = JSON.stringify({
    pagePath: `${window.location.pathname}${window.location.search}`,
    ...payload
  })
  const url = `${API_BASE}/h5/visit/report`

  fetch(url, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
    keepalive: true
  }).catch(() => {})
}
