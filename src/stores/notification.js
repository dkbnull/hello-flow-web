import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadCount } from '@/api/notification'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)

  // 获取未读数量
  async function fetchUnreadCount() {
    try {
      const res = await getUnreadCount()
      unreadCount.value = res.data
    } catch {
      // 错误已在拦截器中处理
    }
  }

  // 错误已在拦截器中处理
  function decreaseUnread() {
    if (unreadCount.value > 0) {
      unreadCount.value--
    }
  }

  // 清零未读数
  function clearUnread() {
    unreadCount.value = 0
  }

  return {
    unreadCount,
    fetchUnreadCount,
    decreaseUnread,
    clearUnread
  }
})
