import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ROLE_CODE, POSITION_CODE } from '@/utils/constants'

// 权限判断 composable，消除各页面重复的权限逻辑
export function usePermission() {
  const authStore = useAuthStore()

  const isAdmin = computed(() => authStore.user?.roles?.includes(ROLE_CODE.ADMIN) || false)

  const isPM = computed(() => authStore.user?.positionCode === POSITION_CODE.PM)

  // 是否可管理项目（管理员或项目经理）
  const canManageProject = computed(() => isAdmin.value || isPM.value)

  return { isAdmin, isPM, canManageProject }
}
