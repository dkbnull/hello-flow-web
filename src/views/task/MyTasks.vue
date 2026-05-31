<template>
  <div class="my-tasks">
    <div class="page-header">
      <h2 class="page-title">我的任务</h2>
    </div>
    <TaskListPanel mode="my" />
  </div>
</template>

<script setup>
import TaskListPanel from '@/components/task/TaskListPanel.vue'
</script>

<style scoped>
.my-tasks {
  padding: var(--hf-page-padding);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.page-title {
  font-size: var(--hf-page-title-size);
  font-weight: 700;
  color: var(--hf-text-primary);
  letter-spacing: -0.02em;
}
</style>
