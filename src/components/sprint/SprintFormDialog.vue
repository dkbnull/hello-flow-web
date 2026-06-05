<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑迭代' : '创建迭代'" width="500px" align-center>
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入迭代名称" maxlength="100" />
      </el-form-item>
      <el-form-item label="目标" prop="goal">
        <el-input v-model="form.goal" type="textarea" :rows="3" placeholder="请输入迭代目标" maxlength="500" />
      </el-form-item>
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker v-model="form.startDate" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker v-model="form.endDate" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">{{ isEdit ? '保存' : '创建' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { createSprint, updateSprint } from '@/api/sprint'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  projectId: { type: [String, Number], default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData?.id)

const saving = ref(false)
const formRef = ref(null)

const defaultForm = { id: null, name: '', goal: '', startDate: '', endDate: '' }
const form = ref({ ...defaultForm })

const formRules = {
  name: [{ required: true, message: '请输入迭代名称', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.editData) {
      form.value = {
        id: props.editData.id,
        name: props.editData.name,
        goal: props.editData.goal || '',
        startDate: props.editData.startDate,
        endDate: props.editData.endDate
      }
    } else {
      form.value = { ...defaultForm }
    }
  }
})

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      const { id, ...data } = form.value
      await updateSprint(id, data)
      ElMessage.success('迭代更新成功')
    } else {
      const data = { ...form.value, projectId: props.projectId }
      await createSprint(data)
      ElMessage.success('迭代创建成功')
    }
    visible.value = false
    emit('saved')
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}
</script>
