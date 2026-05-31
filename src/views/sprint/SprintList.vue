<template>
  <div class="sprint-list">
    <div class="page-header">
      <h3>迭代管理</h3>
      <el-button v-if="canCreate" type="primary" size="default" @click="showCreateDialog = true">
        <el-icon>
          <Plus />
        </el-icon>
        创建Sprint
      </el-button>
    </div>

    <div v-if="sprints.length === 0" class="empty-text">暂无Sprint</div>
    <el-table :data="sprints" stripe>
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="goal" label="目标" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="SPRINT_STATUS_MAP[row.status]?.tagType ?? 'info'" size="small">
            {{ SPRINT_STATUS_MAP[row.status]?.label || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="endDate" label="结束日期" width="120" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="goToSprint(row)">查看</el-button>
          <el-button v-if="canManage && row.status === 1" link type="success" size="small" @click="handleStart(row)">
            开始
          </el-button>
          <el-button v-if="canManage && row.status === 2" link type="warning" size="small" @click="handleComplete(row)">
            完成
          </el-button>
          <el-button v-if="canManage && row.status === 1" link size="small" @click="openEditDialog(row)">编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建Sprint对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建Sprint" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入Sprint名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="目标" prop="goal">
          <el-input v-model="createForm.goal" type="textarea" :rows="3" placeholder="请输入Sprint目标"
                    maxlength="500" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="createForm.startDate" type="date" placeholder="请选择日期"
                          value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="createForm.endDate" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑Sprint对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑Sprint" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="createRules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name" maxlength="100" />
        </el-form-item>
        <el-form-item label="目标" prop="goal">
          <el-input v-model="editForm.goal" type="textarea" :rows="3" maxlength="500" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="editForm.startDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="editForm.endDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editing" @click="handleEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getSprintList, createSprint, updateSprint, startSprint, completeSprint } from '@/api/sprint'
import { SPRINT_STATUS_MAP, POSITION_CODE, ROLE_CODE } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sprints = ref([])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const creating = ref(false)
const editing = ref(false)
const createFormRef = ref(null)
const editFormRef = ref(null)

const canCreate = computed(() => {
  const user = authStore.user
  return user?.roles?.includes(ROLE_CODE.ADMIN) || user?.positionCode === POSITION_CODE.PM
})

const canManage = computed(() => canCreate.value)

const createForm = ref({ name: '', goal: '', startDate: '', endDate: '' })
const editForm = ref({ id: null, name: '', goal: '', startDate: '', endDate: '' })

const createRules = {
  name: [{ required: true, message: '请输入Sprint名称', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

function goToSprint(sprint) {
  router.push({ name: 'SprintDetail', params: { id: route.params.id, sprintId: sprint.id } })
}

function openEditDialog(sprint) {
  editForm.value = {
    id: sprint.id,
    name: sprint.name,
    goal: sprint.goal || '',
    startDate: sprint.startDate,
    endDate: sprint.endDate
  }
  showEditDialog.value = true
}

async function loadSprints() {
  try {
    const res = await getSprintList(route.params.id)
    sprints.value = res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleCreate() {
  const valid = await createFormRef.value.validate().catch(() => false)
  if (!valid) return

  creating.value = true
  try {
    await createSprint(route.params.id, createForm.value)
    ElMessage.success('Sprint创建成功')
    showCreateDialog.value = false
    createForm.value = { name: '', goal: '', startDate: '', endDate: '' }
    await loadSprints()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    creating.value = false
  }
}

async function handleEdit() {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  editing.value = true
  try {
    const { id, ...data } = editForm.value
    await updateSprint(id, data)
    ElMessage.success('Sprint更新成功')
    showEditDialog.value = false
    await loadSprints()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    editing.value = false
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

.empty-text {
  text-align: center;
  color: var(--hf-text-placeholder);
  padding: 40px 0;
}
</style>
