import request from '@/utils/request'

// 标签列表
export function getTagList(params) {
  return request.get('/tags', { params })
}

// 创建标签
export function createTag(data) {
  return request.post('/tags', data)
}

// 删除标签
export function deleteTag(id) {
  return request.delete(`/tags/${id}`)
}
