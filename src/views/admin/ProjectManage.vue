<template>
  <div class="project-manage">
    <PageHeader>
      <SearchBar :options="searchOptions" v-model="searchValues" @search="handleSearch" />
      <template #actions>
        <el-button type="primary" @click="openCreateDialog">新建项目</el-button>
      </template>
    </PageHeader>

    <HfTable
      :columns="columns"
      :data="projects"
      :total="total"
      v-model:page="currentPage"
      :page-size="pageSize"
      @action="handleAction"
      @page-change="loadProjects"
    >
      <template #pmName="{ row }">
        {{ row.pmName || getUserName(row.pmId) }}
      </template>
      <template #devLeadName="{ row }">
        {{ row.devLeadName || getUserName(row.devLeadId) }}
      </template>
      <template #testLeadName="{ row }">
        {{ row.testLeadName || getUserName(row.testLeadId) }}
      </template>
    </HfTable>

    <ProjectFormDialog
      v-model="showDialog"
      :edit-data="editData"
      :pm-users="pmUsers"
      :dev-users="devUsers"
      :qa-users="qaUsers"
      @saved="loadProjects"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getProjectList } from '@/api/project'
import { useUserOptions } from '@/composables/useUserOptions'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import HfTable from '@/components/common/HfTable.vue'
import ProjectFormDialog from '@/components/project/ProjectFormDialog.vue'

const searchOptions = ref([
  { type: 'input', label: '', prop: 'keyword', placeholder: '搜索项目名称' }
])
const searchValues = ref({})

const columns = ref([
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'code', label: '项目编码', width: 100 },
  { prop: 'name', label: '项目名称', minWidth: 150 },
  { prop: 'pmName', label: '项目经理', minWidth: 100, slot: 'pmName' },
  { prop: 'devLeadName', label: '开发主管', minWidth: 100, slot: 'devLeadName' },
  { prop: 'testLeadName', label: '测试主管', minWidth: 100, slot: 'testLeadName' },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    type: 'status',
    statusMap: { 1: { label: '进行中', tagType: '' }, 0: { label: '归档', tagType: 'info' } }
  },
  { prop: 'createdAt', label: '创建时间', minWidth: 170 },
  { prop: 'operator', label: '操作', width: 150, view: false, edit: true, delete: false }
])

const projects = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20

const showDialog = ref(false)
const editData = ref(null)
const { pmUsers, devUsers, qaUsers, loadUsers, getUserName } = useUserOptions()

function handleSearch(values) {
  searchValues.value = values
  currentPage.value = 1
  loadProjects()
}

function handleAction({ action, row }) {
  if (action === 'edit') {
    editData.value = row
    showDialog.value = true
  }
}

function openCreateDialog() {
  editData.value = null
  showDialog.value = true
}

async function loadProjects() {
  try {
    const res = await getProjectList({ page: currentPage.value, pageSize, keyword: searchValues.value.keyword || '' })
    projects.value = res.data.records || []
    total.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadProjects()
  loadUsers()
})
</script>

<style scoped>
.project-manage {
  padding: 16px 0;
}
</style>
