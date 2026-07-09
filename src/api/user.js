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

// 获取指定用户信息（查自己返回完整，查别人脱敏）
export function getUserById(id) {
  return request.get(`/users/${id}`)
}

// 更新个人信息
export function updateCurrentUser(data) {
  return request.put('/users/me', data)
}
