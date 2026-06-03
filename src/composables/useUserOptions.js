import { ref } from 'vue'
import { getUserList } from '@/api/user'
import { POSITION_CODE } from '@/utils/constants'

// 用户选项 composable，消除各页面重复的用户列表按职位筛选逻辑
export function useUserOptions() {
  const allUsers = ref([])
  const pmUsers = ref([])
  const devUsers = ref([])
  const qaUsers = ref([])

  function classifyUsers(users) {
    allUsers.value = users
    pmUsers.value = users.filter(u => u.positionCode === POSITION_CODE.PM)
    devUsers.value = users.filter(u => u.positionCode === POSITION_CODE.DEV)
    qaUsers.value = users.filter(u => u.positionCode === POSITION_CODE.QA)
  }

  async function loadUsers(options = {}) {
    try {
      const res = await getUserList({ pageSize: 200, ...options })
      classifyUsers(res.data.records || [])
    } catch {
      // 忽略
    }
  }

  function getUserName(userId) {
    if (!userId) return '-'
    const user = allUsers.value.find(u => u.id === userId)
    return user?.nickname || user?.username || userId
  }

  return { allUsers, pmUsers, devUsers, qaUsers, loadUsers, classifyUsers, getUserName }
}
