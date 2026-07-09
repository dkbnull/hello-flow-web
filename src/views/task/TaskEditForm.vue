<template>
  <SectionCard title="编辑任务" :icon="Edit">
    <el-form :model="form" label-width="90px">
      <el-form-item label="标题" required>
        <el-input v-model="form.title" maxlength="200" />
      </el-form-item>
      <el-form-item label="描述">
        <MarkdownEditor v-model="form.description" />
      </el-form-item>
      <el-form-item label="优先级">
        <el-select v-model="form.priority">
          <el-option v-for="(info, key) in TASK_PRIORITY_MAP" :key="key" :label="info.label" :value="Number(key)" />
        </el-select>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="开始日期">
            <el-date-picker v-model="form.startDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="截止日期">
            <el-date-picker v-model="form.dueDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属迭代">
            <el-select v-model="form.sprintId" placeholder="请选择" clearable>
              <el-option v-for="s in sprints" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模块">
            <el-select v-model="form.moduleId" placeholder="请选择" clearable>
              <el-option v-for="m in modules" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="开发工程师">
            <el-select v-model="form.developerId" placeholder="请选择" clearable filterable>
              <el-option v-for="m in devMembers" :key="m.userId" :label="m.nickname" :value="m.userId" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="测试工程师">
            <el-select v-model="form.testerId" placeholder="请选择" clearable filterable>
              <el-option v-for="m in qaMembers" :key="m.userId" :label="m.nickname" :value="m.userId" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="标签">
        <el-select v-model="form.tagIds" multiple filterable default-first-option placeholder="选择标签">
          <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
      </el-form-item>
      <!-- 缺陷特有字段 -->
      <template v-if="isBug">
        <el-form-item label="影响版本">
          <el-select v-model="form.affectedVersionIds" placeholder="请选择影响版本" clearable filterable multiple>
            <el-option v-for="v in versions" :key="v.id" :label="v.name" :value="v.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="缺陷类型">
              <el-select v-model="form.defectType" placeholder="请选择">
                <el-option v-for="(info, key) in DEFECT_TYPE_MAP" :key="key" :label="info.label" :value="Number(key)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="复现概率">
              <el-select v-model="form.reproductionProbability" placeholder="请选择">
                <el-option v-for="(info, key) in REPRODUCTION_PROBABILITY_MAP" :key="key" :label="info.label"
                           :value="Number(key)" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>
  </SectionCard>
</template>

<script setup>
import { computed } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { DEFECT_TYPE_MAP, REPRODUCTION_PROBABILITY_MAP, TASK_PRIORITY_MAP, TASK_TYPE } from '@/utils/constants'
import SectionCard from '@/components/common/SectionCard.vue'
import MarkdownEditor from '@/components/common/MarkdownEditor.vue'

const props = defineProps({
  form: { type: Object, required: true },
  sprints: { type: Array, default: () => [] },
  modules: { type: Array, default: () => [] },
  versions: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  devMembers: { type: Array, default: () => [] },
  qaMembers: { type: Array, default: () => [] }
})

const isBug = computed(() => props.form.type === TASK_TYPE.BUG)
</script>
