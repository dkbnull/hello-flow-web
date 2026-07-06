import request from '@/utils/request'

// 附件列表
export function getAttachments(taskId) {
  return request.get('/attachments', { params: { taskId } })
}

// 上传附件（单文件）
export function uploadAttachment(taskId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/attachments', formData, {
    params: { taskId },
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 在线预览附件（返回文件二进制流，Content-Disposition: inline）
export function previewAttachment(id) {
  return request.get(`/attachments/${id}/preview`, { responseType: 'blob' })
}

// 下载附件（返回文件二进制流，Content-Disposition: attachment）
export function downloadAttachment(id) {
  return request.get(`/attachments/${id}/content`, { responseType: 'blob' })
}

// 删除附件
export function deleteAttachment(id) {
  return request.delete(`/attachments/${id}`)
}
