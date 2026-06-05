<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <el-icon :size="64">
          <Lock />
        </el-icon>
      </div>
      <h1 class="error-code">403</h1>
      <p class="error-title">访问受限</p>
      <p class="error-desc">你没有权限访问此页面，请联系管理员获取权限</p>
      <div class="error-actions">
        <el-button type="primary" size="large" @click="$router.push('/dashboard')">
          返回工作台
        </el-button>
        <el-button size="large" @click="$router.back()">
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lock } from '@element-plus/icons-vue'
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 50%, #FFE4E6 100%);
  position: relative;
  overflow: hidden;
}

.error-page::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 80%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(220, 38, 38, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.error-page::after {
  content: '';
  position: absolute;
  bottom: -40%;
  left: -20%;
  width: 60%;
  height: 140%;
  background: radial-gradient(ellipse, rgba(220, 38, 38, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.error-content {
  text-align: center;
  position: relative;
  z-index: 1;
  padding: 40px 24px;
}

.error-icon {
  color: var(--hf-danger);
  opacity: 0.7;
  margin-bottom: 16px;
  animation: pulse 2.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.5;
  }
}

.error-code {
  font-size: 96px;
  font-weight: 800;
  color: var(--hf-danger);
  line-height: 1;
  margin: 0 0 8px;
  letter-spacing: -0.04em;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--hf-text-primary);
  margin: 0 0 8px;
}

.error-desc {
  font-size: 14px;
  color: var(--hf-text-secondary);
  margin: 0 0 32px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
