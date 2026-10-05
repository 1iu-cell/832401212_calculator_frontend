// 所有与后端的交互都封装在这个文件里，组件中不直接写 fetch 地址。
// 使用相对路径 /api/...：
//   - 开发环境：由 Vite 的 dev server 代理到 http://127.0.0.1:8000
//   - 生产环境：可用 Nginx 等反向代理，或通过 VITE_API_BASE_URL 指定后端地址
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    // 网络错误（例如后端服务未启动）：前端不做任何本地计算，
    // 直接提示用户，保证“核心计算必须由后端完成”。
    throw new Error('无法连接后端服务，请确认后端已启动')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    let message = data.message
    // 后端未启动或异常时（经代理返回 5xx）给出更友好的提示
    if (!message && response.status >= 500) {
      message = '后端服务不可用，请确认后端已启动'
    }
    if (!message) {
      message = `请求失败（HTTP ${response.status}）`
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return data
}

/** 把表达式发给后端计算。前端只传表达式字符串，不传任何计算结果。 */
export function calculateExpression(expression) {
  return request('/api/calculate', {
    method: 'POST',
    body: JSON.stringify({ expression }),
  })
}

/** 分页查询计算历史（可带关键字搜索）。 */
export function fetchHistory({ page = 1, size = 10, q = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (q) params.set('q', q)
  return request(`/api/history?${params.toString()}`)
}

/** 删除指定 id 的一条历史记录。 */
export function deleteHistoryRecord(id) {
  return request(`/api/history/${id}`, { method: 'DELETE' })
}

/** 清空全部历史记录（扩展功能）。 */
export function clearAllHistory() {
  return request('/api/history', { method: 'DELETE' })
}
