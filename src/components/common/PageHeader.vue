<template>
  <div class="page-header">
    <div v-if="title" class="page-title">{{ title }}</div>
    <slot />
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
// 页面头部组件，统一页面标题和操作区的布局
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--hf-page-title-margin);
}

.page-title {
  font-size: var(--hf-page-title-size);
  font-weight: 700;
  color: var(--hf-text-primary);
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
</style>
