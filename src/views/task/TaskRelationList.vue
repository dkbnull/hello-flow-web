<template>
  <SectionCard title="关联任务" :icon="Share">
    <template #header-extra>
      <el-button link type="primary" size="small" @click="$emit('add')">添加</el-button>
    </template>
    <div v-if="relations.length === 0" class="hf-empty-text">暂无关联</div>
    <div v-for="rel in relations" :key="rel.id" class="relation-item">
      <el-tag size="small">{{ RELATION_TYPE_MAP[rel.relationType] }}</el-tag>
      <span class="relation-link" @click="$emit('go-to-task', rel.relatedTaskId)">{{ rel.relatedTaskTitle }}</span>
      <el-button type="danger" link size="small" @click="$emit('remove', rel.id)">移除</el-button>
    </div>
  </SectionCard>
</template>

<script setup>
import { Share } from '@element-plus/icons-vue'
import { RELATION_TYPE_MAP } from '@/utils/constants'
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
