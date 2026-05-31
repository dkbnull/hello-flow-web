<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="$router.push('/dashboard')">返回工作台</el-button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.not-found h1 {
  font-size: 72px;
  color: var(--hf-primary);
  margin-bottom: 8px;
}

.not-found p {
  font-size: 18px;
  color: var(--hf-text-secondary);
  margin-bottom: 24px;
}
</style>
