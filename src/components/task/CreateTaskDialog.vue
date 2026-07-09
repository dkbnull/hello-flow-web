<template>
  <el-dialog
    v-model="visible"
    :title="parentTaskId ? '新建子任务' : '新建任务'"
    width="950px"
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @opened="formRef?.clearValidate()"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="task-create-form"
             :validate-on-rule-change="false">
      <el-row :gutter="16">
        <el-col v-if="!parentTaskId" :span="12">
          <el-form-item label="项目" prop="projectId">
            <el-select
              v-model="form.projectId"
              placeholder="请选择项目"
              filterable
              @change="handleProjectChange"
            >
              <el-option
                v-for="p in projects"
                :key="p.id"
                :label="p.name"
                :value="p.id"
                :disabled="p.status === PROJECT_STATUS.ARCHIVED"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="parentTaskId ? 24 : 12">
          <el-form-item label="任务类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择">
              <el-option
                v-for="(info, key) in TASK_TYPE_MAP"
                :key="key"
                :label="info.label"
                :value="Number(key)"
              >
                <span class="type-option">
                  <span class="type-dot" :style="{ background: info.color }"></span>
                  {{ info.label }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="模块" prop="moduleId">
            <el-select v-model="form.moduleId" placeholder="请选择模块" clearable filterable>
              <el-option v-for="m in modules" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="请选择">
              <el-option
                v-for="(info, key) in TASK_PRIORITY_MAP"
                :key="key"
                :label="info.label"
                :value="Number(key)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入概要" maxlength="200" show-word-limit />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <MarkdownEditor v-model="form.description" height="280px" placeholder="请输入描述，支持 Markdown 语法" />
      </el-form-item>

      <!-- 缺陷特有字段 -->
      <template v-if="isBug">
        <el-form-item label="影响版本" prop="affectedVersionIds">
          <el-select v-model="form.affectedVersionIds" placeholder="请选择影响版本" clearable filterable multiple>
            <el-option v-for="v in versions" :key="v.id" :label="v.name" :value="v.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="缺陷类型" prop="defectType">
              <el-select v-model="form.defectType" placeholder="请选择">
                <el-option
                  v-for="(info, key) in DEFECT_TYPE_MAP"
                  :key="key"
                  :label="info.label"
                  :value="Number(key)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="复现概率" prop="reproductionProbability">
              <el-select v-model="form.reproductionProbability" placeholder="请选择">
                <el-option
                  v-for="(info, key) in REPRODUCTION_PROBABILITY_MAP"
                  :key="key"
                  :label="info.label"
                  :value="Number(key)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- 开始时间 + 到期日 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startDate">
            <el-date-picker v-model="form.startDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="到期时间" prop="dueDate">
            <el-date-picker v-model="form.dueDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 开发工程师 + 测试工程师 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="开发工程师" prop="developerId">
            <el-select v-model="form.developerId" placeholder="请选择" clearable filterable>
              <el-option v-for="m in devMembers" :key="m.userId" :label="m.nickname" :value="m.userId" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="测试工程师" prop="testerId">
            <el-select v-model="form.testerId" placeholder="请选择" clearable filterable>
              <el-option v-for="m in qaMembers" :key="m.userId" :label="m.nickname" :value="m.userId" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="auto-assign-tip">开发工程师默认为当前用户或开发主责，测试工程师默认为项目测试主责，可手动调整</div>

      <!-- 所属迭代 + 标签 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属迭代" prop="sprintId">
            <el-select v-model="form.sprintId" placeholder="请选择" clearable>
              <el-option v-for="s in sprints" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标签" prop="tagIds">
            <el-select v-model="form.tagIds" multiple filterable default-first-option
                       placeholder="选择标签">
              <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="附件">
        <AttachmentUpload ref="attachmentRef" :max="10" :max-size="20" @pending-change="() => {}" />
      </el-form-item>

      <el-form-item label="链接问题">
        <LinkIssuePicker
          v-model="relations"
          :project-id="currentProjectId"
          :exclude-ids="excludeRelationIds"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getProjectDetail, getProjectList, getProjectMembers } from '@/api/project'
