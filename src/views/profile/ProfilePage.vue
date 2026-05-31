<template>
  <div class="profile-page">
    <el-tabs v-model="activeTab" class="profile-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="个人信息" name="info" />
      <el-tab-pane label="通知设置" name="notification-settings" />
    </el-tabs>
    <router-view />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeTab = ref('info')

const tabRouteMap = {
  info: 'ProfileInfo',
  'notification-settings': 'NotificationSettings'
}

function handleTabChange(tab) {
  const routeName = tabRouteMap[tab]
  if (routeName) {
    router.push({ name: routeName })
  }
}

function syncTabFromRoute() {
  const currentName = route.name
  for (const [tab, name] of Object.entries(tabRouteMap)) {
    if (currentName === name) {
      activeTab.value = tab
      return
    }
  }
  activeTab.value = 'info'
}

watch(() => route.name, () => {
  syncTabFromRoute()
}, { immediate: true })
</script>

<style scoped>
.profile-page {
  padding: 20px;
}

.profile-tabs {
  margin-bottom: 16px;
}
</style>
