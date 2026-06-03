<template>
  <SectionCard title="关联任务" :icon="Share">
    <template #header-extra>
      <el-button link type="primary" size="small" @click="$emit('add')">添加</el-button>
    </template>
    <div v-if="relations.length === 0" class="hf-empty-text">暂无关联</div>
    <div v-for="rel in relations" :key="rel.id" class="relation-item" @click="$emit('go-to-task', rel.relatedTaskId)">
      <el-tag size="small" effect="plain">{{ RELATION_TYPE_MAP[rel.relationType] }}</el-tag>
      <el-tag :type="TASK_STATUS_MAP[rel.relatedTaskStatus]?.tagType ?? 'info'" size="small">
        {{ TASK_STATUS_MAP[rel.relatedTaskStatus]?.label }}
      </el-tag>
      <el-tag :type="TASK_TYPE_MAP[rel.relatedTaskType]?.tagType ?? 'info'" size="small">
        {{ TASK_TYPE_MAP[rel.relatedTaskType]?.label }}
      </el-tag>
      <span class="task-code">{{ rel.relatedTaskCode || rel.relatedTaskId }}</span>
      <span class="relation-title">{{ rel.relatedTaskTitle }}</span>
      <span v-if="rel.relatedTaskDeveloperName" class="task-assignee">{{ rel.relatedTaskDeveloperName }}</span>
      <el-button type="danger" link size="small" @click.stop="$emit('remove', rel.id)">移除</el-button>
    </div>
  </SectionCard>
</template>

<script setup>
import { Share } from '@element-plus/icons-vue'
import { RELATION_TYPE_MAP, TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import SectionCard from '@/components/common/SectionCard.vue'

defineProps({
  relations: { type: Array, default: () => [] }
})

defineEmits(['add', 'remove', 'go-to-task'])
</script>

<style scoped>
.relation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--hf-radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.relation-item:hover {
  background: var(--hf-bg-page);
}

.relation-item + .relation-item {
  margin-top: 4px;
}

.task-code {
  font-size: 14px;
  color: var(--hf-primary);
  font-weight: 500;
  flex-shrink: 0;
}

.relation-title {
  flex: 1;
  font-size: 14px;
  color: var(--hf-primary);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.relation-title:hover {
  color: var(--hf-primary-dark, var(--hf-primary));
}

.task-assignee {
  font-size: 12px;
  color: var(--hf-text-secondary);
  flex-shrink: 0;
}
</style>
