<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑用户' : '新建用户'" width="520px"
             @opened="formRef?.clearValidate()">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
      <el-form-item v-if="!isEdit" label="用户名" prop="username">
        <el-input v-model="form.username" maxlength="50" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="form.password" type="password" show-password maxlength="50" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" maxlength="50" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" maxlength="100" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" maxlength="20" />
      </el-form-item>
      <el-form-item label="职位" prop="positionId">
        <el-select v-model="form.positionId" placeholder="请选择" clearable>
          <el-option v-for="p in positions" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="roleCode">
        <el-select v-model="form.roleCode" placeholder="请选择" clearable>
          <el-option v-for="r in roles" :key="r.code" :label="r.name" :value="r.code" />
        </el-select>
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
import { createUser, updateUser } from '@/api/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  roles: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] }
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
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  positionId: null,
  roleCode: null
}

const form = ref({ ...defaultForm })

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, {
    min: 6,
    message: '密码至少6位',
    trigger: 'blur'
  }],
  positionId: [{ required: true, message: '请选择职位', trigger: 'change' }],
  roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.editData) {
      form.value = {
        id: props.editData.id,
        username: props.editData.username,
        password: '',
        nickname: props.editData.nickname || '',
        email: props.editData.email || '',
        phone: props.editData.phone || '',
        positionId: props.editData.positionId,
        roleCode: props.editData.roles?.[0] || null
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
      const { id, username, password, ...data } = form.value
      await updateUser(id, data)
      ElMessage.success('更新成功')
    } else {
      await createUser(form.value)
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
