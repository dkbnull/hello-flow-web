<template>
  <SectionCard title="任务信息" :icon="InfoFilled">
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
  </SectionCard>
</template>

<script setup>
import { computed } from 'vue'
import { TASK_PRIORITY_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import { useTaskStatus } from '@/composables/useTaskStatus'
import { Calendar, Clock, Cpu, Flag, InfoFilled, Monitor, PriceTag, RefreshRight, User } from '@element-plus/icons-vue'
import SectionCard from '@/components/common/SectionCard.vue'

const props = defineProps({
  task: { type: Object, required: true }
})

const { isOverdue: checkOverdue } = useTaskStatus()

const isOverdue = computed(() => checkOverdue(props.task))
</script>

<style scoped>
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
