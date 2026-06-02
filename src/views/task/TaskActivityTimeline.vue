<template>
  <el-card class="section-card" shadow="never">
    <template #header>
      <div class="card-header">
        <el-icon>
          <Clock />
        </el-icon>
        <span>操作历史</span>
        <el-button v-if="activities.length > 1" link type="primary" size="small" @click="expanded = !expanded">
          {{ expanded ? '收起' : `查看全部 (${activities.length})` }}
        </el-button>
      </div>
    </template>
    <div v-if="activities.length > 0" class="history-list" :class="{ 'history-expanded': expanded }">
      <el-timeline>
        <el-timeline-item v-for="act in displayedActivities" :key="act.id" :timestamp="act.createdAt" placement="top">
          {{ act.username }} {{ act.action }}
          <span v-if="act.description" class="history-desc">{{ act.description }}</span>
        </el-timeline-item>
      </el-timeline>
    </div>
    <div v-else class="empty-text">暂无操作记录</div>
  </el-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Clock } from '@element-plus/icons-vue'

const props = defineProps({
  activities: { type: Array, default: () => [] }
})

const expanded = ref(false)

const displayedActivities = computed(() => {
  if (expanded.value) return props.activities
  return props.activities.slice(0, 1)
})
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

.history-list {
  max-height: 120px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.history-list.history-expanded {
  max-height: 400px;
  overflow-y: auto;
}

.history-desc {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: var(--hf-text-secondary);
}
</style>
