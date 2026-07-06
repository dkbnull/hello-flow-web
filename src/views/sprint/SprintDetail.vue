<template>
  <div class="sprint-detail">
    <div v-if="sprint" class="sprint-info">
      <el-page-header @back="$router.push({ name: 'ProjectSprints' })">
        <template #content>
          <span>{{ sprint.name }}</span>
          <el-tag :type="SPRINT_STATUS_MAP[sprint.status]?.tagType || 'info'" size="small" style="margin-left: 8px">
            {{ SPRINT_STATUS_MAP[sprint.status]?.label || '未知' }}
          </el-tag>
        </template>
      </el-page-header>

      <el-descriptions :column="2" border size="small" style="margin-top: 16px">
        <el-descriptions-item label="目标">{{ sprint.goal || '-' }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ sprint.startDate }} ~ {{ sprint.endDate }}</el-descriptions-item>
      </el-descriptions>

      <!-- 迭代看板 -->
      <div class="sprint-board">
        <h4 style="margin: 16px 0 8px">任务看板</h4>
        <BoardViewInline :project-id="projectId" :sprint-id="sprintId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSprintList } from '@/api/sprint'
import { SPRINT_STATUS_MAP } from '@/utils/constants'
import BoardViewInline from '@/views/board/BoardViewInline.vue'

const route = useRoute()

const sprint = ref(null)
const projectId = computed(() => route.params.id)
const sprintId = computed(() => route.params.sprintId)

async function loadSprint() {
  try {
    const res = await getSprintList(projectId.value)
    const sprints = res.data || []
    sprint.value = sprints.find(s => String(s.id) === String(sprintId.value)) || null
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadSprint()
})
</script>

<style scoped>
.sprint-detail {
  padding: 0;
}
</style>
