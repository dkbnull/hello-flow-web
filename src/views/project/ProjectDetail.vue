<template>
  <div class="project-detail">
    <div class="project-header">
      <h2 class="project-name">{{ project?.name || '加载中...' }}</h2>
      <el-tag v-if="project" :type="PROJECT_STATUS_MAP[project.status]?.tagType || 'info'">
        {{ PROJECT_STATUS_MAP[project.status]?.label || '未知' }}
      </el-tag>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="project-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="概览" name="overview" />
      <el-tab-pane label="任务" name="tasks" />
      <el-tab-pane label="看板" name="board" />
      <el-tab-pane label="迭代" name="sprints" />
      <el-tab-pane label="成员" name="members" />
      <el-tab-pane label="模块" name="modules" />
      <el-tab-pane label="版本" name="versions" />
      <el-tab-pane label="设置" name="settings" />
    </el-tabs>

    <router-view />
  </div>
</template>

<script setup>
import { inject, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectDetail } from '@/api/project'
import { useProjectStore } from '@/stores/project'
import { PROJECT_STATUS_MAP } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const project = ref(null)
const activeTab = ref('overview')
const taskRefreshKey = ref(0)
// 监听全局刷新信号（header 新建任务后递增），转发为项目级刷新信号
const issueRefreshKey = inject('issueRefreshKey', ref(0))
watch(issueRefreshKey, () => {
  taskRefreshKey.value++
})

provide('taskRefreshKey', taskRefreshKey)

const tabRouteMap = {
  overview: 'ProjectOverview',
  tasks: 'ProjectTasks',
  board: 'ProjectBoard',
  sprints: 'ProjectSprints',
  members: 'ProjectMembers',
  modules: 'ProjectModules',
  versions: 'ProjectVersions',
  settings: 'ProjectSettings'
}

function handleTabChange(tab) {
  const routeName = tabRouteMap[tab]
  if (routeName) {
    router.push({ name: routeName, params: { id: route.params.id } })
  }
}

// 根据项目ID获取项目详情和成员信息
function syncTabFromRoute() {
  const currentName = route.name
  for (const [tab, name] of Object.entries(tabRouteMap)) {
    if (currentName === name || (currentName === 'SprintDetail' && tab === 'sprints')) {
      activeTab.value = tab
      return
    }
  }
  activeTab.value = 'overview'
}

async function loadProject() {
  const id = route.params.id
  if (!id) return
  try {
    const res = await getProjectDetail(id)
    project.value = res.data
    projectStore.setCurrentProject(res.data)
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadProject()
  syncTabFromRoute()
})

watch(() => route.name, () => {
  syncTabFromRoute()
})
</script>

<style scoped>
.project-detail {
  padding: var(--hf-page-padding);
}

.project-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.project-name {
  font-size: var(--hf-page-title-size);
  font-weight: 700;
  color: var(--hf-text-primary);
  letter-spacing: -0.02em;
}

.project-tabs {
  margin-bottom: 16px;
}
</style>
