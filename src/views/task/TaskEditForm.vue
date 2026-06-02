<template>
  <el-card class="section-card" shadow="never">
    <template #header>
      <div class="card-header">
        <el-icon>
          <Edit />
        </el-icon>
        <span>编辑任务</span>
      </div>
    </template>
    <el-form :model="form" label-width="80px">
      <el-form-item label="标题" required>
        <el-input v-model="form.title" maxlength="200" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="6" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.type">
          <el-option v-for="(info, key) in TASK_TYPE_MAP" :key="key" :label="info.label" :value="Number(key)" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级">
        <el-select v-model="form.priority">
          <el-option v-for="(info, key) in TASK_PRIORITY_MAP" :key="key" :label="info.label" :value="Number(key)" />
        </el-select>
      </el-form-item>
      <el-form-item label="到期时间">
        <el-date-picker v-model="form.dueDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="Sprint">
        <el-select v-model="form.sprintId" placeholder="请选择" clearable>
          <el-option v-for="s in sprints" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { Edit } from '@element-plus/icons-vue'
import { TASK_TYPE_MAP, TASK_PRIORITY_MAP } from '@/utils/constants'

defineProps({
  form: { type: Object, required: true },
  sprints: { type: Array, default: () => [] }
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
</style>
