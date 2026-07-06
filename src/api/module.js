import request from '@/utils/request'

// 模块列表
export function getModuleList(params) {
  return request.get('/modules', { params })
}

// 创建模块
export function createModule(data) {
  return request.post('/modules', data)
}

// 更新模块
export function updateModule(id, data) {
  return request.put(`/modules/${id}`, data)
}

// 删除模块
export function deleteModule(id) {
  return request.delete(`/modules/${id}`)
}
