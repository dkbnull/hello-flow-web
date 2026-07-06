<template>
  <div class="project-versions">
    <PageHeader title="版本管理">
      <template #actions>
        <el-button
          v-if="canManageProject && !isArchived"
          type="primary"
          size="default"
          @click="openCreate"
        >
          <el-icon>
            <Plus />
          </el-icon>
          新建版本
        </el-button>
      </template>
    </PageHeader>

    <HfTable
      :columns="columns"
      :data="versions"
      :total="0"
      :show-size-changer="false"
      @action="handleAction"
    >
      <template #status="{ row }">
        <el-tag :type="VERSION_STATUS_MAP[row.status]?.tagType || 'info'" size="default">
          {{ VERSION_STATUS_MAP[row.status]?.label || '未知' }}
        </el-tag>
      </template>
    </HfTable>

    <!-- 版本表单弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="editingVersion.id ? '编辑版本' : '新建版本'"
      width="500px"
      align-center
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="版本号" prop="name">
          <el-input v-model="form.name" placeholder="如 v1.0.0" maxlength="50" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option
              v-for="(info, key) in VERSION_STATUS_MAP"
              :key="key"
              :label="info.label"
              :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布日期" prop="releaseDate">
          <el-date-picker v-model="form.releaseDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入版本描述" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <ConfirmDialog
      v-model="showDelete"
      title="删除版本"
      :message="`确定要删除版本「${deleteTarget?.name}」吗？删除后不可恢复。`"
      type="danger"
      confirm-text="删除"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { createVersion, deleteVersion, getVersionList, updateVersion } from '@/api/version'
import { usePermission } from '@/composables/usePermission'
import { useProjectArchive } from '@/composables/useProjectArchive'
import { VERSION_STATUS, VERSION_STATUS_MAP } from '@/utils/constants'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import HfTable from '@/components/common/HfTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const route = useRoute()
const { canManageProject } = usePermission()
const { isArchived } = useProjectArchive()

const projectId = computed(() => route.params.id)

const columns = computed(() => {
  const cols = [
    { prop: 'name', label: '版本号', minWidth: 130 },
    { prop: 'status', label: '状态', width: 100, slot: 'status' },
    { prop: 'releaseDate', label: '发布日期', width: 120 },
    { prop: 'description', label: '描述', minWidth: 160, showOverflowTooltip: true }
  ]
  if (canManageProject.value && !isArchived.value) {
    cols.push({
      prop: 'operator', label: '操作', width: 140, view: false, edit: false, actions: [
        { label: '编辑', action: 'edit', type: 'primary' },
        { label: '删除', action: 'delete', type: 'danger' }
      ]
    })
  }
  return cols
})

const versions = ref([])
const formVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const editingVersion = ref({})
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

const form = reactive({
  name: '',
  status: VERSION_STATUS.PLANNED,
  releaseDate: null,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

async function loadVersions() {
  try {
    const res = await getVersionList({ projectId: projectId.value })
    versions.value = res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

function openCreate() {
  editingVersion.value = {}
  Object.assign(form, {
    name: '',
    status: VERSION_STATUS.PLANNED,
    releaseDate: null,
    description: ''
  })
  formVisible.value = true
}

function openEdit(row) {
  editingVersion.value = { ...row }
  Object.assign(form, {
    name: row.name || '',
    status: row.status ?? VERSION_STATUS.PLANNED,
    releaseDate: row.releaseDate || null,
    description: row.description || ''
  })
  formVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingVersion.value.id) {
      await updateVersion(editingVersion.value.id, { ...form })
      ElMessage.success('修改成功')
    } else {
      await createVersion({ projectId: Number(projectId.value), ...form })
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    await loadVersions()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    submitting.value = false
  }
}

function handleAction({ action, row }) {
  if (action === 'edit') {
    openEdit(row)
  } else if (action === 'delete') {
    deleteTarget.value = row
    showDelete.value = true
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteVersion(deleteTarget.value.id)
    ElMessage.success('删除成功')
    showDelete.value = false
    await loadVersions()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadVersions()
})
</script>

<style scoped>
.project-versions {
  padding: 0;
}
</style>
