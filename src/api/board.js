import request from '@/utils/request'

export function getProjectBoard(projectId, params) {
  return request.get(`/projects/${projectId}/board`, { params })
}

export function getSprintBoard(sprintId, params) {
  return request.get(`/sprints/${sprintId}/board`, { params })
}
