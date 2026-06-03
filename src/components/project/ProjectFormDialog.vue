<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑项目' : '新建项目'" width="520px">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" maxlength="100" />
      </el-form-item>
      <el-form-item label="项目编码" prop="code">
        <el-input v-model="form.code" maxlength="20" placeholder="如 HF、PROJ 等" />
      </el-form-item>
      <el-form-item label="项目描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="项目经理" prop="pmId">
        <el-select v-model="form.pmId" placeholder="请选择" clearable filterable>
          <el-option v-for="u in pmUsers" :key="u.id" :label="u.nickname || u.username" :value="u.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="开发主管" prop="devLeadId">
        <el-select v-model="form.devLeadId" placeholder="请选择" clearable filterable>
          <el-option v-for="u in devUsers" :key="u.id" :label="u.nickname || u.username" :value="u.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="测试主管" prop="testLeadId">
        <el-select v-model="form.testLeadId" placeholder="请选择" clearable filterable>
          <el-option v-for="u in qaUsers" :key="u.id" :label="u.nickname || u.username" :value="u.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isEdit" label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">进行中</el-radio>
          <el-radio :value="0">归档</el-radio>
        </el-radio-group>
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
import { createProject, updateProject } from '@/api/project'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  pmUsers: { type: Array, default: () => [] },
  devUsers: { type: Array, default: () => [] },
  qaUsers: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData?.id)

const saving = ref(false)
const formRef = ref(null)

const defaultForm = {
  id: null,
  name: '',
  code: '',
  description: '',
  pmId: null,
  devLeadId: null,
  testLeadId: null,
  status: 1
}

const form = ref({ ...defaultForm })

const formRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入项目编码', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.editData) {
      form.value = {
        id: props.editData.id,
        name: props.editData.name,
        code: props.editData.code || '',
        description: props.editData.description || '',
        pmId: props.editData.pmId,
        devLeadId: props.editData.devLeadId,
        testLeadId: props.editData.testLeadId,
        status: props.editData.status
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
      await updateProject(id, data)
      ElMessage.success('更新成功')
    } else {
      await createProject(form.value)
      ElMessage.success('创建成功')
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
