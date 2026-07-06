<template>
  <div class="detail-section">
    <div class="section-title">
      <span>子任务</span>
      <div class="section-title-actions">
        <el-button link type="primary" size="small" @click="$emit('add')">添加</el-button>
      </div>
    </div>
    <div v-if="subtasks.length === 0" class="hf-empty-text section-body">暂无子任务</div>
    <div v-else class="section-body">
      <div v-for="sub in subtasks" :key="sub.id" class="subtask-item" @click="$emit('go-to-task', sub.id)">
        <el-tag :type="TASK_STATUS_MAP[sub.status]?.tagType || 'info'" size="small">
          {{ TASK_STATUS_MAP[sub.status]?.label }}
        </el-tag>
        <el-tag :type="TASK_TYPE_MAP[sub.type]?.tagType || 'info'" size="small">
          {{ TASK_TYPE_MAP[sub.type]?.label }}
        </el-tag>
        <span class="task-code">{{ sub.taskCode || sub.id }}</span>
        <span class="subtask-title">{{ sub.title }}</span>
        <span v-if="sub.developerName" class="task-assignee">{{ sub.developerName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'

defineProps({
  subtasks: { type: Array, default: () => [] }
})

defineEmits(['add', 'go-to-task'])
</script>

<style scoped>
.detail-section {
  padding: 0;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--hf-text-primary);
}

.section-title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-body {
  padding-bottom: 12px;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--hf-radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.subtask-item:hover {
  background: var(--hf-bg-page);
}

.subtask-item + .subtask-item {
  margin-top: 4px;
}

.task-code {
  font-size: 14px;
  color: var(--hf-primary);
  font-weight: 500;
  flex-shrink: 0;
}

.subtask-title {
  flex: 1;
  font-size: 14px;
  color: var(--hf-primary);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.subtask-title:hover {
  color: var(--hf-primary-dark, var(--hf-primary));
}

.task-assignee {
  font-size: 12px;
  color: var(--hf-text-secondary);
  flex-shrink: 0;
}
</style>
