<template>
  <div class="project-members">
    <div class="page-header">
      <h3>项目成员</h3>
      <el-button
        v-if="canManage"
        type="primary"
        size="default"
        @click="showAddDialog = true"
      >
        <el-icon>
          <Plus />
        </el-icon>
        添加成员
      </el-button>
    </div>

    <el-table :data="members" stripe>
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="positionName" label="职位" />
      <el-table-column prop="joinedAt" label="加入时间" />
      <el-table-column v-if="canManage" label="操作" width="100">
        <template #default="{ row }">
          <el-popconfirm title="确定移除该成员？" @confirm="handleRemove(row.userId)">
            <template #reference>
              <el-button type="danger" link size="small">移除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加成员对话框-->
    <el-dialog v-model="showAddDialog" title="添加成员" width="400px">
      <el-select v-model="selectedUserId" placeholder="请选择用户" filterable style="width: 100%">
        <el-option
          v-for="user in availableUsers"
          :key="user.id"
          :label="`${user.nickname || user.username} (${user.positionName || ''})`"
          :value="user.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="adding" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getProjectMembers, addProjectMember, removeProjectMember } from '@/api/project'
import { getUserList } from '@/api/user'
import { ROLE_CODE, POSITION_CODE } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const route = useRoute()
const authStore = useAuthStore()

const members = ref([])
const showAddDialog = ref(false)
const selectedUserId = ref(null)
const adding = ref(false)
const allUsers = ref([])

const canManage = computed(() => {
  const user = authStore.user
  return user?.roles?.includes(ROLE_CODE.ADMIN) || user?.positionCode === POSITION_CODE.PM
})

const availableUsers = computed(() => {
  const memberIds = members.value.map(m => m.userId)
  return allUsers.value.filter(u => !memberIds.includes(u.id))
})

async function loadMembers() {
  try {
    const res = await getProjectMembers(route.params.id)
    members.value = res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

async function loadAllUsers() {
  try {
    const res = await getUserList({ pageSize: 200 })
    allUsers.value = res.data.records || []
  } catch {
    // 忽略
  }
}

async function handleAdd() {
  if (!selectedUserId.value) {
    ElMessage.warning('请选择用户')
    return
  }
  adding.value = true
  try {
    await addProjectMember(route.params.id, selectedUserId.value)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    selectedUserId.value = null
    await loadMembers()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    adding.value = false
  }
}

async function handleRemove(userId) {
  try {
    await removeProjectMember(route.params.id, userId)
    ElMessage.success('移除成功')
    await loadMembers()
  } catch {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  loadMembers()
  loadAllUsers()
})
</script>

<style scoped>
.project-members {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h3 {
  font-size: 16px;
  color: var(--hf-text-primary);
}
</style>
