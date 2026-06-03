<template>
  <div class="task-list-panel">
    <div class="filter-bar">
      <el-row :gutter="12">
        <el-col :span="4">
          <el-select v-model="filters.status" placeholder="状态" clearable size="default" @change="loadTasks">
            <el-option v-for="(info, key) in TASK_STATUS_MAP" :key="key" :label="info.label" :value="Number(key)" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="filters.type" placeholder="类型" clearable size="default" @change="loadTasks">
            <el-option v-for="(info, key) in TASK_TYPE_MAP" :key="key" :label="info.label" :value="Number(key)" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="filters.priority" placeholder="优先级" clearable size="default" @change="loadTasks">
            <el-option v-for="(info, key) in TASK_PRIORITY_MAP" :key="key" :label="info.label" :value="Number(key)" />
          </el-select>
        </el-col>
        <el-col v-if="mode === 'project'" :span="4">
          <el-select v-model="filters.assigneeId" placeholder="负责人" clearable filterable size="default"
                     @change="loadTasks">
            <el-option v-for="m in validMembers" :key="m.userId" :label="m.nickname || m.username" :value="m.userId" />
          </el-select>
        </el-col>
        <el-col v-if="mode === 'project'" :span="4">
          <el-select v-model="filters.sprintId" placeholder="选择迭代" clearable size="default" @change="loadTasks">
            <el-option v-for="s in sprints" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-col>
        <el-col :span="keywordSpan">
          <el-input v-model="filters.keyword" placeholder="搜索关键词" clearable size="default" class="keyword-input"
                    @keyup.enter="loadTasks"
                    @clear="loadTasks">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <div class="quick-filters">
        <el-button :type="quickFilter === 'mine' ? 'primary' : ''" size="default" @click="toggleQuickFilter('mine')">
          分配给我
        </el-button>
        <el-button :type="quickFilter === 'reported' ? 'primary' : ''" size="default"
                   @click="toggleQuickFilter('reported')">我创建的
        </el-button>
        <el-button v-if="mode === 'project'" :type="quickFilter === 'delayed' ? 'primary' : ''" size="default"
                   @click="toggleQuickFilter('delayed')">已延期
        </el-button>
        <el-divider direction="vertical" />
        <el-tag
          v-for="f in savedFilters" :key="f.id"
          :type="activeFilterId === f.id ? 'primary' : 'info'"
          :effect="activeFilterId === f.id ? 'dark' : 'plain'"
          class="saved-filter-tag"
          @click="applySavedFilter(f)"
          @close="handleDeleteFilter(f)"
          closable
        >
          {{ f.name }}
        </el-tag>
        <el-button size="default" @click="showSaveDialog = true">
          <el-icon>
            <Plus />
          </el-icon>
          保存过滤器
        </el-button>
      </div>
    </div>

    <el-table :data="tasks" stripe @row-click="openTaskDetail">
      <el-table-column prop="id" label="编码" width="110">
        <template #default="{ row }">
          {{ row.projectCode || projectCode || 'TASK' }}-{{ row.id }}
        </template>
      </el-table-column>
      <el-table-column v-if="mode === 'my'" prop="projectName" label="项目" width="120" show-overflow-tooltip />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="TASK_TYPE_MAP[row.type]?.tagType ?? 'info'" size="default">
            {{ TASK_TYPE_MAP[row.type]?.label || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="80">
        <template #default="{ row }">
          <span :style="{ color: TASK_PRIORITY_MAP[row.priority]?.color }">
            {{ TASK_PRIORITY_MAP[row.priority]?.label || '未知' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="TASK_STATUS_MAP[row.status]?.tagType ?? 'info'" size="default">
            {{ TASK_STATUS_MAP[row.status]?.label || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="developerName" label="开发工程师" min-width="110">
        <template #default="{ row }">
          {{ row.developerName || row.assigneeName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="testerName" label="测试工程师" min-width="110">
        <template #default="{ row }">
          {{ row.testerName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="dueDate" label="到期日" min-width="110">
        <template #default="{ row }">
          <span :class="{ 'overdue': isOverdue(row) }">{{ row.dueDate || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      class="pagination"
      @current-change="loadTasks"
    />

    <SaveFilterDialog
      v-model="showSaveDialog"
      @save="handleSaveFilter"
    />
  </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMyTasks, getRelatedTasks, getReportedTasks, getTaskList } from '@/api/task'
import { getProjectMembers } from '@/api/project'
import { getSprintList } from '@/api/sprint'
import { TASK_PRIORITY_MAP, TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'
import { useProjectStore } from '@/stores/project'
import { useFilterStore } from '@/stores/filter'
import { Plus, Search } from '@element-plus/icons-vue'
import SaveFilterDialog from '@/components/task/SaveFilterDialog.vue'

const props = defineProps({
  mode: { type: String, default: 'project', validator: v => ['project', 'my'].includes(v) }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const filterStore = useFilterStore()
const taskRefreshKey = inject('taskRefreshKey', ref(0))

const tasks = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const quickFilter = ref('')
const activeFilterId = ref(null)
const showSaveDialog = ref(false)

const members = ref([])
const sprints = ref([])

const projectCode = computed(() => projectStore.currentProject?.code || '')

const keywordSpan = computed(() => props.mode === 'project' ? 6 : 14)

const validMembers = computed(() => {
  return members.value.filter(m => m.userId && (m.nickname || m.username))
})

const savedFilters = computed(() => {
  if (props.mode === 'project') {
    const projectId = route.params.id
    return filterStore.filters.filter(f => !f.projectId || String(f.projectId) === String(projectId))
  }
  return filterStore.filters.filter(f => !f.projectId)
})

const filters = reactive({
  status: null,
  type: null,
  priority: null,
  assigneeId: null,
  sprintId: null,
  keyword: ''
})

function isOverdue(task) {
  if (!task.dueDate || task.status === 5 || task.status === 6 || task.status === 7) return false
  return new Date(task.dueDate) < new Date()
}

function toggleQuickFilter(type) {
  quickFilter.value = quickFilter.value === type ? '' : type
  activeFilterId.value = null
  loadTasks()
}

async function handleSaveFilter(filterName) {
  const conditions = {
    status: filters.status,
    type: filters.type,
    priority: filters.priority,
    keyword: filters.keyword,
    quickFilter: quickFilter.value,
    assigneeId: filters.assigneeId,
    sprintId: filters.sprintId
  }
  await filterStore.addFilter({
    name: filterName,
    projectId: props.mode === 'project' ? Number(route.params.id) : null,
    conditions: JSON.stringify(conditions)
  })
}

function applySavedFilter(f) {
  if (activeFilterId.value === f.id) {
    activeFilterId.value = null
    resetFilters()
    loadTasks()
    return
  }
  activeFilterId.value = f.id
  try {
    const conditions = typeof f.conditions === 'string' ? JSON.parse(f.conditions) : f.conditions
    filters.status = conditions.status || null
    filters.type = conditions.type || null
    filters.priority = conditions.priority || null
    filters.keyword = conditions.keyword || ''
    quickFilter.value = conditions.quickFilter || ''
    if (props.mode === 'project') {
      filters.assigneeId = conditions.assigneeId || null
      filters.sprintId = conditions.sprintId || null
    }
    loadTasks()
  } catch {
    // 条件解析失败
  }
}

async function handleDeleteFilter(f) {
  await filterStore.removeFilter(f.id)
  if (activeFilterId.value === f.id) {
    activeFilterId.value = null
  }
}

function resetFilters() {
  filters.status = null
  filters.type = null
  filters.priority = null
  filters.assigneeId = null
  filters.sprintId = null
  filters.keyword = ''
  quickFilter.value = ''
}

function openTaskDetail(row) {
  router.push({ name: 'TaskDetailPage', params: { taskId: row.id } })
}

async function loadTasks() {
  if (props.mode === 'project') {
    await loadProjectTasks()
  } else {
    await loadMyTasks()
  }
}

async function loadProjectTasks() {
  const projectId = route.params.id
  if (!projectId) return

  const params = {
    page: currentPage.value,
    pageSize,
    keyword: filters.keyword || undefined,
    assigneeId: filters.assigneeId || undefined,
    sprintId: filters.sprintId || undefined,
    includeSubtasks: true
  }

  if (quickFilter.value === 'mine') {
    params.assigneeId = authStore.user?.id
  } else if (quickFilter.value === 'reported') {
    params.reporterId = authStore.user?.id
  } else if (quickFilter.value === 'delayed') {
    params.isDelayed = 1
  }

  if (filters.status) params.status = filters.status
  if (filters.type) params.type = filters.type
  if (filters.priority) params.priority = filters.priority

  try {
    const res = await getTaskList(projectId, params)
    const records = res.data.records || []
    if (members.value.length > 0) {
      const memberMap = new Map(members.value.map(m => [m.userId, m.nickname || m.username]))
      for (const task of records) {
        if (!task.assigneeName && task.assigneeId) task.assigneeName = memberMap.get(task.assigneeId) || ''
        if (!task.developerName && task.developerId) task.developerName = memberMap.get(task.developerId) || ''
        if (!task.testerName && task.testerId) task.testerName = memberMap.get(task.testerId) || ''
      }
    }
    tasks.value = records
    total.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

async function loadMyTasks() {
  try {
    const params = { page: currentPage.value, pageSize }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status) params.status = filters.status
    if (filters.type) params.type = filters.type
    if (filters.priority) params.priority = filters.priority
    if (route.query.status) params.status = Number(route.query.status)
    if (route.query.type) params.type = Number(route.query.type)

    let apiFn
    if (quickFilter.value === 'reported') {
      apiFn = getReportedTasks
    } else if (quickFilter.value === 'mine') {
      apiFn = getMyTasks
    } else {
      apiFn = getRelatedTasks
    }

    const res = await apiFn(params)
    tasks.value = res.data.records || []
    total.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

async function loadMembers() {
  if (props.mode !== 'project') return
  try {
    const res = await getProjectMembers(route.params.id)
    members.value = res.data || []
  } catch {
    // 忽略
  }
}

async function loadSprints() {
  if (props.mode !== 'project') return
  try {
    const res = await getSprintList(route.params.id)
    sprints.value = res.data || []
  } catch {
    // 忽略
  }
}

onMounted(async () => {
  if (props.mode === 'my') {
    if (route.query.status) filters.status = Number(route.query.status)
    if (route.query.type) filters.type = Number(route.query.type)
    if (route.query.keyword) filters.keyword = route.query.keyword
  }
  await loadMembers()
  loadTasks()
  loadSprints()
  filterStore.fetchFilters()
})

watch(taskRefreshKey, () => {
  loadTasks()
})

watch(() => route.query.keyword, (newKeyword) => {
  if (props.mode === 'my' && newKeyword !== undefined) {
    filters.keyword = newKeyword || ''
    loadTasks()
  }
})
</script>

<style scoped>
.task-list-panel {
  padding: 0;
}

.filter-bar {
  margin-bottom: 16px;
}

.filter-bar .el-select,
.filter-bar .el-input {
  width: 100%;
}

.keyword-input {
  max-width: 240px;
}

.quick-filters {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.saved-filter-tag {
  cursor: pointer;
}

.overdue {
  color: var(--hf-danger);
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.task-list-panel :deep(.el-table__row) {
  cursor: pointer;
}
</style>