import { getModuleList } from '@/api/module'
import { getTagList } from '@/api/tag'
import { getVersionList } from '@/api/version'
import { getSprintList } from '@/api/sprint'
import { addTaskRelation, createSubtask, createTask } from '@/api/task'
import { uploadAttachment } from '@/api/attachment'
import { useAuthStore } from '@/stores/auth'
import {
  DEFECT_TYPE_MAP,
  DESC_FORMAT,
  POSITION_CODE,
  PROJECT_STATUS,
  REPRODUCTION_PROBABILITY_MAP,
  TASK_PRIORITY,
  TASK_PRIORITY_MAP,
  TASK_TYPE,
  TASK_TYPE_MAP
} from '@/utils/constants'
import { ElMessage } from 'element-plus'
import MarkdownEditor from '@/components/common/MarkdownEditor.vue'
import AttachmentUpload from '@/components/common/AttachmentUpload.vue'
import LinkIssuePicker from '@/components/common/LinkIssuePicker.vue'

// 创建任务统一弹窗：支持全局新建（可选项目）、项目内新建（默认选中当前项目，可切换）、创建子任务
const props = defineProps({
  modelValue: Boolean,
  // 默认项目 ID：项目详情页传入，自动选中但可切换
  projectId: { type: [String, Number], default: null },
  // 父任务 ID：传入时为创建子任务场景
  parentTaskId: { type: Number, default: null },
  parentTask: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'created'])

const authStore = useAuthStore()
const visible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const attachmentRef = ref(null)

const projects = ref([])
const project = ref(null)
const modules = ref([])
const versions = ref([])
const sprints = ref([])
const devMembers = ref([])
const qaMembers = ref([])
const tags = ref([])
const relations = ref([])

// 当前生效的项目 ID（用于链接问题过滤）
const currentProjectId = computed(() => Number(form.value.projectId) || null)
// 是否为缺陷类型（控制缺陷专属字段显示）
const isBug = computed(() => form.value.type === TASK_TYPE.BUG)
// 链接问题排除当前任务自身（子任务场景排除父任务）
const excludeRelationIds = computed(() => props.parentTaskId ? [props.parentTaskId] : [])

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDefaultForm() {
  return {
    projectId: null,
    type: TASK_TYPE.REQUIREMENT,
    moduleId: null,
    title: '',
    description: '',
    descriptionFormat: DESC_FORMAT.MARKDOWN,
    priority: TASK_PRIORITY.MEDIUM,
    tagIds: [],
    dueDate: getToday(),
    startDate: getToday(),
    sprintId: null,
    // 缺陷特有
    affectedVersionIds: [],
    reproductionProbability: null,
    defectType: null,
    // 经办人
    developerId: null,
    testerId: null
  }
}

const form = ref(getDefaultForm())

