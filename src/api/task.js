import request from '@/utils/request'

// 任务列表
export function getTaskList(projectId, params) {
  return request.get(`/projects/${projectId}/tasks`, { params })
}

// 创建任务
export function createTask(projectId, data) {
  return request.post(`/projects/${projectId}/tasks`, data)
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

// 开始开发
export function startTask(id) {
  return request.post(`/tasks/${id}/start`)
}

// 开发完成
export function completeDevTask(id) {
  return request.post(`/tasks/${id}/complete-dev`)
}

// 审查通过
export function reviewPassTask(id) {
  return request.post(`/tasks/${id}/review-pass`)
}

// 审查驳回
export function rejectReviewTask(id) {
  return request.post(`/tasks/${id}/review-reject`)
}

// 测试通过
export function passTestTask(id) {
  return request.post(`/tasks/${id}/test-pass`)
}

// 测试驳回
export function rejectTestTask(id) {
  return request.post(`/tasks/${id}/test-reject`)
}

// 重新打开
export function reopenTask(id) {
  return request.post(`/tasks/${id}/reopen`)
}

// 关闭任务
export function closeTask(id) {
  return request.post(`/tasks/${id}/close`)
}

// 取消任务
export function cancelTask(id, cancelReason) {
  return request.post(`/tasks/${id}/cancel`, { cancelReason })
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

// 我的任务
export function getMyTasks(params) {
  return request.get('/tasks/mine', { params })
}

// 我创建的任务
export function getReportedTasks(params) {
  return request.get('/tasks/reported', { params })
}

// 与我相关的任务
export function getRelatedTasks(params) {
  return request.get('/tasks/related', { params })
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
