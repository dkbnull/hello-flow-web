<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑字典类型' : '新增字典类型'" width="480px">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="70px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { createDictType, updateDictType } from '@/api/dict'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData?.id)

const saving = ref(false)
const formRef = ref(null)

const defaultForm = { id: null, name: '', code: '', remark: '' }
const form = ref({ ...defaultForm })

const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    form.value = props.editData
      ? {
        id: props.editData.id,
        name: props.editData.name,
        code: props.editData.code,
        remark: props.editData.remark || ''
      }
      : { ...defaultForm }
  }
})

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      await updateDictType(form.value.id, form.value)
    } else {
      await createDictType(form.value)
    }
    ElMessage.success('保存成功')
    visible.value = false
    emit('saved')
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}
</script>
