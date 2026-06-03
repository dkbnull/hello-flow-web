<template>
  <div class="project-settings">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
      <el-form-item label="项目编码">
        <el-input :model-value="form.code" disabled />
      </el-form-item>
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" maxlength="100" :disabled="isArchived" />
      </el-form-item>
      <el-form-item label="项目描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" :disabled="isArchived" />
      </el-form-item>
      <el-form-item label="项目经理" prop="pmId">
        <el-select v-model="form.pmId" placeholder="请选择" clearable filterable :disabled="isArchived">
          <el-option
            v-for="user in pmUsers"
            :key="user.id"
            :label="user.nickname || user.username"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开发主管" prop="devLeadId">
        <el-select v-model="form.devLeadId" placeholder="请选择" clearable filterable :disabled="isArchived">
          <el-option
            v-for="user in devUsers"
            :key="user.id"
            :label="user.nickname || user.username"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="测试主管" prop="testLeadId">
        <el-select v-model="form.testLeadId" placeholder="请选择" clearable filterable :disabled="isArchived">
          <el-option
            v-for="user in qaUsers"
            :key="user.id"
            :label="user.nickname || user.username"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">进行中</el-radio>
          <el-radio :value="0">归档</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectDetail, getProjectMembers, updateProject } from '@/api/project'
import { useUserOptions } from '@/composables/useUserOptions'
import { useProjectArchive } from '@/composables/useProjectArchive'
import { useProjectStore } from '@/stores/project'
import { ElMessage } from 'element-plus'

const route = useRoute()
const formRef = ref(null)
const saving = ref(false)
const projectStore = useProjectStore()
const { isArchived } = useProjectArchive()
const { pmUsers, devUsers, qaUsers, allUsers, loadUsers: loadAllUsers, classifyUsers } = useUserOptions()

const form = ref({
  code: '',
  name: '',
  description: '',
  pmId: null,
  devLeadId: null,
  testLeadId: null,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
}

async function loadProject() {
  try {
    const res = await getProjectDetail(route.params.id)
    const p = res.data
    form.value = {
      code: p.code,
      name: p.name,
      description: p.description || '',
      pmId: p.pmId,
      devLeadId: p.devLeadId,
      testLeadId: p.testLeadId,
      status: p.status
    }
  } catch {
    // 错误已在拦截器中处理
  }
}

async function loadProjectUsers() {
  try {
    const [memberRes] = await Promise.all([
      getProjectMembers(route.params.id),
      loadAllUsers()
    ])
    const memberIds = (memberRes.data || []).map(m => m.userId)
    const projectUsers = allUsers.value.filter(u => memberIds.includes(u.id))
    classifyUsers(projectUsers)
  } catch {
    // 忽略
  }
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await updateProject(route.params.id, form.value)
    // 更新 store 中的项目状态，使归档限制立即生效
    const res = await getProjectDetail(route.params.id)
    projectStore.setCurrentProject(res.data)
    ElMessage.success('保存成功')
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProject()
  loadProjectUsers()
})
</script>

<style scoped>
.project-settings {
  padding: 0;
}
</style>
