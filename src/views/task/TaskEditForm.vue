<template>
  <SectionCard title="编辑任务" :icon="Edit">
    <el-form :model="form" label-width="80px">
      <el-form-item label="标题" required>
        <el-input v-model="form.title" maxlength="200" />
      </el-form-item>
      <el-form-item label="描述">
        <MarkdownEditor v-model="form.description" />
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
      <el-form-item label="所属迭代">
        <el-select v-model="form.sprintId" placeholder="请选择" clearable>
          <el-option v-for="s in sprints" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
    </el-form>
  </SectionCard>
</template>

<script setup>
import { Edit } from '@element-plus/icons-vue'
import { TASK_PRIORITY_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import SectionCard from '@/components/common/SectionCard.vue'
import MarkdownEditor from '@/components/common/MarkdownEditor.vue'

defineProps({
  form: { type: Object, required: true },
  sprints: { type: Array, default: () => [] }
})
</script>
