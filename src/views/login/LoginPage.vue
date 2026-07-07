<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo-wrap">
          <img src="@/assets/logo.png" alt="logo" class="login-logo" />
        </div>
        <h1 class="login-title">HelloFlow</h1>
        <p class="login-subtitle">软件研发项目管理工具</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #E0F2FE 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 80%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.login-page::after {
  content: '';
  position: absolute;
  bottom: -40%;
  left: -20%;
  width: 60%;
  height: 140%;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

.login-card {
  width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  border-radius: var(--hf-radius-xl);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo-wrap {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: var(--hf-primary-bg);
  border-radius: var(--hf-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-logo {
  width: 64px;
  height: 64px;
}

.login-title {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  color: var(--hf-text-primary);
  letter-spacing: -0.02em;
}

.login-subtitle {
  color: var(--hf-text-secondary);
  font-size: 14px;
  margin: 0;
}

.login-form .el-form-item {
  margin-bottom: 22px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: var(--hf-radius-sm);
  padding: 4px 12px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  border-radius: var(--hf-radius-sm);
}
</style>
