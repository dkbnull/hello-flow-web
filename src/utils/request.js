import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// 请求拦截器
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

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      const message = res.message || '请求失败'
      ElMessage.error(message)
      // Token 过期或无效
      if (res.code === 20001 || res.code === 20002 || res.code === 20003) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
      }
      // 权限不足
      if (res.code === 30001) {
        ElMessage.error('权限不足')
      }
      return Promise.reject(new Error(message))
    }
    return res
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
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

export default request
