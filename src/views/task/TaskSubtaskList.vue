<template>
  <SectionCard title="子任务" :icon="List">
    <template #header-extra>
      <el-button link type="primary" size="small" @click="$emit('add')">添加</el-button>
    </template>
    <div v-if="subtasks.length === 0" class="hf-empty-text">暂无子任务</div>
    <div v-for="sub in subtasks" :key="sub.id" class="subtask-item" @click="$emit('go-to-task', sub.id)">
      <el-tag :type="TASK_STATUS_MAP[sub.status]?.tagType ?? 'info'" size="small">
        {{ TASK_STATUS_MAP[sub.status]?.label }}
      </el-tag>
      <el-tag :type="TASK_TYPE_MAP[sub.type]?.tagType ?? 'info'" size="small">
        {{ TASK_TYPE_MAP[sub.type]?.label }}
      </el-tag>
      <span class="subtask-title">{{ sub.title }}</span>
    </div>
  </SectionCard>
</template>

<script setup>
import { List } from '@element-plus/icons-vue'
import { TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import SectionCard from '@/components/common/SectionCard.vue'

defineProps({
  subtasks: { type: Array, default: () => [] }
})

defineEmits(['add', 'go-to-task'])
</script>

<style scoped>
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
