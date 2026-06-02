<template>
  <el-card class="section-card" shadow="never">
    <template #header>
      <div class="card-header">
        <el-icon>
          <Share />
        </el-icon>
        <span>关联任务</span>
        <el-button link type="primary" size="small" @click="$emit('add')">添加</el-button>
      </div>
    </template>
    <div v-if="relations.length === 0" class="empty-text">暂无关联</div>
    <div v-for="rel in relations" :key="rel.id" class="relation-item">
      <el-tag size="small">{{ RELATION_TYPE_MAP[rel.relationType] }}</el-tag>
      <span class="relation-link" @click="$emit('go-to-task', rel.relatedTaskId)">{{ rel.relatedTaskTitle }}</span>
      <el-button type="danger" link size="small" @click="$emit('remove', rel.id)">移除</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { Share } from '@element-plus/icons-vue'
import { RELATION_TYPE_MAP } from '@/utils/constants'

defineProps({
  relations: { type: Array, default: () => [] }
})

defineEmits(['add', 'remove', 'go-to-task'])
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

.relation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.relation-item + .relation-item {
  border-top: 1px solid var(--hf-divider);
}

.relation-link {
  color: var(--hf-primary);
  cursor: pointer;
  flex: 1;
  font-size: 14px;
}

.relation-link:hover {
  text-decoration: underline;
}
</style>
