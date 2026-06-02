<template>
  <div class="page-header">
    <el-button @click="$emit('go-back')" :icon="ArrowLeft" size="default" text />
    <template v-if="task">
      <div class="header-info">
        <span class="task-no">{{ taskNo }}</span>
        <span class="header-title">{{ task.title }}</span>
        <el-tag :type="TASK_TYPE_MAP[task.type]?.tagType ?? 'info'" size="small">
          {{ TASK_TYPE_MAP[task.type]?.label || '任务' }}
        </el-tag>
        <el-tag :type="TASK_STATUS_MAP[task.status]?.tagType ?? 'info'" size="small">
          {{ TASK_STATUS_MAP[task.status]?.label || '未知' }}
        </el-tag>
        <el-tag v-if="task.isDelayed === 1" type="danger" size="small" effect="dark">已延期</el-tag>
      </div>
      <div class="header-actions">
        <el-button v-if="!editing" type="primary" size="default" @click="$emit('start-edit')">编辑</el-button>
        <template v-else>
          <el-button size="default" @click="$emit('cancel-edit')">取消</el-button>
          <el-button type="primary" size="default" :loading="saving" @click="$emit('save')">保存</el-button>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
import { TASK_TYPE_MAP, TASK_STATUS_MAP } from '@/utils/constants'

defineProps({
  task: { type: Object, default: null },
  taskNo: { type: String, default: '' },
  editing: { type: Boolean, default: false },
  saving: { type: Boolean, default: false }
})

defineEmits(['go-back', 'start-edit', 'cancel-edit', 'save'])
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 0;
  background: var(--hf-bg-card);
  border-bottom: 1px solid var(--hf-border);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-no {
  font-size: 13px;
  font-weight: 600;
  color: var(--hf-text-secondary);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--hf-text-primary);
}

.header-actions {
  margin-left: auto;
}
</style>
