<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑字典数据' : '新增字典数据'" width="480px" align-center>
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="70px">
      <el-form-item label="标签" prop="label">
        <el-input v-model="form.label" />
      </el-form-item>
      <el-form-item label="值" prop="value">
        <el-input v-model="form.value" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" />
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
import { createDictData, updateDictData } from '@/api/dict'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  typeId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData?.id)

const saving = ref(false)
const formRef = ref(null)

const defaultForm = { id: null, typeId: null, label: '', value: '', sort: 0, remark: '' }
const form = ref({ ...defaultForm })

const formRules = {
  label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    form.value = props.editData
      ? {
        id: props.editData.id,
        typeId: props.typeId,
        label: props.editData.label,
        value: props.editData.value,
        sort: props.editData.sort || 0,
        remark: props.editData.remark || ''
      }
      : { ...defaultForm, typeId: props.typeId }
  }
})

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      await updateDictData(form.value.id, form.value)
    } else {
      await createDictData(form.value)
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
