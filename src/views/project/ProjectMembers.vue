<template>
  <div class="project-members">
    <PageHeader title="项目成员">
      <template #actions>
        <el-button
          v-if="canManageProject && !isArchived"
          type="primary"
          size="default"
          @click="showAddDialog = true"
        >
          <el-icon>
            <Plus />
          </el-icon>
          添加成员
        </el-button>
      </template>
    </PageHeader>

    <el-table :data="members" stripe>
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="positionName" label="职位" />
      <el-table-column prop="joinedAt" label="加入时间" />
      <el-table-column v-if="canManageProject && !isArchived" label="操作" width="100">
        <template #default="{ row }">
          <el-popconfirm title="确定移除该成员？" @confirm="handleRemove(row.userId)">
            <template #reference>
              <el-button type="danger" link size="small">移除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <AddMemberDialog
      v-model="showAddDialog"
      :project-id="route.params.id"
      :members="members"
      :all-users="allUsers"
      @saved="loadMembers"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectMembers, removeProjectMember } from '@/api/project'
import { getUserList } from '@/api/user'
import { usePermission } from '@/composables/usePermission'
import { useProjectArchive } from '@/composables/useProjectArchive'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AddMemberDialog from '@/components/project/AddMemberDialog.vue'

const route = useRoute()
const { canManageProject } = usePermission()
const { isArchived } = useProjectArchive()

const members = ref([])
const showAddDialog = ref(false)
const allUsers = ref([])

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
</style>
