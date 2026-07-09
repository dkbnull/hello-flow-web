import request from '@/utils/request'

// 通知列表
export function getNotificationList(params) {
  return request.get('/notifications', { params })
}

// 未读数量
export function getUnreadCount() {
  return request.get('/notifications/unread-count')
}

// 标记已读（ids为空时标记全部已读，非空时标记指定通知已读）
export function markAsRead(ids = []) {
  return request.put('/notifications/read', { ids })
}

// 获取通知设置
export function getNotificationSettings() {
  return request.get('/notifications/settings')
}

// 更新通知设置
export function updateNotificationSettings(data) {
  return request.put('/notifications/settings', data)
}
