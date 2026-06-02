import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const AUTH_URLS = ['/auth/login', '/auth/logout', '/auth/refresh']

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

let isRefreshing = false
let isHandlingExpired = false
let pendingRequests = []

function isAuthRequest(url) {
  if (!url) return false
  return AUTH_URLS.some(authUrl => url.includes(authUrl))
}

request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      const message = res.message || '请求失败'
      ElMessage.error(message)
      if (
        (res.code === 20001 || res.code === 20002 || res.code === 20003) &&
        !isAuthRequest(response.config.url)
      ) {
        handleTokenExpired()
      }
      if (res.code === 30001) {
        ElMessage.error('权限不足')
      }
      return Promise.reject(new Error(message))
    }
    return res
  },
  async (error) => {
    const originalRequest = error.config
    if (error.response) {
      const { status } = error.response
      if (status === 401 && !originalRequest._retry && !isAuthRequest(originalRequest.url)) {
        return handleTokenRefresh(originalRequest)
      } else if (status === 403) {
        ElMessage.error('无权限访问')
      } else if (status === 404) {
        ElMessage.error('资源不存在')
      } else {
        ElMessage.error(error.response.data?.message || '服务器错误')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    return Promise.reject(error)
  }
)

async function handleTokenRefresh(originalRequest) {
  const authStore = useAuthStore()
  if (!authStore.refreshToken) {
    await forceLogout()
    return Promise.reject(error)
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingRequests.push(() => {
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        resolve(request(originalRequest))
      })
    })
  }

  isRefreshing = true
  originalRequest._retry = true

  try {
    const success = await authStore.refreshAccessToken()
    if (success) {
      originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
      pendingRequests.forEach(cb => cb())
      pendingRequests = []
      return request(originalRequest)
    } else {
      pendingRequests = []
      await forceLogout()
      return Promise.reject(new Error('Token 刷新失败'))
    }
  } catch {
    pendingRequests = []
    await forceLogout()
    return Promise.reject(new Error('Token 刷新失败'))
  } finally {
    isRefreshing = false
  }
}

async function handleTokenExpired() {
  if (isHandlingExpired) return
  isHandlingExpired = true

  try {
    const authStore = useAuthStore()
    if (!isRefreshing && authStore.refreshToken) {
      const success = await authStore.refreshAccessToken()
      if (!success) {
        await forceLogout()
      }
    } else if (!authStore.refreshToken) {
      await forceLogout()
    }
  } finally {
    isHandlingExpired = false
  }
}

async function forceLogout() {
  const authStore = useAuthStore()
  await authStore.logout()
  if (router.currentRoute.value.name !== 'Login') {
    router.push('/login')
    ElMessage.error('登录已过期，请重新登录')
  }
}

export default request
