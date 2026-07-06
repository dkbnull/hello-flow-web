<template>
  <div class="task-list-panel">
    <SearchBar :options="searchOptions" v-model="filters" @search="loadTasks" @reset="handleReset">
      <template #extra>
        <el-button :type="quickFilter === 'mine' ? 'primary' : ''" size="default" @click="toggleQuickFilter('mine')">
          分配给我
        </el-button>
        <el-button :type="quickFilter === 'pending-review' ? 'primary' : ''" size="default"
                   @click="toggleQuickFilter('pending-review')">待我审查
        </el-button>
        <el-button :type="quickFilter === 'reported' ? 'primary' : ''" size="default"
                   @click="toggleQuickFilter('reported')">我创建的
        </el-button>
        <el-button :type="quickFilter === 'delayed' ? 'primary' : ''" size="default"
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
      </template>
    </SearchBar>

    <div class="list-toolbar">
      <el-button :icon="Setting" size="default" @click="showColumnSetting = true">列设置</el-button>
    </div>

    <HfTable
      :columns="columns"
      :data="tasks"
      :total="total"
      v-model:page="currentPage"
      :page-size="pageSize"
      @page-change="loadTasks"
      @row-click="openTaskDetail"
    >
      <template #code="{ row }">
        {{ row.projectCode || projectCode || 'TASK' }}-{{ row.id }}
      </template>
      <template #type="{ row }">
        <el-tag :type="TASK_TYPE_MAP[row.type]?.tagType || 'info'" size="default">
          {{ TASK_TYPE_MAP[row.type]?.label || '未知' }}
        </el-tag>
      </template>
      <template #priority="{ row }">
        <span :style="{ color: TASK_PRIORITY_MAP[row.priority]?.color }">
          {{ TASK_PRIORITY_MAP[row.priority]?.label || '未知' }}
        </span>
      </template>
      <template #status="{ row }">
        <el-tag :type="TASK_STATUS_MAP[row.status]?.tagType || 'info'" size="default">
          {{ TASK_STATUS_MAP[row.status]?.label || '未知' }}
        </el-tag>
      </template>
      <template #developerName="{ row }">
        {{ row.developerName || row.assigneeName || '-' }}
      </template>
      <template #testerName="{ row }">
        {{ row.testerName || '-' }}
      </template>
      <template #dueDate="{ row }">
        <span :class="{ 'overdue': isOverdue(row) }">{{ row.dueDate || '-' }}</span>
      </template>
    </HfTable>

    <SaveFilterDialog
      v-model="showSaveDialog"
      @save="handleSaveFilter"
    />

    <ColumnSetting
      v-model="showColumnSetting"
      :columns="allColumns"
      :selected="selectedColumnProps"
      :default-columns="DEFAULT_COLUMNS"
      @confirm="handleColumnConfirm"
    />
  </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMyTasks, getPendingReviewTasks, getTaskList } from '@/api/task'
