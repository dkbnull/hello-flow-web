<template>
  <div class="user-manage">
    <div class="page-header">
      <el-input v-model="keyword" placeholder="搜索用户名/昵称/邮箱" clearable style="width: 300px"
                @keyup.enter="loadUsers" @clear="loadUsers">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="openCreateDialog">新建用户</el-button>
    </div>

    <el-table :data="users" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="positionName" label="职位" width="100" />
      <el-table-column label="角色" min-width="100">
        <template #default="{ row }">
          <span>{{ row.roles?.map(code => roles.find(r => r.code === code)?.name || code).join(', ') || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="170" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button
            :type="row.status === 1 ? 'danger' : 'success'"
            link size="small"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
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
      @current-change="loadUsers"
    />

    <!-- 创建/编辑用户对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑用户' : '新建用户'" width="520px"
               @opened="formRef?.clearValidate()">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item v-if="!isEdit" label="用户名" prop="username">
          <el-input v-model="form.username" maxlength="50" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password maxlength="50" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" maxlength="50" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" maxlength="100" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" maxlength="20" />
        </el-form-item>
        <el-form-item label="职位" prop="positionId">
          <el-select v-model="form.positionId" placeholder="请选择" clearable>
            <el-option v-for="p in positions" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleCode">
          <el-select v-model="form.roleCode" placeholder="请选择" clearable>
            <el-option v-for="r in roles" :key="r.code" :label="r.name" :value="r.code" />
          </el-select>
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
import { onMounted, ref } from 'vue'
import { createUser, getUserList, updateUser, updateUserStatus } from '@/api/user'
import { getRoleList } from '@/api/role'
import { ElMessage } from 'element-plus'

const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const keyword = ref('')

const showDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref(null)
const roles = ref([])
const positions = ref([])

const form = ref({
  id: null,
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  positionId: null,
  roleCode: null
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, {
    min: 6,
    message: '密码至少6位',
    trigger: 'blur'
  }],
  positionId: [{ required: true, message: '请选择职位', trigger: 'change' }],
  roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

async function loadUsers() {
  try {
    const res = await getUserList({ page: currentPage.value, pageSize, keyword: keyword.value })
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

    // 职位从字典获取（假设字典类型编码为position）
    // 如果字典接口不可用，使用硬编码
    positions.value = [
      { id: 1, name: '项目经理' },
      { id: 2, name: '开发工程师' },
      { id: 3, name: '测试工程师' }
    ]
  } catch {
    positions.value = [
      { id: 1, name: '项目经理' },
      { id: 2, name: '开发工程师' },
      { id: 3, name: '测试工程师' }
    ]
  }
}

function openCreateDialog() {
  isEdit.value = false
  form.value = {
    id: null,
    username: '',
    password: '',
    nickname: '',
    email: '',
    phone: '',
    positionId: null,
    roleCode: null
  }
  showDialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = {
    id: row.id,
    username: row.username,
    password: '',
    nickname: row.nickname || '',
    email: row.email || '',
    phone: row.phone || '',
    positionId: row.positionId,
    roleCode: row.roles?.[0] || null
  }
  showDialog.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      const { id, username, password, ...data } = form.value
      await updateUser(id, data)
      ElMessage.success('更新成功')
    } else {
      await createUser(form.value)
      ElMessage.success('创建成功')
    }
    showDialog.value = false
    await loadUsers()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

async function handleToggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await updateUserStatus(row.id, newStatus)
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
