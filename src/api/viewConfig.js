import request from '@/utils/request'

// 获取当前用户视图配置
export function getViewConfig() {
  return request.get('/view-configs')
}

// 更新当前用户视图配置
export function updateViewConfig(data) {
  return request.put('/view-configs', data)
}
