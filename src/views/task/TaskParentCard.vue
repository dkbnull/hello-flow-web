<template>
  <div class="detail-section">
    <div class="section-title">
      <span>父任务</span>
      <div class="section-title-actions">
        <el-button v-if="!parentTask" link type="primary" size="small" @click="$emit('add')">添加</el-button>
      </div>
    </div>
    <div v-if="!parentTask" class="hf-empty-text section-body">暂无父任务</div>
    <div v-else class="parent-item section-body">
      <el-tag :type="TASK_STATUS_MAP[parentTask.status]?.tagType || 'info'" size="small">
        {{ TASK_STATUS_MAP[parentTask.status]?.label }}
      </el-tag>
      <el-tag :type="TASK_TYPE_MAP[parentTask.type]?.tagType || 'info'" size="small">
        {{ TASK_TYPE_MAP[parentTask.type]?.label }}
      </el-tag>
      <span class="task-code">{{ parentTask.taskCode || parentTask.id }}</span>
      <span class="parent-title" @click="$emit('go-to-task', parentTask.id)">{{ parentTask.title }}</span>
      <span v-if="parentTask.developerName" class="task-assignee">{{ parentTask.developerName }}</span>
      <el-button type="danger" link size="small" @click.stop="$emit('remove')">移除</el-button>
    </div>
  </div>
</template>

<script setup>
import { TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'

defineProps({
  parentTask: { type: Object, default: null }
})

defineEmits(['go-to-task', 'add', 'remove'])
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

.parent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--hf-radius-sm);
  transition: background 0.2s;
}

.parent-item:hover {
  background: var(--hf-bg-page);
}

.task-code {
  font-size: 14px;
  color: var(--hf-primary);
  font-weight: 500;
  flex-shrink: 0;
}

.parent-title {
  flex: 1;
  font-size: 14px;
  color: var(--hf-primary);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.parent-title:hover {
  color: var(--hf-primary-dark, var(--hf-primary));
}

.task-assignee {
  font-size: 12px;
  color: var(--hf-text-secondary);
  flex-shrink: 0;
}
</style>
