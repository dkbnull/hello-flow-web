<template>
  <div class="notification-settings">
    <el-form label-width="120px" style="max-width: 500px">
      <el-form-item label="邮箱通知">
        <el-switch v-model="emailEnabled" :active-value="1" :inactive-value="0" @change="handleSave" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNotificationSettings, updateNotificationSettings } from '@/api/notification'
import { ElMessage } from 'element-plus'

const emailEnabled = ref(0)

async function loadSettings() {
  try {
    const res = await getNotificationSettings()
    emailEnabled.value = res.data?.emailEnabled || 0
  } catch {
    // 忽略
  }
}

async function handleSave() {
  try {
    await updateNotificationSettings({ emailEnabled: emailEnabled.value })
    ElMessage.success('设置已保存')
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.notification-settings {
  padding: 0;
}
</style>
