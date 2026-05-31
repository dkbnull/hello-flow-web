import request from '@/utils/request'

// Sprint列表
export function getSprintList(projectId) {
  return request.get(`/projects/${projectId}/sprints`)
}

// 创建Sprint
export function createSprint(projectId, data) {
  return request.post(`/projects/${projectId}/sprints`, data)
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
