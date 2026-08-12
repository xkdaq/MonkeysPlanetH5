const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function submitFeedback(payload) {
  const response = await fetch(`${API_BASE}/h5/feedback/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    throw new Error(`提交失败：${response.status}`)
  }
  const res = await response.json()
  if (res.code !== 0) {
    throw new Error(res.msg || '提交失败，请稍后再试')
  }
  return res
}
