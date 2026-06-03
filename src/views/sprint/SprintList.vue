<template>
  <div class="sprint-list">
    <PageHeader title="迭代管理">
      <template #actions>
        <el-button v-if="canCreate" type="primary" size="default" @click="openCreateDialog">
          <el-icon>
            <Plus />
          </el-icon>
          创建Sprint
        </el-button>
      </template>
    </PageHeader>

    <div v-if="sprints.length === 0" class="hf-empty-text">暂无Sprint</div>
    <HfTable
      v-else
      :columns="columns"
      :data="sprints"
      :total="0"
      :show-size-changer="false"
      @action="handleAction"
    />

    <SprintFormDialog
      v-model="showFormDialog"
      :edit-data="editData"
      :project-id="route.params.id"
      @saved="loadSprints"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSprintList, startSprint, completeSprint } from '@/api/sprint'
import { usePermission } from '@/composables/usePermission'
import { SPRINT_STATUS_MAP } from '@/utils/constants'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import HfTable from '@/components/common/HfTable.vue'
import SprintFormDialog from '@/components/sprint/SprintFormDialog.vue'

const route = useRoute()
const router = useRouter()
const { canManageProject } = usePermission()

const sprints = ref([])
const showFormDialog = ref(false)
const editData = ref(null)

const canCreate = canManageProject
const canManage = computed(() => canManageProject)

const columns = computed(() => [
  { prop: 'name', label: '名称', minWidth: 150 },
  { prop: 'goal', label: '目标', minWidth: 200, showOverflowTooltip: true },
  { prop: 'status', label: '状态', width: 100, type: 'status', statusMap: SPRINT_STATUS_MAP },
  { prop: 'startDate', label: '开始日期', width: 120 },
  { prop: 'endDate', label: '结束日期', width: 120 },
  {
    prop: 'operator', label: '操作', width: 200, view: false, edit: false, delete: false, actions: [
      { label: '查看', action: 'view', type: 'primary' },
      ...(canManage.value ? [
        { label: '开始', action: 'start', type: 'success' },
        { label: '完成', action: 'complete', type: 'warning' },
        { label: '编辑', action: 'edit', type: 'primary' }
      ] : [])
    ]
  }
])

function handleAction({ action, row }) {
  if (action === 'view') {
    goToSprint(row)
  } else if (action === 'edit') {
    openEditDialog(row)
  } else if (action === 'start') {
    handleStart(row)
  } else if (action === 'complete') {
    handleComplete(row)
  }
}

function goToSprint(sprint) {
  router.push({ name: 'SprintDetail', params: { id: route.params.id, sprintId: sprint.id } })
}

function openCreateDialog() {
  editData.value = null
  showFormDialog.value = true
}

function openEditDialog(sprint) {
  editData.value = sprint
  showFormDialog.value = true
}

async function loadSprints() {
  try {
    const res = await getSprintList(route.params.id)
    sprints.value = res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleStart(sprint) {
  try {
    await startSprint(sprint.id)
    ElMessage.success('Sprint已开始')
    await loadSprints()
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleComplete(sprint) {
  try {
    await completeSprint(sprint.id)
    ElMessage.success('Sprint已完成')
    await loadSprints()
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadSprints()
})
</script>

<style scoped>
.sprint-list {
  padding: 0;
}
</style>