import { getProjectList, getProjectMembers } from '@/api/project'
import { getSprintList } from '@/api/sprint'
import { getViewConfig, updateViewConfig } from '@/api/viewConfig'
import { TASK_PRIORITY_MAP, TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'
import { useProjectStore } from '@/stores/project'
import { useFilterStore } from '@/stores/filter'
import { Plus, Setting } from '@element-plus/icons-vue'
import SearchBar from '@/components/common/SearchBar.vue'
import HfTable from '@/components/common/HfTable.vue'
import SaveFilterDialog from '@/components/task/SaveFilterDialog.vue'
import ColumnSetting from '@/components/common/ColumnSetting.vue'

const props = defineProps({
  mode: { type: String, default: 'project', validator: v => ['project', 'my'].includes(v) }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const filterStore = useFilterStore()
const taskRefreshKey = inject('taskRefreshKey', ref(0))
// 全局新建问题后的刷新信号（由 MainLayout 提供）
const issueRefreshKey = inject('issueRefreshKey', ref(0))

const tasks = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10
const quickFilter = ref('')
const activeFilterId = ref(null)
const showSaveDialog = ref(false)

const members = ref([])
const sprints = ref([])

const projectCode = computed(() => projectStore.currentProject?.code || '')

const validMembers = computed(() => {
  return members.value.filter(m => m.userId && (m.nickname || m.username))
})

// 搜索条件配置
const searchOptions = computed(() => {
  const options = [
    {
      type: 'select', label: '状态', prop: 'status', placeholder: '状态',
      options: Object.entries(TASK_STATUS_MAP).map(([key, info]) => ({ label: info.label, value: Number(key) }))
    },
    {
      type: 'select', label: '类型', prop: 'type', placeholder: '类型',
      options: Object.entries(TASK_TYPE_MAP).map(([key, info]) => ({ label: info.label, value: Number(key) }))
    },
    {
      type: 'select', label: '优先级', prop: 'priority', placeholder: '优先级',
      options: Object.entries(TASK_PRIORITY_MAP).map(([key, info]) => ({ label: info.label, value: Number(key) }))
    }
  ]
  if (props.mode === 'project') {
    options.push({
      type: 'select', label: '负责人', prop: 'assigneeId', placeholder: '负责人',
      filterable: true,
      options: validMembers.value.map(m => ({ label: m.nickname || m.username, value: m.userId }))
    })
    options.push({
      type: 'select', label: '迭代', prop: 'sprintId', placeholder: '选择迭代',
      options: sprints.value.map(s => ({ label: s.name, value: s.id }))
    })
  }
  options.push({ type: 'input', label: '', prop: 'keyword', placeholder: '搜索关键词' })
  return options
})

// 所有可选列定义（用于列设置勾选）
const allColumns = computed(() => {
  const cols = [{ prop: 'taskCode', label: '编码', width: 110, slot: 'code' }]
  if (props.mode === 'my') {
    cols.push({ prop: 'projectName', label: '项目', width: 120, showOverflowTooltip: true })
  }
  cols.push(
    { prop: 'title', label: '标题', minWidth: 200, showOverflowTooltip: true },
    { prop: 'type', label: '类型', width: 80, slot: 'type' },
    { prop: 'priority', label: '优先级', width: 80, slot: 'priority' },
    { prop: 'status', label: '状态', width: 90, slot: 'status' },
    { prop: 'assigneeName', label: '负责人', minWidth: 110 },
    { prop: 'developerName', label: '开发工程师', minWidth: 110, slot: 'developerName' },
    { prop: 'testerName', label: '测试工程师', minWidth: 110, slot: 'testerName' },
    { prop: 'dueDate', label: '到期日', minWidth: 110, slot: 'dueDate' },
    { prop: 'moduleName', label: '模块', minWidth: 110 }
  )
  return cols
})

// 默认显示列（my 模式下包含项目列）
const DEFAULT_COLUMNS = computed(() => {
  const cols = ['taskCode', 'title', 'type', 'status', 'priority', 'assigneeName', 'dueDate', 'moduleName']
  if (props.mode === 'my') {
    cols.splice(1, 0, 'projectName')
  }
  return cols
})

// 当前已选中的列 prop 数组（初始为默认值，onMounted 后从后端加载覆盖）
const selectedColumnProps = ref([...DEFAULT_COLUMNS.value])
const showColumnSetting = ref(false)

// 实际渲染的列：根据选中项过滤
const columns = computed(() => {
  return allColumns.value.filter(c => selectedColumnProps.value.includes(c.prop))
})

// 列设置确认：更新本地选中项并持久化到后端
async function handleColumnConfirm(selectedProps) {
  selectedColumnProps.value = selectedProps
  showColumnSetting.value = false
  try {
    await updateViewConfig({ columns: selectedProps })
  } catch {
    // 持久化失败不影响本地使用
  }
}

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

function handleReset() {
  quickFilter.value = ''
  activeFilterId.value = null
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

  // 待我审查使用专用接口
  if (quickFilter.value === 'pending-review') {
    try {
      const params = { page: currentPage.value, pageSize }
      const res = await getPendingReviewTasks(params)
      const records = res.data.records || []
      // 过滤当前项目的任务
      tasks.value = records.filter(t => String(t.projectId) === String(projectId))
      total.value = tasks.value.length
    } catch {
      // 错误已在拦截器中处理
    }
    return
  }

  const params = {
    projectId,
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
    const res = await getTaskList(params)
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
    if (filters.status) params.status = filters.status
    if (filters.type) params.type = filters.type
    if (filters.priority) params.priority = filters.priority
    if (route.query.status) params.status = Number(route.query.status)
    if (route.query.type) params.type = Number(route.query.type)

    let apiFn
    if (quickFilter.value === 'pending-review') {
      apiFn = getPendingReviewTasks
    } else if (quickFilter.value === 'reported') {
      apiFn = getTaskList
      params.reporterId = authStore.user?.id
    } else if (quickFilter.value === 'delayed') {
      apiFn = getMyTasks
      params.isDelayed = 1
    } else {
      apiFn = getMyTasks
    }

    const res = await apiFn(params)
    const records = res.data.records || []
    // 补充项目名称（API 未返回 projectName，需从项目列表映射）
    if (records.length && !records[0].projectName) {
      await enrichProjectNames(records)
    }
    tasks.value = records
    total.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

// 从项目列表构建 ID→名称映射，补充任务的 projectName
async function enrichProjectNames(records) {
  try {
    const projRes = await getProjectList({ pageSize: 200 })
    const projects = projRes.data.records || projRes.data || []
    const projMap = new Map(projects.map(p => [p.id, p.name]))
    for (const task of records) {
      if (!task.projectName && task.projectId) {
        task.projectName = projMap.get(task.projectId) || ''
      }
    }
  } catch {
    // 忽略，项目名称留空
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

async function loadViewConfig() {
  try {
    const res = await getViewConfig()
    if (res.data?.columns?.length) {
      selectedColumnProps.value = res.data.columns
    }
  } catch {
    // 加载失败使用默认列
  }
}

onMounted(async () => {
  if (props.mode === 'my') {
    if (route.query.quickFilter) {
      quickFilter.value = route.query.quickFilter
    } else {
      if (route.query.status) filters.status = Number(route.query.status)
      if (route.query.type) filters.type = Number(route.query.type)
    }
    if (route.query.keyword) filters.keyword = route.query.keyword
  }
  await loadMembers()
  loadViewConfig()
  loadTasks()
  loadSprints()
  filterStore.fetchFilters()
})

watch(taskRefreshKey, () => {
  loadTasks()
})

watch(issueRefreshKey, () => {
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

.saved-filter-tag {
  cursor: pointer;
}

.overdue {
  color: var(--hf-danger);
}

.task-list-panel :deep(.el-table__row) {
  cursor: pointer;
}

.list-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
