<template>
  <div class="project-settings">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" maxlength="100" />
      </el-form-item>
      <el-form-item label="项目描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" />
      </el-form-item>
      <el-form-item label="项目经理" prop="pmId">
        <el-select v-model="form.pmId" placeholder="请选择" clearable filterable>
          <el-option
            v-for="user in pmUsers"
            :key="user.id"
            :label="user.nickname || user.username"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开发主管" prop="devLeadId">
        <el-select v-model="form.devLeadId" placeholder="请选择" clearable filterable>
          <el-option
            v-for="user in devUsers"
            :key="user.id"
            :label="user.nickname || user.username"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="测试主管" prop="testLeadId">
        <el-select v-model="form.testLeadId" placeholder="请选择" clearable filterable>
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
import { getUserList } from '@/api/user'
import { POSITION_CODE } from '@/utils/constants'
import { ElMessage } from 'element-plus'

const route = useRoute()
const formRef = ref(null)
const saving = ref(false)
const pmUsers = ref([])
const devUsers = ref([])
const qaUsers = ref([])

const form = ref({
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

async function loadUsers() {
  try {
    const [memberRes, userRes] = await Promise.all([
      getProjectMembers(route.params.id),
      getUserList({ pageSize: 200 })
    ])
    const memberIds = (memberRes.data || []).map(m => m.userId)
    const users = (userRes.data.records || []).filter(u => memberIds.includes(u.id))
    pmUsers.value = users.filter(u => u.positionCode === POSITION_CODE.PM)
    devUsers.value = users.filter(u => u.positionCode === POSITION_CODE.DEV)
    qaUsers.value = users.filter(u => u.positionCode === POSITION_CODE.QA)
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
    ElMessage.success('保存成功')
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProject()
  loadUsers()
})
</script>

<style scoped>
.project-settings {
  padding: 0;
}
</style>
