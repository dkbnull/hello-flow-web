import request from '@/utils/request'

// 版本列表
export function getVersionList(params) {
  return request.get('/versions', { params })
}

// 创建版本
export function createVersion(data) {
  return request.post('/versions', data)
}

// 更新版本
export function updateVersion(id, data) {
  return request.put(`/versions/${id}`, data)
}

// 删除版本
export function deleteVersion(id) {
  return request.delete(`/versions/${id}`)
}
