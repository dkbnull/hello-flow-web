import request from '@/utils/request'

// 过滤器列表
export function getFilterList() {
  return request.get('/filters')
}

// 创建过滤器
export function createFilter(data) {
  return request.post('/filters', data)
}

// 更新过滤器
export function updateFilter(id, data) {
  return request.put(`/filters/${id}`, data)
}

// 删除过滤器
export function deleteFilter(id) {
  return request.delete(`/filters/${id}`)
}
