import request from '@/utils/request'

export function getProjectBoard(projectId, params) {
  return request.get(`/stats/projects/${projectId}/board`, { params })
}

export function getSprintBoard(sprintId, params) {
  return request.get(`/stats/sprints/${sprintId}/board`, { params })
}
