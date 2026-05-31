<template>
  <div class="project-manage">
    <div class="page-header">
      <el-input v-model="keyword" placeholder="搜索项目名称" clearable style="width: 300px" @keyup.enter="loadProjects"
                @clear="loadProjects">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="openCreateDialog">新建项目</el-button>
    </div>

    <el-table :data="projects" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="code" label="项目编码" width="100" />
      <el-table-column prop="name" label="项目名称" min-width="150" />
      <el-table-column prop="pmName" label="项目经理" min-width="100">
        <template #default="{ row }">{{ row.pmName || getUserName(row.pmId) }}</template>
      </el-table-column>
      <el-table-column prop="devLeadName" label="开发主管" min-width="100">
        <template #default="{ row }">{{ row.devLeadName || getUserName(row.devLeadId) }}</template>
      </el-table-column>
      <el-table-column prop="testLeadName" label="测试主管" min-width="100">
        <template #default="{ row }">{{ row.testLeadName || getUserName(row.testLeadId) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? '' : 'info'" size="small">
            {{ row.status === 1 ? '进行中' : '归档' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="170" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
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
      @current-change="loadProjects"
    />

    <!-- 创建/编辑项目对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑项目' : '新建项目'" width="520px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" maxlength="100" />
        </el-form-item>
        <el-form-item label="项目编码" prop="code">
          <el-input v-model="form.code" maxlength="20" placeholder="如 HF、PROJ 等" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="项目经理" prop="pmId">
          <el-select v-model="form.pmId" placeholder="请选择" clearable filterable>
            <el-option v-for="u in pmUsers" :key="u.id" :label="u.nickname || u.username" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开发主管" prop="devLeadId">
          <el-select v-model="form.devLeadId" placeholder="请选择" clearable filterable>
            <el-option v-for="u in devUsers" :key="u.id" :label="u.nickname || u.username" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="测试主管" prop="testLeadId">
          <el-select v-model="form.testLeadId" placeholder="请选择" clearable filterable>
            <el-option v-for="u in qaUsers" :key="u.id" :label="u.nickname || u.username" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">进行中</el-radio>
            <el-radio :value="0">归档</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProjectList, createProject, updateProject } from '@/api/project'
import { getUserList } from '@/api/user'
import { POSITION_CODE } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const projects = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const keyword = ref('')

const showDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref(null)
const pmUsers = ref([])
const devUsers = ref([])
const qaUsers = ref([])
const allUsers = ref([])

function getUserName(userId) {
  if (!userId) return '-'
  const user = allUsers.value.find(u => u.id === userId)
  return user?.nickname || user?.username || userId
}

const form = ref({
  id: null,
  name: '',
  code: '',
  description: '',
  pmId: null,
  devLeadId: null,
  testLeadId: null,
  status: 1
})

const formRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入项目编码', trigger: 'blur' }]
}

async function loadProjects() {
  try {
    const res = await getProjectList({ page: currentPage.value, pageSize, keyword: keyword.value })
    projects.value = res.data.records || []
    total.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

async function loadUsers() {
  try {
    const res = await getUserList({ pageSize: 200 })
    const users = res.data.records || []
    allUsers.value = users
    pmUsers.value = users.filter(u => u.positionCode === POSITION_CODE.PM)
    devUsers.value = users.filter(u => u.positionCode === POSITION_CODE.DEV)
    qaUsers.value = users.filter(u => u.positionCode === POSITION_CODE.QA)
  } catch {
    // 忽略
  }
}

function openCreateDialog() {
  isEdit.value = false
  form.value = {
    id: null,
    name: '',
    code: '',
    description: '',
    pmId: null,
    devLeadId: null,
    testLeadId: null,
    status: 1
  }
  showDialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = {
    id: row.id,
    name: row.name,
    code: row.code || '',
    description: row.description || '',
    pmId: row.pmId,
    devLeadId: row.devLeadId,
    testLeadId: row.testLeadId,
    status: row.status
  }
  showDialog.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      const { id, ...data } = form.value
      await updateProject(id, data)
      ElMessage.success('更新成功')
    } else {
      await createProject(form.value)
      ElMessage.success('创建成功')
    }
    showDialog.value = false
    await loadProjects()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
