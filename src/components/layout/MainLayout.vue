<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="sidebar-header">
        <img src="@/assets/logo.png" alt="logo" class="sidebar-logo" />
        <span v-show="!isCollapsed" class="sidebar-title">HelloFlow</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon>
            <Monitor />
          </el-icon>
          <template #title>工作台</template>
        </el-menu-item>

        <el-menu-item index="/projects">
          <el-icon>
            <Folder />
          </el-icon>
          <template #title>项目</template>
        </el-menu-item>

        <el-menu-item index="/my-tasks">
          <el-icon>
            <List />
          </el-icon>
          <template #title>我的任务</template>
        </el-menu-item>

        <el-menu-item index="/notifications">
          <el-icon>
            <Bell />
          </el-icon>
          <template #title>通知中心</template>
        </el-menu-item>

        <el-divider v-if="isAdmin" />

        <el-menu-item v-if="isAdmin" index="/admin/users">
          <el-icon>
            <Setting />
          </el-icon>
          <template #title>管理后台</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-center">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索任务..."
            :prefix-icon="Search"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="header-right">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="notification-badge">
            <el-icon class="header-icon" @click="$router.push('/notifications')">
              <Bell />
            </el-icon>
          </el-badge>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="user?.avatar">
                {{ user?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="user-name">{{ user?.nickname || user?.username || '用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="notification-settings">通知设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { Bell, Expand, Fold, Folder, List, Monitor, Search, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isCollapsed = ref(false)
const searchKeyword = ref('')

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const unreadCount = computed(() => notificationStore.unreadCount)

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/projects/')) {
    return '/projects'
  }
  return path
})

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/my-tasks', query: { keyword: searchKeyword.value.trim() } })
  }
}

async function handleUserCommand(command) {
  if (command === 'profile') {
    router.push('/profile/info')
  } else if (command === 'notification-settings') {
    router.push('/profile/notification-settings')
  } else if (command === 'logout') {
    await authStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  await notificationStore.fetchUnreadCount()
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background: var(--hf-bg-sidebar);
  border-right: 1px solid var(--hf-border);
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--hf-border-light);
  overflow: hidden;
}

.sidebar-logo {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.sidebar-title {
  color: var(--hf-text-primary);
  font-size: 18px;
  font-weight: 700;
  margin-left: 10px;
  white-space: nowrap;
  letter-spacing: -0.02em;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: 8px;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 100%;
}

:deep(.el-menu) {
  background: transparent;
}

:deep(.el-menu-item) {
  color: var(--hf-sidebar-text);
  border-radius: var(--hf-radius-sm);
  margin-bottom: 2px;
  height: 44px;
  line-height: 44px;
  box-sizing: border-box;
}

:deep(.el-menu-item:hover) {
  color: var(--hf-text-primary);
  background: var(--hf-sidebar-hover);
}

:deep(.el-menu-item.is-active) {
  color: var(--hf-sidebar-text-active);
  background: var(--hf-sidebar-bg-active);
  font-weight: 500;
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

:deep(.el-menu--collapse) {
  width: 100% !important;
}

:deep(.el-menu--collapse .el-menu-item) {
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  width: 100%;
}

:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin-right: 0 !important;
}

:deep(.el-menu--collapse .el-menu-item .el-menu-tooltip__trigger) {
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  width: 100%;
}

.sidebar .el-divider {
  border-color: var(--hf-border-light);
  margin: 8px 12px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--hf-bg-header);
  border-bottom: 1px solid var(--hf-border);
  padding: 0 24px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: var(--hf-text-secondary);
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: var(--hf-text-primary);
}

.header-center {
  flex: 1;
  max-width: 420px;
  margin: 0 24px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  background: var(--hf-bg-page);
  border-radius: 20px;
  box-shadow: none !important;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.search-input :deep(.el-input__wrapper:hover) {
  border-color: var(--hf-border);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--hf-primary);
  background: var(--hf-bg-card);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-badge {
  line-height: 1;
}

.header-icon {
  font-size: 20px;
  cursor: pointer;
  color: var(--hf-text-secondary);
  transition: color 0.2s;
}

.header-icon:hover {
  color: var(--hf-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--hf-radius-sm);
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--hf-bg-page);
}

.user-name {
  font-size: 14px;
  color: var(--hf-text-regular);
  font-weight: 500;
}

.main-content {
  background: var(--hf-bg-page);
  overflow-y: auto;
}
</style>
