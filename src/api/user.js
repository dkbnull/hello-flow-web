import request from '@/utils/request'

// 用户列表
export function getUserList(params) {
  return request.get('/users', { params })
}

// 创建用户
export function createUser(data) {
  return request.post('/users', data)
}

// 更新用户
export function updateUser(id, data) {
  return request.put(`/users/${id}`, data)
}

// 启用/禁用用户
export function updateUserStatus(id, status) {
  return request.put(`/users/${id}/status`, { status })
}

// 当前用户信息
export function getCurrentUser() {
  return request.get('/users/me')
}

// 更新个人信息
export function updateCurrentUser(data) {
  return request.put('/users/me', data)
}
