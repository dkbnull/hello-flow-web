import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginApi, logout as logoutApi, refreshToken as refreshTokenApi } from '@/api/auth'
import { getCurrentUser } from '@/api/user'
import { ROLE_CODE } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const user = ref(null)
  const userLoading = ref(false)

  const isLoggedIn = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.roles?.includes(ROLE_CODE.ADMIN) || false)
  const userPosition = computed(() => user.value?.positionCode || '')

  async function login(username, password) {
    const res = await loginApi({ username, password })
    accessToken.value = res.data.accessToken
    refreshToken.value = res.data.refreshToken
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    if (res.data.user) {
      user.value = res.data.user
    } else {
      await fetchCurrentUser()
    }
  }

  async function logout() {
    if (accessToken.value) {
      try {
        await logoutApi()
      } catch {
        // 错误已在拦截器中处理
      }
    }
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  async function fetchCurrentUser() {
    if (userLoading.value) return
    userLoading.value = true
    try {
      const res = await getCurrentUser()
      user.value = res.data
    } catch {
      await logout()
    } finally {
      userLoading.value = false
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) return false
    try {
      const res = await refreshTokenApi({ refreshToken: refreshToken.value })
      accessToken.value = res.data.accessToken
      refreshToken.value = res.data.refreshToken
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      return true
    } catch {
      return false
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    userLoading,
    isLoggedIn,
    isAdmin,
    userPosition,
    login,
    logout,
    fetchCurrentUser,
    refreshAccessToken
  }
})
