import request from '@/utils/request'

// 角色列表
export function getRoleList() {
  return request.get('/roles')
}

// 创建角色
export function createRole(data) {
  return request.post('/roles', data)
}

// 更新角色
export function updateRole(id, data) {
  return request.put(`/roles/${id}`, data)
}