const rules = computed(() => {
  const base = {
    type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    dueDate: [{ required: true, message: '请选择到期时间', trigger: 'change' }]
  }
  // 非子任务场景项目必填
  if (!props.parentTaskId) {
    base.projectId = [{ required: true, message: '请选择项目', trigger: 'change' }]
  }
  // 缺陷类型必填项（影响版本非必填）
  if (isBug.value) {
    base.defectType = [{ required: true, message: '请选择缺陷类型', trigger: 'change' }]
    base.reproductionProbability = [{ required: true, message: '请选择复现概率', trigger: 'change' }]
  }
  return base
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
    projects.value = []
    if (props.parentTaskId) {
      // 子任务场景：使用父任务所属项目
      if (props.parentTask?.projectId) {
        form.value.projectId = props.parentTask.projectId
        handleProjectChange(form.value.projectId)
      }
    } else {
      // 非子任务场景：加载项目列表，携带默认项目时自动选中
      loadProjects()
      if (props.projectId != null && props.projectId !== '') {
        form.value.projectId = Number(props.projectId)
        handleProjectChange(form.value.projectId)
      }
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function resetForm() {
  form.value = getDefaultForm()
  relations.value = []
  attachmentRef.value?.clearPending()
  // 子任务场景：继承父任务的经办人
  if (props.parentTaskId && props.parentTask) {
    form.value.developerId = props.parentTask.developerId || null
    form.value.testerId = props.parentTask.testerId || null
  }
  // 非子任务场景：开发工程师在 handleProjectChange 中根据项目成员自动分配
}

// 加载项目列表
async function loadProjects() {
  try {
    const res = await getProjectList({ pageSize: 200, status: PROJECT_STATUS.ACTIVE })
    projects.value = res.data.records || res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

// 项目变化时加载模块/版本/成员/迭代，并设置默认经办人
async function handleProjectChange(projectId) {
  if (!projectId) {
    modules.value = []
    versions.value = []
    devMembers.value = []
    qaMembers.value = []
    sprints.value = []
    project.value = null
    return
  }
  form.value.moduleId = null
  try {
    const [detail, modRes, verRes, memberRes, sprintRes, tagRes] = await Promise.all([
      getProjectDetail(projectId),
      getModuleList({ projectId }),
      getVersionList({ projectId }),
      getProjectMembers(projectId),
      getSprintList(projectId),
      getTagList({ projectId })
    ])
    project.value = detail.data
    modules.value = modRes.data || []
    versions.value = verRes.data || []
    sprints.value = sprintRes.data || []
    tags.value = tagRes.data || []
    // 构建成员 ID→昵称映射，并按职位分组
    const allMembers = memberRes.data || []
    const nameMap = {}
    allMembers.forEach(m => {
      nameMap[m.userId] = m.nickname || m.username
    })
    devMembers.value = allMembers
      .filter(m => m.positionCode === POSITION_CODE.DEV)
      .map(m => ({ userId: m.userId, nickname: m.nickname || m.username }))
    qaMembers.value = allMembers
      .filter(m => m.positionCode === POSITION_CODE.QA)
      .map(m => ({ userId: m.userId, nickname: m.nickname || m.username }))
    // 选中项目后，自动设置测试工程师为项目测试主责
    const testLeadId = detail.data?.testLeadId
    if (testLeadId) {
      form.value.testerId = testLeadId
      // 若测试主责不在 QA 成员中，补入以保证显示 nickname
      if (!qaMembers.value.some(m => m.userId === testLeadId)) {
        qaMembers.value.push({ userId: testLeadId, nickname: nameMap[testLeadId] || `用户${testLeadId}` })
      }
    }
    // 自动分配开发工程师：当前用户是项目DEV成员→分配给自己，否则→分配给开发主责
    const me = authStore.user
    const isDevInProject = me?.id && devMembers.value.some(m => m.userId === me.id)
    if (isDevInProject) {
      form.value.developerId = me.id
    } else {
      const devLeadId = detail.data?.devLeadId
      if (devLeadId) {
        form.value.developerId = devLeadId
        // 若开发主责不在 DEV 成员中，补入以保证显示 nickname
        if (!devMembers.value.some(m => m.userId === devLeadId)) {
          devMembers.value.push({ userId: devLeadId, nickname: nameMap[devLeadId] || `用户${devLeadId}` })
        }
      }
    }
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    // 1. 创建任务主体
    const payload = { ...form.value }
    payload.projectId = Number(payload.projectId)

    let taskId
    if (props.parentTaskId) {
      const res = await createSubtask(props.parentTaskId, payload)
      taskId = res.data?.id || res.data
    } else {
      const res = await createTask(payload)
      taskId = res.data?.id || res.data
    }

    // 2. 上传暂存附件（任务创建后才有 ID）
    const pendingFiles = attachmentRef.value?.getPendingFiles() || []
    if (pendingFiles.length) {
      await Promise.all(pendingFiles.map(f => uploadAttachment(taskId, f)))
    }

    // 3. 批量添加问题关联
    if (relations.value.length) {
      await Promise.all(
        relations.value.map(r => addTaskRelation(taskId, {
          relatedTaskId: r.taskId,
          relationType: r.relationType
        }))
      )
    }

    ElMessage.success(props.parentTaskId ? '子任务创建成功' : '任务创建成功')
    visible.value = false
    emit('created')
  } catch {
    // 错误已在拦截器中处理
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.task-create-form :deep(.el-select),
.task-create-form :deep(.el-date-editor) {
  width: 100%;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.auto-assign-tip {
  margin: -8px 0 12px 100px;
  font-size: 12px;
  color: var(--hf-text-secondary, #909399);
}
</style>
