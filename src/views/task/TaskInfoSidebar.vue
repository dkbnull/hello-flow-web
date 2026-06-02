<template>
  <el-card class="info-card" shadow="never">
    <template #header>
      <div class="card-header">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <span>任务信息</span>
      </div>
    </template>
    <div class="info-list">
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <User />
          </el-icon>
          创建人
        </div>
        <div class="info-value">{{ task.reporterName || '-' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Cpu />
          </el-icon>
          开发工程师
        </div>
        <div class="info-value">{{ task.developerName || '-' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Monitor />
          </el-icon>
          测试工程师
        </div>
        <div class="info-value">{{ task.testerName || '-' }}</div>
      </div>
      <el-divider style="margin: 8px 0" />
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <PriceTag />
          </el-icon>
          类型
        </div>
        <div class="info-value">
          <el-tag :type="TASK_TYPE_MAP[task.type]?.tagType ?? 'info'" size="small">
            {{ TASK_TYPE_MAP[task.type]?.label || '未知' }}
          </el-tag>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Flag />
          </el-icon>
          优先级
        </div>
        <div class="info-value">
          <span :style="{ color: TASK_PRIORITY_MAP[task.priority]?.color, fontWeight: 500 }">
            {{ TASK_PRIORITY_MAP[task.priority]?.label || '未知' }}
          </span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Calendar />
          </el-icon>
          到期时间
        </div>
        <div class="info-value" :class="{ overdue: isOverdue }">{{ task.dueDate || '-' }}</div>
      </div>
      <el-divider style="margin: 8px 0" />
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Clock />
          </el-icon>
          创建时间
        </div>
        <div class="info-value">{{ task.createdAt }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <RefreshRight />
          </el-icon>
          更新时间
        </div>
        <div class="info-value">{{ task.updatedAt }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { TASK_TYPE_MAP, TASK_PRIORITY_MAP, TASK_STATUS } from '@/utils/constants'
import { Calendar, Clock, Cpu, Flag, InfoFilled, Monitor, PriceTag, RefreshRight, User } from '@element-plus/icons-vue'

const props = defineProps({
  task: { type: Object, required: true }
})

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  if (props.task.status === TASK_STATUS.DONE || props.task.status === TASK_STATUS.CLOSED) return false
  return new Date(props.task.dueDate) < new Date()
})
</script>

<style scoped>
.info-card {
  position: sticky;
  top: 20px;
  border-radius: var(--hf-radius-md);
  border: 1px solid var(--hf-border);
}

.info-card :deep(.el-card__header) {
  padding: 12px 20px;
  background: var(--hf-bg-page);
  border-bottom: 1px solid var(--hf-border-light);
}

.info-card :deep(.el-card__body) {
  padding: 12px 20px;
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

.info-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--hf-text-secondary);
  flex-shrink: 0;
}

.info-label .el-icon {
  font-size: 14px;
}

.info-value {
  font-size: 14px;
  color: var(--hf-text-primary);
  text-align: right;
  word-break: break-all;
}

.info-value.overdue {
  color: var(--hf-danger);
  font-weight: 500;
}
</style>
