export function useDateFormat() {
  function formatRelativeTime(time) {
    if (!time) return ''
    const date = new Date(time)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
    return date.toLocaleDateString('zh-CN')
  }

  function formatDate(time) {
    if (!time) return '-'
    return new Date(time).toLocaleDateString('zh-CN')
  }

  function formatDateTime(time) {
    if (!time) return '-'
    return new Date(time).toLocaleString('zh-CN')
  }

  return { formatRelativeTime, formatDate, formatDateTime }
}
