<template>
  <el-dialog
    v-model="visible"
    title="添加关联任务"
    width="500px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="关联类型" prop="relationType">
        <el-select v-model="form.relationType" placeholder="请选择">
          <el-option
            v-for="(label, key) in RELATION_TYPE_MAP"
            :key="key"
            :label="label"
            :value="Number(key)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联任务" prop="relatedTaskId">
        <el-select
          v-model="form.relatedTaskId"
          placeholder="请输入任务编码或标题搜索"
          filterable
          remote
          :remote-method="searchTasks"
          :loading="searching"
        >
          <el-option
            v-for="t in taskOptions"
            :key="t.id"
            :label="`${t.taskCode || t.id} - ${t.title}`"
            :value="t.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { addTaskRelation, getTaskList } from '@/api/task'
import { RELATION_TYPE_MAP } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  taskId: { type: Number, default: null },
  projectId: { type: [String, Number], default: null }
})

const emit = defineEmits(['update:modelValue', 'created'])

const visible = ref(false)
const submitting = ref(false)
const searching = ref(false)
const formRef = ref(null)
const taskOptions = ref([])

const form = ref({
  relationType: 1,
  relatedTaskId: null
})

const rules = {
  relationType: [{ required: true, message: '请选择关联类型', trigger: 'change' }],
  relatedTaskId: [{ required: true, message: '请选择关联任务', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    form.value = { relationType: 1, relatedTaskId: null }
    taskOptions.value = []
    searchTasks('')
  }
})

async function searchTasks(query) {
  if (!props.projectId) return
  searching.value = true
  try {
    const params = { projectId: props.projectId, pageSize: 20 }
    if (query) params.keyword = query
    const res = await getTaskList(params)
    const list = res.data?.records || res.data || []
    // 排除当前任务
    taskOptions.value = list.filter(t => t.id !== props.taskId)
  } catch {
    // 忽略
  } finally {
    searching.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await addTaskRelation(props.taskId, form.value)
    ElMessage.success('关联任务添加成功')
    visible.value = false
    emit('created')
  } catch {
    // 错误已在拦截器中处理
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  formRef.value?.resetFields()
}
</script>
