<template>
  <el-dialog
    v-model="visible"
    title="解决缺陷"
    width="600px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="解决状态" prop="resolutionStatus">
        <el-select v-model="form.resolutionStatus" placeholder="请选择解决状态">
          <el-option
            v-for="(info, key) in RESOLVE_REASON_MAP"
            :key="key"
            :label="info.label"
            :value="Number(key)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="缺陷原因" prop="resolutionCause">
        <el-input v-model="form.resolutionCause" placeholder="请输入缺陷原因" maxlength="200" />
      </el-form-item>
      <el-form-item label="解决方案" prop="resolutionSolution">
        <MarkdownEditor v-model="form.resolutionSolution" height="240px"
                        placeholder="请描述解决方案，支持 Markdown 语法" />
      </el-form-item>
      <el-form-item label="修复版本" prop="fixVersionIds">
        <el-select v-model="form.fixVersionIds" placeholder="请选择修复版本" clearable filterable multiple>
          <el-option
            v-for="v in versions"
            :key="v.id"
            :label="v.name"
            :value="v.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getVersionList } from '@/api/version'
import { RESOLVE_REASON_MAP } from '@/utils/constants'
import MarkdownEditor from '@/components/common/MarkdownEditor.vue'

// 缺陷解决对话框：收集解决信息，由父组件统一调用 transition API
const props = defineProps({
  modelValue: Boolean,
  projectId: { type: [String, Number], default: null }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const versions = ref([])

const form = ref({
  resolutionStatus: null,
  resolutionCause: '',
  resolutionSolution: '',
  fixVersionIds: []
})

const rules = {
  resolutionStatus: [{ required: true, message: '请选择解决状态', trigger: 'change' }],
  resolutionCause: [{ required: true, message: '请输入缺陷原因', trigger: 'blur' }],
  resolutionSolution: [{ required: true, message: '请输入解决方案', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    form.value = { resolutionStatus: null, resolutionCause: '', resolutionSolution: '', fixVersionIds: [] }
    loadVersions()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function loadVersions() {
  if (!props.projectId) return
  try {
    const res = await getVersionList({ projectId: props.projectId })
    versions.value = res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  // 将解决信息传递给父组件，由其调用 transition API
  emit('confirm', { ...form.value })
  visible.value = false
  submitting.value = false
}

function handleClose() {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.el-form :deep(.el-select) {
  width: 100%;
}
</style>
