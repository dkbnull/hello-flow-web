<template>
  <div v-loading="loading" class="board-inline">
    <div class="board-columns">
      <div v-for="col in columns" :key="col.status" class="board-column">
        <div class="column-header">
          <span :style="{ color: TASK_STATUS_MAP[col.status]?.color }">{{ col.statusName }}</span>
          <el-badge :value="col.tasks?.length || 0" type="info" />
        </div>
        <div class="column-body">
          <div v-for="task in col.tasks" :key="task.id" class="task-card">
            <div class="card-header">
              <el-tag :type="TASK_TYPE_MAP[task.type]?.tagType ?? 'info'" size="small">
                {{ TASK_TYPE_MAP[task.type]?.label }}
              </el-tag>
              <span class="task-id">TASK-{{ task.id }}</span>
            </div>
            <div class="card-title">{{ task.title }}</div>
            <div class="card-footer">
              <span :style="{ color: TASK_PRIORITY_MAP[task.priority]?.color }">
                {{ TASK_PRIORITY_MAP[task.priority]?.label }}
              </span>
              <span v-if="task.assigneeName" class="assignee">{{ task.assigneeName }}</span>
            </div>
          </div>
          <div v-if="!col.tasks || col.tasks.length === 0" class="empty-column">暂无</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getSprintBoard } from '@/api/board'
import { TASK_STATUS_MAP, TASK_TYPE_MAP, TASK_PRIORITY_MAP } from '@/utils/constants'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  sprintId: { type: [String, Number], required: true }
})

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
  background: var(--hf-bg-page);
  border: 1px solid var(--hf-border-light);
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

.task-card {
  background: var(--hf-bg-card);
  border: 1px solid var(--hf-border);
  border-radius: var(--hf-radius-sm);
  padding: 10px;
  margin-bottom: 6px;
  transition: all 0.2s;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.task-id {
  font-size: 11px;
  color: var(--hf-text-placeholder);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

.card-title {
  font-size: 13px;
  color: var(--hf-text-primary);
  margin-bottom: 6px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.assignee {
  color: var(--hf-text-secondary);
}

.empty-column {
  text-align: center;
  color: var(--hf-text-placeholder);
  padding: 16px 0;
  font-size: 12px;
}
</style>
