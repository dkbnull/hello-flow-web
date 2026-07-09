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

// Sprint状态流转
export function transitionSprint(id, targetStatus) {
  return request.post(`/sprints/${id}/transition`, { targetStatus })
}
