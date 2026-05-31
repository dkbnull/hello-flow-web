<template>
  <div class="profile-info">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 500px">
      <el-form-item label="用户名">
        <el-input :model-value="user?.username" disabled />
      </el-form-item>
      <el-form-item label="职位">
        <el-input :model-value="user?.positionName" disabled />
      </el-form-item>
      <el-form-item label="角色">
        <el-input :model-value="user?.roleName" disabled />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="50" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="100" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="20" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { updateCurrentUser } from '@/api/user'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const formRef = ref(null)
const saving = ref(false)

const form = ref({
  nickname: '',
  email: '',
  phone: ''
})

const rules = {
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await updateCurrentUser(form.value)
    ElMessage.success('保存成功')
    await authStore.fetchCurrentUser()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (user.value) {
    form.value = {
      nickname: user.value.nickname || '',
      email: user.value.email || '',
      phone: user.value.phone || ''
    }
  }
})
</script>

<style scoped>
.profile-info {
  padding: 0;
}
</style>
