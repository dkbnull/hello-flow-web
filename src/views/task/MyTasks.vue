<template>
  <div class="my-tasks">
    <PageHeader title="我的任务" />
    <TaskListPanel mode="my" />
  </div>
</template>

<script setup>
import TaskListPanel from '@/components/task/TaskListPanel.vue'
import PageHeader from '@/components/common/PageHeader.vue'
</script>

<style scoped>
.my-tasks {
  padding: var(--hf-page-padding);
}
</style>
