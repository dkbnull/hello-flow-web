<template>
  <el-dialog
    v-model="visible"
    :title="parentTaskId ? '创建子任务' : '创建任务'"
    width="600px"
    align-center
    :close-on-click-modal="false"
    @opened="formRef?.clearValidate()"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入任务标题" maxlength="200" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入任务描述" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择">
          <el-option
            v-for="(info, key) in TASK_TYPE_MAP"
            :key="key"
            :label="info.label"
            :value="Number(key)"
          >
            <span class="type-option">
              <span class="type-dot" :style="{ background: info.color }"></span>
              {{ info.label }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="form.priority" placeholder="请选择">
          <el-option v-for="(info, key) in TASK_PRIORITY_MAP" :key="key" :label="info.label" :value="Number(key)" />
        </el-select>
      </el-form-item>
      <el-form-item label="开发工程师" prop="developerId">
        <el-select v-model="form.developerId" placeholder="请选择" clearable filterable>
          <el-option v-for="m in devMembers" :key="m.userId" :label="m.nickname" :value="m.userId" />
        </el-select>
      </el-form-item>
      <el-form-item label="测试工程师" prop="testerId">
        <el-select v-model="form.testerId" placeholder="请选择" clearable filterable>
          <el-option v-for="m in qaMembers" :key="m.userId" :label="m.nickname" :value="m.userId" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属迭代" prop="sprintId">
        <el-select v-model="form.sprintId" placeholder="请选择" clearable>
          <el-option v-for="s in sprints" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startDate">
        <el-date-picker v-model="form.startDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="到期时间" prop="dueDate">
        <el-date-picker v-model="form.dueDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getProjectMembers } from '@/api/project'
import { createSubtask, createTask } from '@/api/task'
import { getSprintList } from '@/api/sprint'
import { POSITION_CODE, TASK_PRIORITY_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  projectId: { type: [String, Number], required: true },
  devLeadId: { type: [String, Number], default: null },
  testLeadId: { type: [String, Number], default: null },
  parentTaskId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'created'])

const visible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const devMembers = ref([])
const qaMembers = ref([])
const sprints = ref([])

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const form = ref(getDefaultForm())

function getDefaultForm() {
  return {
    title: '',
    description: '',
    type: 1,
    priority: 3,
    developerId: null,
    testerId: null,
    sprintId: null,
    startDate: getToday(),
    dueDate: getToday()
  }
}

const rules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  developerId: [{ required: true, message: '请选择开发工程师', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  dueDate: [{ required: true, message: '请选择到期时间', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    loadOptions()
    resetForm()
  }
})

function resetForm() {
  form.value = getDefaultForm()
  form.value.developerId = props.devLeadId || null
  form.value.testerId = props.testLeadId || null
}

async function loadOptions() {
  const id = props.projectId
  if (!id) return
  try {
    const [devRes, qaRes, sprintRes] = await Promise.all([
      getProjectMembers(id, { positionCode: POSITION_CODE.DEV }),
      getProjectMembers(id, { positionCode: POSITION_CODE.QA }),
      getSprintList(id)
    ])
    devMembers.value = (devRes.data || []).map(m => ({ userId: m.userId, nickname: m.nickname || m.username }))
    qaMembers.value = (qaRes.data || []).map(m => ({ userId: m.userId, nickname: m.nickname || m.username }))
    sprints.value = sprintRes.data || []
  } catch {
    // 忽略
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const data = { ...form.value }
    if (props.parentTaskId) {
      await createSubtask(props.parentTaskId, data)
    } else {
      await createTask(props.projectId, data)
    }
    ElMessage.success(props.parentTaskId ? '子任务创建成功' : '任务创建成功')
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

<style scoped>
.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
