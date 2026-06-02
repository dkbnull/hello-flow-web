<template>
  <div class="task-card" :class="[`task-card--${size}`]" @click="$emit('click')">
    <div class="card-header">
      <el-tag :type="TASK_TYPE_MAP[task.type]?.tagType ?? 'info'" :size="tagSize">
        {{ TASK_TYPE_MAP[task.type]?.label }}
      </el-tag>
      <span class="task-id">{{ projectCode }}-{{ task.id }}</span>
    </div>
    <div class="card-title">{{ task.title }}</div>
    <div class="card-footer">
      <span class="priority" :style="{ color: TASK_PRIORITY_MAP[task.priority]?.color }">
        {{ TASK_PRIORITY_MAP[task.priority]?.label }}
      </span>
      <span v-if="task.assigneeName || task.developerName" class="assignee">
        {{ task.assigneeName || task.developerName }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TASK_TYPE_MAP, TASK_PRIORITY_MAP } from '@/utils/constants'

const props = defineProps({
  task: { type: Object, required: true },
  projectCode: { type: String, default: 'TASK' },
  size: { type: String, default: 'default', validator: v => ['small', 'default'].includes(v) }
})

defineEmits(['click'])

const tagSize = computed(() => props.size === 'small' ? 'small' : 'default')
</script>

<style scoped>
.task-card {
  background: var(--hf-bg-card);
  border: 1px solid var(--hf-border);
  border-radius: var(--hf-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.task-card:hover {
  border-color: var(--hf-primary-border);
  box-shadow: var(--hf-shadow-sm);
}

.task-card--default {
  padding: 12px;
  margin-bottom: 8px;
}

.task-card--small {
  padding: 10px;
  margin-bottom: 6px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-card--small .card-header {
  margin-bottom: 4px;
}

.task-id {
  font-size: 12px;
  color: var(--hf-text-placeholder);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

.task-card--small .task-id {
  font-size: 11px;
}

.card-title {
  font-size: 14px;
  color: var(--hf-text-primary);
  line-height: 1.4;
  margin-bottom: 8px;
}

.task-card--small .card-title {
  font-size: 13px;
  margin-bottom: 6px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-card--small .card-footer {
  font-size: 11px;
}

.priority {
  font-size: 12px;
  font-weight: 500;
}

.assignee {
  font-size: 12px;
  color: var(--hf-text-secondary);
}
</style>
