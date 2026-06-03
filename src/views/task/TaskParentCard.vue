<template>
  <SectionCard title="父任务" :icon="Link">
    <template #header-extra>
      <template v-if="!parentTask">
        <el-button link type="primary" size="small" @click="$emit('add')">添加</el-button>
      </template>
    </template>
    <div v-if="!parentTask" class="hf-empty-text">暂无父任务</div>
    <div v-else class="parent-item">
      <el-tag :type="TASK_STATUS_MAP[parentTask.status]?.tagType ?? 'info'" size="small">
        {{ TASK_STATUS_MAP[parentTask.status]?.label }}
      </el-tag>
      <el-tag :type="TASK_TYPE_MAP[parentTask.type]?.tagType ?? 'info'" size="small">
        {{ TASK_TYPE_MAP[parentTask.type]?.label }}
      </el-tag>
      <span class="task-code">{{ parentTask.taskCode || parentTask.id }}</span>
      <span class="parent-title" @click="$emit('go-to-task', parentTask.id)">{{ parentTask.title }}</span>
      <span v-if="parentTask.developerName" class="task-assignee">{{ parentTask.developerName }}</span>
      <el-button type="danger" link size="small" @click.stop="$emit('remove')">移除</el-button>
    </div>
  </SectionCard>
</template>

<script setup>
import { Link } from '@element-plus/icons-vue'
import { TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import SectionCard from '@/components/common/SectionCard.vue'

defineProps({
  parentTask: { type: Object, default: null }
})

defineEmits(['go-to-task', 'add', 'remove'])
</script>

<style scoped>
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
