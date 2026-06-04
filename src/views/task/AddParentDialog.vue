<template>
  <el-dialog
    v-model="visible"
    title="设置父任务"
    width="500px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="父任务" prop="parentId">
        <el-select
          v-model="form.parentId"
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
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getTaskList } from '@/api/task'

const props = defineProps({
  modelValue: Boolean,
  taskId: { type: Number, default: null },
  projectId: { type: [String, Number], default: null }
})

const emit = defineEmits(['update:modelValue', 'selected'])

const visible = ref(false)
const searching = ref(false)
const formRef = ref(null)
const taskOptions = ref([])

const form = ref({
  parentId: null
})

const rules = {
  parentId: [{ required: true, message: '请选择父任务', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    form.value = { parentId: null }
    taskOptions.value = []
    searchTasks('')
  }
})

async function searchTasks(query) {
  if (!props.projectId) return
  searching.value = true
  try {
    const params = { pageSize: 20 }
    if (query) params.keyword = query
    const res = await getTaskList(props.projectId, params)
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

  visible.value = false
  emit('selected', form.value.parentId)
}

function handleClose() {
  formRef.value?.resetFields()
}
</script>
