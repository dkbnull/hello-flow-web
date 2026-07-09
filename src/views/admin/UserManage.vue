<template>
  <div class="user-manage">
    <PageHeader>
      <SearchBar :options="searchOptions" v-model="searchValues" @search="handleSearch" />
      <template #actions>
        <el-button type="primary" @click="openCreateDialog">新建用户</el-button>
      </template>
    </PageHeader>

    <HfTable
      :columns="columns"
      :data="users"
      :total="total"
      v-model:page="currentPage"
      :page-size="pageSize"
      @action="handleAction"
      @page-change="loadUsers"
    >
      <template #roles="{ row }">
        <span>{{ row.roles?.map(code => roles.find(r => r.code === code)?.name || code).join(', ') || '-' }}</span>
      </template>
      <template #operator="{ row }">
        <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button
          v-if="row.status === 1"
          link type="danger" size="small"
          @click="handleToggleStatus(row)"
        >禁用
        </el-button>
        <el-button
          v-else
          link type="success" size="small"
          @click="handleToggleStatus(row)"
        >启用
        </el-button>
      </template>
    </HfTable>

    <UserFormDialog
      v-model="showDialog"
      :edit-data="editData"
      :roles="roles"
      :positions="positions"
      @saved="loadUsers"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getUserList, updateUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import HfTable from '@/components/common/HfTable.vue'
import UserFormDialog from '@/components/user/UserFormDialog.vue'

const searchOptions = ref([
  { type: 'input', label: '', prop: 'keyword', placeholder: '搜索用户名/昵称/邮箱' }
])
const searchValues = ref({})

const columns = ref([
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'nickname', label: '昵称', width: 120 },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'positionName', label: '职位', width: 100 },
  { prop: 'roles', label: '角色', minWidth: 100, slot: 'roles' },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    type: 'status',
    statusMap: { 1: { label: '启用', tagType: 'success' }, 0: { label: '禁用', tagType: 'danger' } }
  },
  { prop: 'createdAt', label: '创建时间', minWidth: 170 },
  {
    prop: 'operator', label: '操作', width: 200, view: false, edit: false, delete: false
  }
])

const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20

const showDialog = ref(false)
const editData = ref(null)
const roles = ref([])
const positions = ref([])

function handleSearch(values) {
  searchValues.value = values
  currentPage.value = 1
  loadUsers()
}

function handleAction({ action, row }) {
  if (action === 'edit') {
    editData.value = row
    showDialog.value = true
  } else if (action === 'toggleStatus') {
    handleToggleStatus(row)
  }
}

function handleEdit(row) {
  editData.value = row
  showDialog.value = true
}

function openCreateDialog() {
  editData.value = null
  showDialog.value = true
}

async function loadUsers() {
  try {
    const res = await getUserList({ page: currentPage.value, pageSize, keyword: searchValues.value.keyword || '' })
    users.value = res.data.records || []
    total.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

async function loadOptions() {
  try {
    const [roleRes] = await Promise.all([getRoleList()])
    roles.value = roleRes.data || []
  } catch {
    // 忽略
  }
  positions.value = [
    { id: 1, name: '项目经理' },
    { id: 2, name: '开发工程师' },
    { id: 3, name: '测试工程师' }
  ]
}

async function handleToggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await updateUser(row.id, { status: newStatus })
    ElMessage.success('操作成功')
    await loadUsers()
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadUsers()
  loadOptions()
})
</script>

<style scoped>
.user-manage {
  padding: 16px 0;
}
</style>
