import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// ─── 环境变量配置 ───────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TIMEOUT = 15000

// ─── 创建 Axios 实例 ─────────────────────────────────────────────
const service = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// ─── 请求拦截器 ──────────────────────────────────────────────────
service.interceptors.request.use(
  (config) => {
    // 自动附加 Token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

// ─── 响应拦截器 ──────────────────────────────────────────────────
service.interceptors.response.use(
  (response) => {
    const { data } = response
    // 业务状态码约定：code === 200 为成功
    if (data.code === 200 || data.code === 0) {
      return data
    }
    // 业务异常
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
            type: 'warning',
            confirmButtonText: '重新登录',
            showCancelButton: false,
          }).then(() => {
            localStorage.removeItem('token')
            window.location.reload()
          })
          break
        case 403:
          ElMessage.error('无权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(response.data?.message || `请求错误 ${response.status}`)
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请重试')
    } else {
      ElMessage.error('网络异常，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default service
