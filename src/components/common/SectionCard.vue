<template>
  <el-card class="section-card" shadow="never">
    <template v-if="title" #header>
      <div class="card-header">
        <el-icon v-if="icon">
          <component :is="icon" />
        </el-icon>
        <span>{{ title }}</span>
        <div class="card-header-extra">
          <slot name="header-extra" />
        </div>
      </div>
    </template>
    <slot />
  </el-card>
</template>

<script setup>
// 通用区块卡片组件，统一 section-card + card-header 样式
defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, String],
    default: null
  }
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

.card-header-extra {
  margin-left: auto;
}
</style>
