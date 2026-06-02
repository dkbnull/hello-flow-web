<template>
  <div class="board-view">
    <div class="board-header">
      <el-select v-model="sprintId" placeholder="选择Sprint" clearable size="default" @change="loadBoard">
        <el-option label="全部" :value="null" />
        <el-option v-for="s in sprints" :key="s.id" :label="s.name" :value="s.id" />
      </el-select>
    </div>

    <div v-loading="loading" class="board-columns">
      <div v-for="col in columns" :key="col.status" class="board-column"
           :style="{ '--status-color': TASK_STATUS_MAP[col.status]?.color || '#909399' }">
        <div class="column-header">
          <span class="column-title" :style="{ color: TASK_STATUS_MAP[col.status]?.color }">
            {{ col.statusName }}
          </span>
          <el-badge :value="col.tasks?.length || 0" type="info" />
        </div>
        <div class="column-body">
          <TaskCard
            v-for="task in col.tasks"
            :key="task.id"
            :task="task"
            :project-code="projectStore.currentProject?.code || 'TASK'"
            @click="openTaskDetail(task)"
          />
          <div v-if="!col.tasks || col.tasks.length === 0" class="empty-column">暂无任务</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectBoard, getSprintBoard } from '@/api/board'
import { getSprintList } from '@/api/sprint'
import { TASK_STATUS_MAP } from '@/utils/constants'
import { useProjectStore } from '@/stores/project'
import TaskCard from '@/components/task/TaskCard.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskRefreshKey = inject('taskRefreshKey', ref(0))

const loading = ref(false)
const columns = ref([])
const sprints = ref([])
const sprintId = ref(null)

function openTaskDetail(task) {
  router.push({ name: 'TaskDetailPage', params: { taskId: task.id } })
}

async function loadSprints() {
  try {
    const res = await getSprintList(route.params.id)
    sprints.value = res.data || []
  } catch {
    // 忽略
  }
}

async function loadBoard() {
  loading.value = true
  try {
    let res
    if (sprintId.value) {
      res = await getSprintBoard(sprintId.value, { includeSubtasks: true })
    } else {
      res = await getProjectBoard(route.params.id, { includeSubtasks: true })
    }
    columns.value = res.data?.columns || []
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSprints()
  loadBoard()
})

watch(taskRefreshKey, () => {
  loadBoard()
})
</script>

<style scoped>
.board-view {
  padding: 0;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-columns {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 12px;
  min-height: 400px;
}

.board-column {
  min-width: 260px;
  max-width: 300px;
  flex: 1;
  background: var(--hf-bg-card);
  border: 1px solid var(--hf-border);
  border-top: 3px solid var(--status-color);
  border-radius: var(--hf-radius-md);
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--hf-border-light);
}

.column-title {
  font-size: 14px;
  font-weight: 600;
}

.column-body {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.empty-column {
  text-align: center;
  color: var(--hf-text-placeholder);
  padding: 20px 0;
  font-size: 13px;
}
</style>
