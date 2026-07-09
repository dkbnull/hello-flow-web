<template>
  <div class="project-tags">
    <PageHeader title="标签管理">
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
          新建标签
        </el-button>
      </template>
    </PageHeader>

    <HfTable
      :columns="columns"
      :data="tags"
      :total="0"
      :show-size-changer="false"
      @action="handleAction"
    />

    <!-- 标签表单弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="editingTag.id ? '编辑标签' : '新建标签'"
      width="500px"
      align-center
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" maxlength="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <ConfirmDialog
      v-model="showDelete"
      title="删除标签"
      :message="`确定要删除标签「${deleteTarget?.name}」吗？删除后不可恢复。`"
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
import { createTag, deleteTag, getTagList, updateTag } from '@/api/tag'
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
    { prop: 'name', label: '标签名称', minWidth: 140 },
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

const tags = ref([])
const formVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const editingTag = ref({})
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

const form = reactive({
  name: ''
})

const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

async function loadTags() {
  try {
    const res = await getTagList({ projectId: projectId.value })
    tags.value = res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

function openCreate() {
  editingTag.value = {}
  Object.assign(form, { name: '' })
  formVisible.value = true
}

function openEdit(row) {
  editingTag.value = { ...row }
  Object.assign(form, { name: row.name || '' })
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
    if (editingTag.value.id) {
      await updateTag(editingTag.value.id, { ...form })
      ElMessage.success('修改成功')
    } else {
      await createTag({ projectId: Number(projectId.value), ...form })
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    await loadTags()
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
    await deleteTag(deleteTarget.value.id)
    ElMessage.success('删除成功')
    showDelete.value = false
    await loadTags()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.project-tags {
  padding: 0;
}
</style>
