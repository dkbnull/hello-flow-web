import request from '@/utils/request'

// 通知列表
export function getNotificationList(params) {
  return request.get('/notifications', { params })
}

// 未读数量
export function getUnreadCount() {
  return request.get('/notifications/unread-count')
}

// 标记已读
export function markAsRead(id) {
  return request.put(`/notifications/${id}/read`)
}

// 全部已读
export function markAllAsRead() {
  return request.put('/notifications/read-all')
}

// 获取通知设置
export function getNotificationSettings() {
  return request.get('/notifications/settings')
}

// 更新通知设置
export function updateNotificationSettings(data) {
  return request.put('/notifications/settings', data)
}
