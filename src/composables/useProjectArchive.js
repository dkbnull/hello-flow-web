import { computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { PROJECT_STATUS } from '@/utils/constants'

// 归档项目判断 composable
export function useProjectArchive() {
  const projectStore = useProjectStore()

  // 当前项目是否已归档
  const isArchived = computed(() => projectStore.currentProject?.status === PROJECT_STATUS.ARCHIVED)

  return { isArchived }
}
