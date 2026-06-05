<template>
  <div class="project-overview">
    <!-- 项目概览 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.totalTasks }}</div>
          <div class="stat-label">总任务数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-done">
          <div class="stat-value">{{ stats.completedTasks || 0 }}</div>
          <div class="stat-label">已完成</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-progress">
          <div class="stat-value">{{ stats.statusDistribution?.[2] || 0 }}</div>
          <div class="stat-label">进行中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-bug">
          <div class="stat-value">{{ stats.delayedTasks || 0 }}</div>
          <div class="stat-label">待处理</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 当前Sprint -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>当前迭代</span></template>
          <div v-if="currentSprint" class="sprint-info">
            <div class="sprint-name">{{ currentSprint.name }} - {{
                SPRINT_STATUS_MAP[currentSprint.status]?.label
              }}
            </div>
            <div class="sprint-date">{{ currentSprint.startDate }} ~ {{ currentSprint.endDate }}</div>
            <div v-if="currentSprint.goal" class="sprint-goal">目标：{{ currentSprint.goal }}</div>
            <el-progress :percentage="sprintProgress" :color="sprintProgress === 100 ? '#67C23A' : '#409EFF'" />
          </div>
          <div v-else class="hf-empty-text">暂无进行中的迭代</div>
        </el-card>
      </el-col>

      <!-- 任务状态分布 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>任务状态分布</span></template>
          <div class="status-distribution">
            <div v-for="(item, key) in statusDistribution" :key="key" class="status-bar-item">
              <span class="status-label">{{ item.label }}</span>
              <el-progress :percentage="item.percentage" :color="item.color" :stroke-width="16" :show-text="false" />
              <span class="status-count">{{ item.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近动态 -->
    <el-card shadow="hover" class="activity-card">
      <template #header><span>最近动态</span></template>
      <div v-if="activities.length === 0" class="hf-empty-text">暂无动态</div>
      <el-timeline v-else>
        <el-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :timestamp="activity.createdAt"
          placement="top"
        >
          <span>{{ activity.username }}</span>
          <span class="activity-action">{{ activity.action }}</span>
          <span v-if="activity.field">{{ activity.field }}：{{ activity.oldValue }} → {{ activity.newValue }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectStats } from '@/api/project'
import { getSprintList } from '@/api/sprint'
import { getActivities, getTaskList } from '@/api/task'
import { SPRINT_STATUS_MAP, TASK_STATUS_MAP } from '@/utils/constants'

const route = useRoute()

const stats = ref({})
const currentSprint = ref(null)
const sprintProgress = ref(0)
const activities = ref([])

const doneCount = computed(() => stats.value.completedTasks || 0)
const inProgressCount = computed(() => stats.value.statusDistribution?.[2] || 0)

const statusDistribution = computed(() => {
  const counts = stats.value.statusDistribution || {}
  const total = stats.value.totalTasks || 1
  const result = {}
  for (const [key, info] of Object.entries(TASK_STATUS_MAP)) {
    const count = counts[key] || 0
    result[key] = {
      label: info.label,
      count,
      color: info.color,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }
  }
  return result
})

onMounted(async () => {
  const projectId = route.params.id
  if (!projectId) return

  try {
    // 获取项目统计
    const statsRes = await getProjectStats(projectId)
    stats.value = statsRes.data

    // 获取当前Sprint
    const sprintRes = await getSprintList(projectId)
    const sprints = sprintRes.data || []
    currentSprint.value = sprints.find(s => s.status === 2) || null

    if (currentSprint.value) {
      // Sprint进度
      const taskRes = await getTaskList({ projectId, sprintId: currentSprint.value.id, page: 1, pageSize: 1 })
      const sprintTotal = taskRes.data?.total || 0
      const doneRes = await getTaskList({
        projectId,
        sprintId: currentSprint.value.id,
        status: 5,
        page: 1,
        pageSize: 1
      })
      const sprintDone = doneRes.data?.total || 0
      sprintProgress.value = sprintTotal > 0 ? Math.round((sprintDone / sprintTotal) * 100) : 0
    }

    // 最近动态 - 获取最近更新的任务活动
    const taskRes = await getTaskList({ projectId, pageSize: 5 })
    const recentTasks = taskRes.data?.records || []
    const allActivities = []
    for (const task of recentTasks.slice(0, 3)) {
      try {
        const actRes = await getActivities(task.id)
        allActivities.push(...(actRes.data || []).slice(0, 3))
      } catch {
        // 错误已在拦截器中处理
      }
    }
    activities.value = allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)
  } catch {
    // 错误已在拦截器中处理
  }
})
</script>

<style scoped>
.project-overview {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--hf-primary);
}

.stat-done .stat-value {
  color: #16A34A;
}

.stat-progress .stat-value {
  color: var(--hf-primary);
}

.stat-bug .stat-value {
  color: var(--hf-danger);
}

.stat-label {
  font-size: 14px;
  color: var(--hf-text-secondary);
  margin-top: 4px;
}

.sprint-info {
  padding: 8px 0;
}

.sprint-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--hf-text-primary);
  margin-bottom: 4px;
}

.sprint-date {
  font-size: 13px;
  color: var(--hf-text-secondary);
  margin-bottom: 4px;
}

.sprint-goal {
  font-size: 13px;
  color: var(--hf-text-regular);
  margin-bottom: 8px;
}

.status-distribution {
  padding: 8px 0;
}

.status-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.status-label {
  width: 60px;
  font-size: 13px;
  color: var(--hf-text-regular);
  text-align: right;
}

.status-bar-item .el-progress {
  flex: 1;
}

.status-count {
  width: 30px;
  font-size: 13px;
  color: var(--hf-text-primary);
}

.activity-card {
  margin-top: 20px;
}

.activity-action {
  color: var(--hf-primary);
  margin: 0 4px;
}
</style>
