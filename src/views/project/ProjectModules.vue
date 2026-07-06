<template>
  <div class="project-modules">
    <PageHeader title="模块管理">
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
          新建模块
        </el-button>
      </template>
    </PageHeader>

    <HfTable
      :columns="columns"
      :data="modules"
      :total="0"
      :show-size-changer="false"
      @action="handleAction"
    />

    <!-- 模块表单弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="editingModule.id ? '编辑模块' : '新建模块'"
      width="500px"
      align-center
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模块名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" placeholder="默认0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <ConfirmDialog
      v-model="showDelete"
      title="删除模块"
      :message="`确定要删除模块「${deleteTarget?.name}」吗？删除后不可恢复。`"
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
import { createModule, deleteModule, getModuleList, updateModule } from '@/api/module'
import { usePermission } from '@/composables/usePermission'
import { useProjectArchive } from '@/composables/useProjectArchive'
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
    { prop: 'name', label: '模块名称', minWidth: 140 },
    { prop: 'sort', label: '排序', width: 100 },
    { prop: 'createdAt', label: '创建时间', width: 170 }
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

const modules = ref([])
const formVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const editingModule = ref({})
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

const form = reactive({
  name: '',
  sort: 0
})

const rules = {
  name: [{ required: true, message: '请输入模块名称', trigger: 'blur' }]
}

async function loadModules() {
  try {
    const res = await getModuleList({ projectId: projectId.value })
    modules.value = res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

function openCreate() {
  editingModule.value = {}
  Object.assign(form, { name: '', sort: 0 })
  formVisible.value = true
}

function openEdit(row) {
  editingModule.value = { ...row }
  Object.assign(form, {
    name: row.name || '',
    sort: row.sort ?? 0
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
    if (editingModule.value.id) {
      await updateModule(editingModule.value.id, { ...form })
      ElMessage.success('修改成功')
    } else {
      await createModule({ projectId: Number(projectId.value), ...form })
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    await loadModules()
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
    await deleteModule(deleteTarget.value.id)
    ElMessage.success('删除成功')
    showDelete.value = false
    await loadModules()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadModules()
})
</script>

<style scoped>
.project-modules {
  padding: 0;
}
</style>
