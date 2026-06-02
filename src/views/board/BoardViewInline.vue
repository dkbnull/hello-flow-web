<template>
  <div v-loading="loading" class="board-inline">
    <div class="board-columns">
      <div v-for="col in columns" :key="col.status" class="board-column"
           :style="{ '--status-color': TASK_STATUS_MAP[col.status]?.color || '#909399' }">
        <div class="column-header">
          <span :style="{ color: TASK_STATUS_MAP[col.status]?.color }">{{ col.statusName }}</span>
          <el-badge :value="col.tasks?.length || 0" type="info" />
        </div>
        <div class="column-body">
          <TaskCard
            v-for="task in col.tasks"
            :key="task.id"
            :task="task"
            size="small"
            @click="$emit('task-click', task)"
          />
          <div v-if="!col.tasks || col.tasks.length === 0" class="empty-column">暂无</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getSprintBoard } from '@/api/board'
import { TASK_STATUS_MAP } from '@/utils/constants'
import TaskCard from '@/components/task/TaskCard.vue'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  sprintId: { type: [String, Number], required: true }
})

defineEmits(['task-click'])

const loading = ref(false)
const columns = ref([])

async function loadBoard() {
  if (!props.sprintId) return
  loading.value = true
  try {
    const res = await getSprintBoard(props.sprintId)
    columns.value = res.data?.columns || []
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

watch(() => props.sprintId, () => loadBoard())
onMounted(() => loadBoard())
</script>

<style scoped>
.board-columns {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  min-height: 300px;
}

.board-column {
  min-width: 220px;
  max-width: 260px;
  flex: 1;
  background: var(--hf-bg-card);
  border: 1px solid var(--hf-border);
  border-top: 3px solid var(--status-color);
  border-radius: var(--hf-radius-md);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid var(--hf-border-light);
}

.column-body {
  padding: 6px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-column {
  text-align: center;
  color: var(--hf-text-placeholder);
  padding: 16px 0;
  font-size: 12px;
}
</style>
