import request from '@/utils/request'

// 任务列表
export function getTaskList(params) {
  return request.get('/tasks', { params })
}

// 创建任务
export function createTask(data) {
  return request.post('/tasks', data)
}

// 任务详情
export function getTaskDetail(id) {
  return request.get(`/tasks/${id}`)
}

// 更新任务
export function updateTask(id, data) {
  return request.put(`/tasks/${id}`, data)
}

// 删除任务
export function deleteTask(id) {
  return request.delete(`/tasks/${id}`)
}

// 分配任务
export function assignTask(id, assigneeId) {
  return request.post(`/tasks/${id}/assign`, { assigneeId })
}

// 任务状态流转（含缺陷解决信息）
export function transitionTask(id, targetStatus, extra = {}) {
  const data = { targetStatus, ...extra }
  return request.post(`/tasks/${id}/transition`, data)
}

// 标记延期
export function delayTask(id, delayReason) {
  return request.post(`/tasks/${id}/delay`, { delayReason })
}

// 子任务列表
export function getSubtasks(id) {
  return request.get(`/tasks/${id}/subtasks`)
}

// 创建子任务
export function createSubtask(id, data) {
  return request.post(`/tasks/${id}/subtasks`, data)
}

// 任务关联列表
export function getTaskRelations(id) {
  return request.get(`/tasks/${id}/relations`)
}

// 添加任务关联
export function addTaskRelation(id, data) {
  return request.post(`/tasks/${id}/relations`, data)
}

// 删除任务关联
export function deleteTaskRelation(taskId, relationId) {
  return request.delete(`/tasks/${taskId}/relations/${relationId}`)
}

// 我负责的任务
export function getMyTasks(params) {
  return request.get('/tasks/mine', { params })
}

// 待我审查的任务
export function getPendingReviewTasks(params) {
  return request.get('/tasks/pending-review', { params })
}

// 评论列表
export function getComments(taskId) {
  return request.get(`/tasks/${taskId}/comments`)
}

// 添加评论
export function addComment(taskId, content) {
  return request.post(`/tasks/${taskId}/comments`, content)
}

// 操作历史
export function getActivities(taskId) {
  return request.get(`/tasks/${taskId}/activities`)
}
