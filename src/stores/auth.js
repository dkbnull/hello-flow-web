import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { getCurrentUser } from '@/api/user'
import { ROLE_CODE } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const user = ref(null)

  const isLoggedIn = computed(() => !!accessToken.value)
  // roles 是角色编码数组
  const isAdmin = computed(() => user.value?.roles?.includes(ROLE_CODE.ADMIN) || false)
  const userPosition = computed(() => user.value?.positionCode || '')

  // 登录
  async function login(username, password) {
    const res = await loginApi({ username, password })
    accessToken.value = res.data.accessToken
    refreshToken.value = res.data.refreshToken
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    // 登录响应直接包含 user 对象
    if (res.data.user) {
      user.value = res.data.user
    } else {
      await fetchCurrentUser()
    }
  }

  // 登出
  async function logout() {
    try {
      await logoutApi()
    } catch {
      // 错误已在拦截器中处理
    }
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // 获取当前用户信息
  async function fetchCurrentUser() {
    try {
      const res = await getCurrentUser()
      user.value = res.data
    } catch {
      // Token 无效则清除
      await logout()
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    isAdmin,
    userPosition,
    login,
    logout,
    fetchCurrentUser
  }
})
