import request from '@/utils/request'

// 登录
export function login(data) {
  return request.post('/auth/login', data)
}

// 登出
export function logout() {
  return request.post('/auth/logout')
}

// 刷新Token
export function refreshToken(data) {
  return request.post('/auth/refresh', data)
}
