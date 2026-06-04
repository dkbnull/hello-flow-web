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

    <HfTable
      :columns="columns"
      :data="members"
      :total="0"
      :show-size-changer="false"
      @action="handleAction"
    />

    <AddMemberDialog
      v-model="showAddDialog"
      :project-id="route.params.id"
      :members="members"
      :all-users="allUsers"
      @saved="loadMembers"
    />

    <ConfirmDialog
      v-model="showRemoveDialog"
      title="移除成员"
      :message="`确定要将成员「${removeTarget?.nickname || removeTarget?.username}」从项目中移除吗？`"
      type="danger"
      confirm-text="移除"
      :loading="removing"
      @confirm="confirmRemove"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectMembers, removeProjectMember } from '@/api/project'
import { getUserList } from '@/api/user'
import { usePermission } from '@/composables/usePermission'
import { useProjectArchive } from '@/composables/useProjectArchive'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import HfTable from '@/components/common/HfTable.vue'
import AddMemberDialog from '@/components/project/AddMemberDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const route = useRoute()
const { canManageProject } = usePermission()
const { isArchived } = useProjectArchive()

const columns = computed(() => {
  const cols = [
    { prop: 'nickname', label: '昵称' },
    { prop: 'username', label: '用户名' },
    { prop: 'positionName', label: '职位' },
    { prop: 'joinedAt', label: '加入时间' }
  ]
  if (canManageProject.value && !isArchived.value) {
    cols.push({
      prop: 'operator', label: '操作', width: 100, view: false, edit: false, delete: false, actions: [
        { label: '移除', action: 'remove', type: 'danger' }
      ]
    })
  }
  return cols
})

const members = ref([])
const showAddDialog = ref(false)
const showRemoveDialog = ref(false)
const removeTarget = ref(null)
const removing = ref(false)
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

async function confirmRemove() {
  if (!removeTarget.value) return
  removing.value = true
  try {
    await removeProjectMember(route.params.id, removeTarget.value.userId)
    ElMessage.success('移除成功')
    showRemoveDialog.value = false
    await loadMembers()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    removing.value = false
  }
}

function handleAction({ action, row }) {
  if (action === 'remove') {
    removeTarget.value = row
    showRemoveDialog.value = true
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
