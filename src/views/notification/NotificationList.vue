<template>
  <div class="notification-list">
    <div class="page-header">
      <h2 class="page-title">通知中心</h2>
      <div class="header-actions">
        <el-radio-group v-model="readFilter" size="default" @change="handleFilterChange">
          <el-radio-button :value="null">全部</el-radio-button>
          <el-radio-button :value="0">未读</el-radio-button>
          <el-radio-button :value="1">已读</el-radio-button>
        </el-radio-group>
        <el-button size="default" @click="handleReadAll">全部已读</el-button>
      </div>
    </div>

    <div v-if="notifications.length === 0" class="empty-text">暂无通知</div>
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-item"
      :class="{ unread: notification.isRead === 0 }"
      @click="handleRead(notification)"
    >
      <div class="notification-left">
        <el-tag :type="getNotifTagType(notification.type)" size="small">
          {{ NOTIFICATION_TYPE_MAP[notification.type] || '通知' }}
        </el-tag>
      </div>
      <div class="notification-body">
        <div class="notification-title">{{ notification.title }}</div>
        <div class="notification-content">{{ notification.content }}</div>
        <div class="notification-time">{{ notification.createdAt }}</div>
      </div>
    </div>

    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      class="pagination"
      @current-change="loadNotifications"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNotificationList, markAsRead, markAllAsRead } from '@/api/notification'
import { useNotificationStore } from '@/stores/notification'
import { NOTIFICATION_TYPE_MAP } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const notificationStore = useNotificationStore()

const notifications = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const readFilter = ref(null)

function getNotifTagType(type) {
  const map = { 1: '', 2: 'warning', 3: 'danger', 4: 'success', 5: 'primary' }
  return map[type] || 'primary'
}

async function loadNotifications() {
  try {
    const params = { page: currentPage.value, pageSize }
    if (readFilter.value !== null) {
      params.isRead = readFilter.value
    }
    const res = await getNotificationList(params)
    notifications.value = res.data.records || []
    total.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

function handleFilterChange() {
  currentPage.value = 1
  loadNotifications()
}

async function handleRead(notification) {
  if (notification.isRead === 0) {
    try {
      await markAsRead(notification.id)
      notification.isRead = 1
      notificationStore.decreaseUnread()
    } catch {
      // 忽略
    }
  }
}

async function handleReadAll() {
  try {
    await markAllAsRead()
    notifications.value.forEach(n => {
      n.isRead = 1
    })
    notificationStore.clearUnread()
    ElMessage.success('已全部标记为已读')
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notification-list {
  padding: var(--hf-page-padding);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--hf-page-title-margin);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: var(--hf-page-title-size);
  font-weight: 700;
  color: var(--hf-text-primary);
  letter-spacing: -0.02em;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--hf-border);
  border-radius: var(--hf-radius-sm);
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 8px;
  background: var(--hf-bg-card);
}

.notification-item:hover {
  background: var(--hf-bg-page);
}

.notification-item.unread {
  background: var(--hf-primary-bg);
}

.notification-body {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--hf-text-primary);
  margin-bottom: 4px;
}

.notification-content {
  font-size: 13px;
  color: var(--hf-text-regular);
  line-height: 1.5;
}

.notification-time {
  font-size: 12px;
  color: var(--hf-text-placeholder);
  margin-top: 4px;
}

.empty-text {
  text-align: center;
  color: var(--hf-text-placeholder);
  padding: 40px 0;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
