import { ref } from 'vue'
import { getProjectMembers } from '@/api/project'

const memberCache = new Map()

export function useProjectMembers() {
  const members = ref([])
  const loading = ref(false)

  async function loadMembers(projectId, force = false) {
    if (!projectId) return
    if (!force && memberCache.has(String(projectId))) {
      members.value = memberCache.get(String(projectId))
      return
    }
    loading.value = true
    try {
      const res = await getProjectMembers(projectId)
      members.value = res.data || []
      memberCache.set(String(projectId), members.value)
    } catch {
      // 错误已在拦截器中处理
    } finally {
      loading.value = false
    }
  }

  function getMemberName(userId) {
    const member = members.value.find(m => m.userId === userId)
    return member?.nickname || member?.username || ''
  }

  function getMembersByPosition(positionCode) {
    return members.value.filter(m => m.positionCode === positionCode)
  }

  function clearCache(projectId) {
    if (projectId) {
      memberCache.delete(String(projectId))
    } else {
      memberCache.clear()
    }
  }

  return { members, loading, loadMembers, getMemberName, getMembersByPosition, clearCache }
}
