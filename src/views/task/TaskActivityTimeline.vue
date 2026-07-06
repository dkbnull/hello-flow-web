<template>
  <div class="detail-section">
    <div class="section-title">
      <span>操作历史</span>
      <div class="section-title-actions">
        <el-button v-if="activities.length > 1" link type="primary" size="small" @click="expanded = !expanded">
          {{ expanded ? '收起' : `查看全部 (${activities.length})` }}
        </el-button>
      </div>
    </div>
    <div class="section-body">
      <div v-if="activities.length > 0" class="history-list" :class="{ 'history-expanded': expanded }">
        <el-timeline>
          <el-timeline-item v-for="act in displayedActivities" :key="act.id" :timestamp="act.createdAt" placement="top">
            {{ act.username }} {{ act.action }}
            <span v-if="act.description" class="history-desc">{{ act.description }}</span>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else class="hf-empty-text">暂无操作记录</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

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
