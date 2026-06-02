<template>
  <el-card class="section-card" shadow="never">
    <template #header>
      <div class="card-header">
        <el-icon>
          <List />
        </el-icon>
        <span>子任务</span>
        <el-button link type="primary" size="small" @click="$emit('add')">添加</el-button>
      </div>
    </template>
    <div v-if="subtasks.length === 0" class="empty-text">暂无子任务</div>
    <div v-for="sub in subtasks" :key="sub.id" class="subtask-item" @click="$emit('go-to-task', sub.id)">
      <el-tag :type="TASK_STATUS_MAP[sub.status]?.tagType ?? 'info'" size="small">
        {{ TASK_STATUS_MAP[sub.status]?.label }}
      </el-tag>
      <el-tag :type="TASK_TYPE_MAP[sub.type]?.tagType ?? 'info'" size="small">
        {{ TASK_TYPE_MAP[sub.type]?.label }}
      </el-tag>
      <span class="subtask-title">{{ sub.title }}</span>
    </div>
  </el-card>
</template>

<script setup>
import { List } from '@element-plus/icons-vue'
import { TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'

defineProps({
  subtasks: { type: Array, default: () => [] }
})

defineEmits(['add', 'go-to-task'])
</script>

<style scoped>
.section-card {
  margin-bottom: 16px;
  border-radius: var(--hf-radius-md);
  border: 1px solid var(--hf-border);
}

.section-card :deep(.el-card__header) {
  padding: 12px 20px;
  background: var(--hf-bg-page);
  border-bottom: 1px solid var(--hf-border-light);
}

.section-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--hf-text-primary);
}

.card-header .el-icon {
  font-size: 16px;
  color: var(--hf-primary);
}

.card-header .el-button {
  margin-left: auto;
}

.empty-text {
  text-align: center;
  color: var(--hf-text-placeholder);
  padding: 24px 0;
  font-size: 14px;
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

.subtask-title {
  flex: 1;
  font-size: 14px;
  color: var(--hf-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
