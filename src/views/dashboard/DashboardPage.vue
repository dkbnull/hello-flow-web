<template>
  <div class="dashboard-page">
    <h2 class="page-title">工作台</h2>

    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <div class="stat-card stat-pending" @click="$router.push('/my-tasks')">
          <div class="stat-icon-wrap">
            <el-icon :size="22">
              <Clock />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pendingTasks }}</div>
            <div class="stat-label">待处理任务</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-review" @click="$router.push('/my-tasks?status=3')">
          <div class="stat-icon-wrap">
            <el-icon :size="22">
              <EditPen />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.reviewTasks }}</div>
            <div class="stat-label">待我评审</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-test" @click="$router.push('/my-tasks?status=4')">
          <div class="stat-icon-wrap">
            <el-icon :size="22">
              <CircleCheck />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.testTasks }}</div>
            <div class="stat-label">待测试</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-bug" @click="$router.push('/my-tasks?type=3')">
          <div class="stat-icon-wrap">
            <el-icon :size="22">
              <WarningFilled />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.myBugs }}</div>
            <div class="stat-label">我的缺陷</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-row">
      <el-col :span="14">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <span class="card-header-title">我的任务（最近更新）</span>
              <el-button link type="primary" @click="$router.push('/my-tasks')">查看全部</el-button>
            </div>
          </template>
          <div v-if="myTasks.length === 0" class="hf-empty-text">暂无任务</div>
          <div
            v-for="task in myTasks"
            :key="task.id"
            class="task-item"
            @click="goToTask(task)"
          >
            <div class="task-left">
              <el-tag :type="TASK_STATUS_MAP[task.status]?.tagType ?? 'info'" size="small" effect="light">
                {{ TASK_STATUS_MAP[task.status]?.label || '未知' }}
              </el-tag>
              <span class="task-id">{{ task.projectCode || 'TASK' }}-{{ task.id }}</span>
              <span class="task-title">{{ task.title }}</span>
            </div>
            <span class="task-project">{{ task.projectName }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <span class="card-header-title">通知动态</span>
              <el-button link type="primary" @click="$router.push('/notifications')">查看全部</el-button>
            </div>
          </template>
          <div v-if="notifications.length === 0" class="hf-empty-text">暂无通知</div>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
          >
            <div class="notification-content">{{ notification.content }}</div>
            <div class="notification-time">{{ formatRelativeTime(notification.createdAt) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="content-card">
      <template #header>
        <span class="card-header-title">项目进度概览</span>
      </template>
      <div v-if="projectProgress.length === 0" class="hf-empty-text">暂无项目</div>
      <el-row :gutter="16">
        <el-col v-for="project in projectProgress" :key="project.id" :span="8">
          <div class="project-item" @click="$router.push(`/projects/${project.id}`)">
            <div class="project-name">{{ project.name }}</div>
            <el-progress
              :percentage="project.progress"
              :stroke-width="6"
              :color="project.progress === 100 ? '#16A34A' : '#2563EB'"
            />
            <div class="project-meta">
              <span>{{ project.doneTasks }}/{{ project.totalTasks }} 任务完成</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getMyTasks } from '@/api/task'
import { getNotificationList } from '@/api/notification'
import { getProjectList, getProjectStats } from '@/api/project'
import { TASK_STATUS_MAP } from '@/utils/constants'
import { useDateFormat } from '@/composables/useDateFormat'
import { CircleCheck, Clock, EditPen, WarningFilled } from '@element-plus/icons-vue'

const router = useRouter()
const { formatRelativeTime } = useDateFormat()

const stats = ref({
  pendingTasks: 0,
  reviewTasks: 0,
  testTasks: 0,
  myBugs: 0
})
const myTasks = ref([])
const notifications = ref([])
const projectProgress = ref([])

function goToTask(task) {
  router.push({ name: 'TaskDetailPage', params: { taskId: task.id } })
}

function computeStats(allTasks) {
  stats.value.pendingTasks = allTasks.filter(t => t.status === 1).length
  stats.value.reviewTasks = allTasks.filter(t => t.status === 3).length
  stats.value.testTasks = allTasks.filter(t => t.status === 4).length
  stats.value.myBugs = allTasks.filter(t => t.type === 3 && t.status !== 5 && t.status !== 6 && t.status !== 7).length
}

onMounted(async () => {
  try {
    const [tasksRes, allTasksRes, notifRes, projRes] = await Promise.all([
      getMyTasks({ page: 1, pageSize: 10 }),
      getMyTasks({ page: 1, pageSize: 100 }),
      getNotificationList({ page: 1, pageSize: 10 }),
      getProjectList({ page: 1, pageSize: 50 })
    ])

    myTasks.value = tasksRes.data.records || []
    computeStats(allTasksRes.data.records || [])
    notifications.value = notifRes.data.records || []

    const projects = projRes.data.records || []
    const statPromises = projects.slice(0, 6).map(async (proj) => {
      try {
        const statRes = await getProjectStats(proj.id)
        const s = statRes.data
        const total = s.totalTasks || 0
        const done = s.completedTasks || 0
        return {
          id: proj.id,
          name: proj.name,
          totalTasks: total,
          doneTasks: done,
          progress: total > 0 ? Math.round((done / total) * 100) : 0
        }
      } catch {
        return null
      }
    })
    const results = await Promise.all(statPromises)
    projectProgress.value = results.filter(Boolean)
  } catch {
    // 错误已在拦截器中处理
  }
})
</script>

<style scoped>
.dashboard-page {
  padding: var(--hf-page-padding);
}

.page-title {
  font-size: var(--hf-page-title-size);
  font-weight: 700;
  color: var(--hf-text-primary);
  margin-bottom: var(--hf-page-title-margin);
  letter-spacing: -0.02em;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--hf-bg-card);
  border: 1px solid var(--hf-border);
  border-radius: var(--hf-radius-md);
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: var(--hf-primary-border);
  box-shadow: var(--hf-shadow-sm);
  transform: translateY(-1px);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--hf-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-pending .stat-icon-wrap {
  background: var(--hf-primary-bg);
  color: var(--hf-primary);
}

.stat-review .stat-icon-wrap {
  background: var(--hf-warning-bg);
  color: var(--hf-warning);
}

.stat-test .stat-icon-wrap {
  background: #F0FDF4;
  color: #16A34A;
}

.stat-bug .stat-icon-wrap {
  background: var(--hf-danger-bg);
  color: var(--hf-danger);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--hf-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--hf-text-secondary);
  margin-top: 2px;
}

.content-row {
  margin-bottom: 20px;
}

.content-card {
  border: 1px solid var(--hf-border);
}

.content-card :deep(.el-card__body) {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--hf-text-primary);
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--hf-divider);
  cursor: pointer;
  transition: background 0.15s;
  border-radius: var(--hf-radius-sm);
  padding-left: 4px;
  padding-right: 4px;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background: var(--hf-bg-page);
}

.task-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.task-id {
  color: var(--hf-text-placeholder);
  font-size: 12px;
  white-space: nowrap;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

.task-title {
  font-size: 14px;
  color: var(--hf-text-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-project {
  color: var(--hf-text-secondary);
  font-size: 12px;
  white-space: nowrap;
  margin-left: 12px;
}

.notification-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--hf-divider);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  font-size: 14px;
  color: var(--hf-text-regular);
  line-height: 1.5;
}

.notification-time {
  font-size: 12px;
  color: var(--hf-text-placeholder);
  margin-top: 4px;
}

.project-item {
  padding: 16px;
  border: 1px solid var(--hf-border);
  border-radius: var(--hf-radius-md);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.project-item:hover {
  border-color: var(--hf-primary-border);
  box-shadow: var(--hf-shadow-sm);
}

.project-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--hf-text-primary);
  margin-bottom: 10px;
}

.project-meta {
  font-size: 12px;
  color: var(--hf-text-secondary);
  margin-top: 6px;
}
</style>
