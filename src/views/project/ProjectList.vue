<template>
  <div class="project-list-page">
    <div class="page-header">
      <h2 class="page-title">项目列表</h2>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="statusFilter" @change="loadProjects">
        <el-radio-button :value="1">进行中</el-radio-button>
        <el-radio-button :value="0">已归档</el-radio-button>
      </el-radio-group>
      <el-button
        :icon="sortOrder === 'desc' ? SortDown : SortUp"
        class="sort-btn"
        @click="toggleSort"
      >
        {{ sortOrder === 'desc' ? '最新优先' : '最早优先' }}
      </el-button>
    </div>

    <div v-if="projects.length === 0" class="empty-text">暂无项目</div>
    <el-row :gutter="16">
      <el-col v-for="project in projects" :key="project.id" :span="8">
        <div class="project-card" @click="goToProject(project.id)">
          <div class="project-card-header">
            <div class="project-icon-wrap">
              <el-icon :size="18">
                <Folder />
              </el-icon>
            </div>
            <span class="project-name">{{ project.name }}</span>
            <el-tag :type="PROJECT_STATUS_MAP[project.status]?.tagType ?? 'info'" size="small" effect="light">
              {{ PROJECT_STATUS_MAP[project.status]?.label || '未知' }}
            </el-tag>
          </div>
          <div class="project-card-desc">{{ project.description || '暂无描述' }}</div>
          <div class="project-card-meta">
            <span>项目经理：{{ project.pmName || '未指定' }}</span>
            <span>成员：{{ project.memberCount || 0 }}人</span>
          </div>
          <el-progress
            :percentage="project.progress || 0"
            :stroke-width="4"
            :color="project.progress === 100 ? '#16A34A' : '#2563EB'"
            :show-text="false"
          />
          <div class="project-progress-text">{{ project.progress || 0 }}% 完成</div>
        </div>
      </el-col>
    </el-row>

    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      class="pagination"
      @current-change="loadProjects"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProjectList, getProjectStats, getProjectMembers } from '@/api/project'
import { PROJECT_STATUS_MAP } from '@/utils/constants'
import { SortDown, SortUp } from '@element-plus/icons-vue'

const router = useRouter()

const projects = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const statusFilter = ref(1)
const sortOrder = ref('desc')

function toggleSort() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  loadProjects()
}

function goToProject(id) {
  router.push(`/projects/${id}`)
}

async function loadProjects() {
  try {
    const res = await getProjectList({
      page: currentPage.value,
      pageSize,
      status: statusFilter.value
    })
    const records = res.data.records || []
    total.value = res.data.total || 0

    records.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder.value === 'desc' ? timeB - timeA : timeA - timeB
    })

    const enrichedProjects = []
    for (const proj of records) {
      let progress = 0
      let memberCount = 0
      let pmName = proj.pmName || ''
      try {
        const [statRes, memberRes] = await Promise.all([
          getProjectStats(proj.id),
          getProjectMembers(proj.id)
        ])
        const s = statRes.data
        const totalTasks = s.totalTasks || 0
        const done = s.completedTasks || 0
        progress = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0
        const members = memberRes.data || []
        memberCount = members.length
        if (!pmName) {
          const pm = members.find(m => m.positionCode === 'PM')
          if (pm) pmName = pm.nickname || pm.username
        }
      } catch {
        // 忽略
      }
      enrichedProjects.push({ ...proj, progress, memberCount, pmName })
    }
    projects.value = enrichedProjects
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.project-list-page {
  padding: var(--hf-page-padding);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--hf-page-title-margin);
}

.page-title {
  font-size: var(--hf-page-title-size);
  font-weight: 700;
  color: var(--hf-text-primary);
  letter-spacing: -0.02em;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-btn {
  margin-left: auto;
}

.project-card {
  margin-bottom: 16px;
  cursor: pointer;
  padding: 20px;
  background: var(--hf-bg-card);
  border: 1px solid var(--hf-border);
  border-radius: var(--hf-radius-md);
  transition: all 0.2s;
}

.project-card:hover {
  border-color: var(--hf-primary-border);
  box-shadow: var(--hf-shadow-md);
  transform: translateY(-1px);
}

.project-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.project-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--hf-radius-sm);
  background: var(--hf-primary-bg);
  color: var(--hf-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--hf-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card-desc {
  font-size: 13px;
  color: var(--hf-text-secondary);
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card-meta {
  font-size: 12px;
  color: var(--hf-text-placeholder);
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
}

.project-progress-text {
  font-size: 12px;
  color: var(--hf-text-secondary);
  margin-top: 4px;
  font-weight: 500;
}

.empty-text {
  text-align: center;
  color: var(--hf-text-placeholder);
  padding: 60px 0;
  font-size: 14px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
