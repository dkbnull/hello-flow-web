import request from '@/utils/request'

// 项目列表
export function getProjectList(params) {
  return request.get('/projects', { params })
}

// 创建项目
export function createProject(data) {
  return request.post('/projects', data)
}

// 项目详情
export function getProjectDetail(id) {
  return request.get(`/projects/${id}`)
}

// 更新项目
export function updateProject(id, data) {
  return request.put(`/projects/${id}`, data)
}

// 项目成员列表
export function getProjectMembers(id, params) {
  return request.get(`/projects/${id}/members`, { params })
}

// 添加项目成员
export function addProjectMember(projectId, userId) {
  return request.post(`/projects/${projectId}/members`, null, { params: { userId } })
}

// 移除项目成员
export function removeProjectMember(projectId, userId) {
  return request.delete(`/projects/${projectId}/members/${userId}`)
}

// 项目概览统计
export function getProjectStats(projectId) {
  return request.get(`/stats/projects/${projectId}/overview`)
}

// 燃尽图数据
export function getBurndownData(projectId, params) {
  return request.get(`/stats/projects/${projectId}/burndown`, { params })
}

// 成员工作量统计
export function getMemberStats(projectId) {
  return request.get(`/stats/projects/${projectId}/members`)
}

// 缺陷统计
export function getDefectStats(projectId) {
  return request.get(`/stats/projects/${projectId}/defects`)
}
