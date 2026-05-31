<template>
  <div class="admin-layout">
    <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">
      <el-tab-pane label="用户管理" name="users" />
      <el-tab-pane label="项目管理" name="projects" />
      <el-tab-pane label="字典管理" name="dicts" />
    </el-tabs>
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeTab = ref('users')

const tabRouteMap = {
  users: 'AdminUsers',
  projects: 'AdminProjects',
  dicts: 'AdminDicts'
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
  activeTab.value = 'users'
}

onMounted(() => {
  syncTabFromRoute()
})
</script>

<style scoped>
.admin-layout {
  padding: var(--hf-page-padding);
}

.admin-layout :deep(.el-tabs__content) {
  display: none;
}
</style>
