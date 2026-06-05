import request from '@/utils/request'

// Sprint列表
export function getSprintList(projectId) {
  return request.get('/sprints', { params: { projectId } })
}

// 创建Sprint
export function createSprint(data) {
  return request.post('/sprints', data)
}

// 更新Sprint
export function updateSprint(id, data) {
  return request.put(`/sprints/${id}`, data)
}

// 开始Sprint
export function startSprint(id) {
  return request.put(`/sprints/${id}/start`)
}

// 完成Sprint
export function completeSprint(id) {
  return request.put(`/sprints/${id}/complete`)
}
