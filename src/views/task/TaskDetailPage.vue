<template>
  <div class="task-detail-page" v-loading="loading">
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft" size="default" text />
      <template v-if="task">
        <div class="header-info">
          <span class="task-no">{{ taskNo }}</span>
          <span class="header-title">{{ task.title }}</span>
          <el-tag :type="TASK_TYPE_MAP[task.type]?.tagType ?? 'info'" size="small">
            {{ TASK_TYPE_MAP[task.type]?.label || '任务' }}
          </el-tag>
          <el-tag :type="TASK_STATUS_MAP[task.status]?.tagType ?? 'info'" size="small">
            {{ TASK_STATUS_MAP[task.status]?.label || '未知' }}
          </el-tag>
          <el-tag v-if="task.isDelayed === 1" type="danger" size="small" effect="dark">已延期</el-tag>
        </div>
        <div class="header-actions" v-if="task">
          <el-button v-if="!editing" type="primary" size="default" @click="startEdit">编辑</el-button>
          <template v-else>
            <el-button size="default" @click="cancelEdit">取消</el-button>
            <el-button type="primary" size="default" :loading="saving" @click="handleSave">保存</el-button>
          </template>
        </div>
      </template>
    </div>

    <template v-if="task">
      <div class="page-body">
        <div class="main-content">
          <template v-if="!editing">
            <div class="action-buttons"
                 v-if="canStart || canCompleteDev || canReviewPass || canReviewReject || canTestPass || canTestReject || canReopen || canClose || canCancel || canDelay || canAssign">
              <el-button v-if="canStart" type="primary" size="default" @click="handleAction('start')">开始开发
              </el-button>
              <el-button v-if="canCompleteDev" type="success" size="default" @click="handleAction('complete-dev')">
                开发完成
              </el-button>
              <el-button v-if="canReviewPass" type="success" size="default" @click="handleAction('review-pass')">
                评审通过
              </el-button>
              <el-button v-if="canReviewReject" type="warning" size="default" @click="handleAction('review-reject')">
                评审不通过
              </el-button>
              <el-button v-if="canTestPass" type="success" size="default" @click="handleAction('pass-test')">测试通过
              </el-button>
              <el-button v-if="canTestReject" type="warning" size="default" @click="handleAction('reject-test')">
                测试驳回
              </el-button>
              <el-button v-if="canReopen" size="default" @click="handleAction('reopen')">重新打开</el-button>
              <el-button v-if="canClose" type="info" size="default" @click="handleAction('close')">关闭</el-button>
              <el-button v-if="canAssign" size="default" @click="showAssignDialog = true">分配</el-button>
              <el-button v-if="canDelay" type="warning" size="default" @click="showDelayDialog = true">标记延期
              </el-button>
              <el-button v-if="canCancel" type="danger" size="default" @click="showCancelDialog = true">取消</el-button>
            </div>

            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>描述</span>
                </div>
              </template>
              <div class="description-content" v-html="task.description || '暂无描述'"></div>
            </el-card>

            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon>
                    <Connection />
                  </el-icon>
                  <span>父任务</span>
                  <el-button v-if="!task.parentId" link type="primary" size="small" @click="showParentDialog = true">
                    添加
                  </el-button>
                </div>
              </template>
              <div v-if="!task.parentId" class="empty-text">无父任务</div>
              <div v-else class="parent-task-item" @click="goToTask(task.parentId)">
                <el-tag :type="TASK_TYPE_MAP[task.parentType]?.tagType ?? 'info'" size="small">
                  {{ TASK_TYPE_MAP[task.parentType]?.label || '任务' }}
                </el-tag>
                <span class="parent-task-title">{{ task.parentTitle }}</span>
                <el-button type="danger" link size="small" @click.stop="handleRemoveParent">移除</el-button>
              </div>
            </el-card>

            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon>
                    <List />
                  </el-icon>
                  <span>子任务</span>
                  <el-button link type="primary" size="small" @click="showSubtaskCreateDialog = true">添加</el-button>
                </div>
              </template>
              <div v-if="subtasks.length === 0" class="empty-text">暂无子任务</div>
              <div v-for="sub in subtasks" :key="sub.id" class="subtask-item" @click="goToTask(sub.id)">
                <el-tag :type="TASK_STATUS_MAP[sub.status]?.tagType ?? 'info'" size="small">
                  {{ TASK_STATUS_MAP[sub.status]?.label }}
                </el-tag>
                <el-tag :type="TASK_TYPE_MAP[sub.type]?.tagType ?? 'info'" size="small">
                  {{ TASK_TYPE_MAP[sub.type]?.label }}
                </el-tag>
                <span class="subtask-title">{{ sub.title }}</span>
              </div>
            </el-card>

            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon>
                    <Share />
                  </el-icon>
                  <span>关联任务</span>
                  <el-button link type="primary" size="small" @click="showRelationDialog = true">添加</el-button>
                </div>
              </template>
              <div v-if="relations.length === 0" class="empty-text">暂无关联</div>
              <div v-for="rel in relations" :key="rel.id" class="relation-item">
                <el-tag size="small">{{ RELATION_TYPE_MAP[rel.relationType] }}</el-tag>
                <span class="relation-link" @click="goToTask(rel.relatedTaskId)">{{ rel.relatedTaskTitle }}</span>
                <el-button type="danger" link size="small" @click="handleDeleteRelation(rel.id)">移除</el-button>
              </div>
            </el-card>

            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon>
                    <ChatDotSquare />
                  </el-icon>
                  <span>评论</span>
                </div>
              </template>
              <div class="comment-input">
                <el-input v-model="commentContent" type="textarea" :rows="2" placeholder="输入评论..." />
                <div class="comment-submit">
                  <el-button type="primary" size="default" :loading="commenting" @click="handleAddComment">发表评论
                  </el-button>
                </div>
              </div>
              <div v-if="comments.length === 0" class="empty-text">暂无评论</div>
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <el-avatar :size="28" :src="comment.avatar">{{ comment.nickname?.charAt(0) }}</el-avatar>
                  <span class="comment-author">{{ comment.nickname || comment.username }}</span>
                  <span class="comment-time">{{ comment.createdAt }}</span>
                </div>
                <div class="comment-content" v-html="comment.content"></div>
              </div>
            </el-card>

            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  <span>操作历史</span>
                  <el-button v-if="activities.length > 1" link type="primary" size="small"
                             @click="historyExpanded = !historyExpanded">
                    {{ historyExpanded ? '收起' : `查看全部 (${activities.length})` }}
                  </el-button>
                </div>
              </template>
              <div v-if="activities.length > 0" class="history-list" :class="{ 'history-expanded': historyExpanded }">
                <el-timeline>
                  <el-timeline-item v-for="act in displayedActivities" :key="act.id" :timestamp="act.createdAt"
                                    placement="top">
                    {{ act.username }} {{ act.action }}
                    <span v-if="act.description" class="history-desc">{{ act.description }}</span>
                  </el-timeline-item>
                </el-timeline>
              </div>
              <div v-else class="empty-text">暂无操作记录</div>
            </el-card>
          </template>

          <template v-else>
            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  <span>编辑任务</span>
                </div>
              </template>
              <el-form :model="editForm" label-width="80px">
                <el-form-item label="标题" required>
                  <el-input v-model="editForm.title" maxlength="200" />
                </el-form-item>
                <el-form-item label="描述">
                  <el-input v-model="editForm.description" type="textarea" :rows="6" />
                </el-form-item>
                <el-form-item label="类型">
                  <el-select v-model="editForm.type">
                    <el-option v-for="(info, key) in TASK_TYPE_MAP" :key="key" :label="info.label"
                               :value="Number(key)" />
                  </el-select>
                </el-form-item>
                <el-form-item label="优先级">
                  <el-select v-model="editForm.priority">
                    <el-option v-for="(info, key) in TASK_PRIORITY_MAP" :key="key" :label="info.label"
                               :value="Number(key)" />
                  </el-select>
                </el-form-item>
                <el-form-item label="到期时间">
                  <el-date-picker v-model="editForm.dueDate" type="date" placeholder="请选择"
                                  value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item label="Sprint">
                  <el-select v-model="editForm.sprintId" placeholder="请选择" clearable>
                    <el-option v-for="s in sprints" :key="s.id" :label="s.name" :value="s.id" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
          </template>
        </div>

        <div class="side-info">
          <el-card class="info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon>
                  <InfoFilled />
                </el-icon>
                <span>任务信息</span>
              </div>
            </template>
            <div class="info-list">
              <div class="info-row">
                <div class="info-label">
                  <el-icon>
                    <User />
                  </el-icon>
                  创建人
                </div>
                <div class="info-value">{{ task.reporterName || '-' }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  <el-icon>
                    <Cpu />
                  </el-icon>
                  开发工程师
                </div>
                <div class="info-value">{{ task.developerName || '-' }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  <el-icon>
                    <Monitor />
                  </el-icon>
                  测试工程师
                </div>
                <div class="info-value">{{ task.testerName || '-' }}</div>
              </div>
              <el-divider style="margin: 8px 0" />
              <div class="info-row">
                <div class="info-label">
                  <el-icon>
                    <PriceTag />
                  </el-icon>
                  类型
                </div>
                <div class="info-value">
                  <el-tag :type="TASK_TYPE_MAP[task.type]?.tagType ?? 'info'" size="small">
                    {{ TASK_TYPE_MAP[task.type]?.label || '未知' }}
                  </el-tag>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  <el-icon>
                    <Flag />
                  </el-icon>
                  优先级
                </div>
                <div class="info-value">
                  <span :style="{ color: TASK_PRIORITY_MAP[task.priority]?.color, fontWeight: 500 }">
                    {{ TASK_PRIORITY_MAP[task.priority]?.label || '未知' }}
                  </span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  到期时间
                </div>
                <div class="info-value"
                     :class="{ 'overdue': task.dueDate && task.status !== TASK_STATUS.DONE && task.status !== TASK_STATUS.CLOSED && new Date(task.dueDate) < new Date() }">
                  {{ task.dueDate || '-' }}
                </div>
              </div>
              <el-divider style="margin: 8px 0" />
              <div class="info-row">
                <div class="info-label">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  创建时间
                </div>
                <div class="info-value">{{ task.createdAt }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  <el-icon>
                    <RefreshRight />
                  </el-icon>
                  更新时间
                </div>
                <div class="info-value">{{ task.updatedAt }}</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </template>

    <el-dialog v-model="showCancelDialog" title="取消任务" width="400px">
      <el-input v-model="cancelReason" type="textarea" :rows="3" placeholder="请输入取消原因" />
      <template #footer>
        <el-button @click="showCancelDialog = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="handleCancel">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDelayDialog" title="标记延期" width="400px">
      <el-input v-model="delayReason" type="textarea" :rows="3" placeholder="请输入延期原因" />
      <template #footer>
        <el-button @click="showDelayDialog = false">取消</el-button>
        <el-button type="warning" :loading="actionLoading" @click="handleDelay">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAssignDialog" title="分配任务" width="400px">
      <el-select v-model="assigneeId" placeholder="请选择开发工程师" filterable style="width: 100%">
        <el-option v-for="m in devMembers" :key="m.userId" :label="m.nickname || m.username" :value="m.userId" />
      </el-select>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="handleAssign">确定</el-button>
      </template>
    </el-dialog>

    <CreateTaskDialog
      v-model="showSubtaskCreateDialog"
      :project-id="projectId"
      :dev-lead-id="project?.devLeadId"
      :test-lead-id="project?.testLeadId"
      :parent-task-id="Number(route.params.taskId)"
      @created="handleSubtaskCreated"
    />

    <el-dialog v-model="showRelationDialog" title="添加关联" width="500px" @opened="loadProjectTasks">
      <el-form :model="relationForm" label-width="80px">
        <el-form-item label="关联任务">
          <el-select v-model="relationForm.relatedTaskId" placeholder="请搜索选择任务" filterable remote
                     :remote-method="searchProjectTasks" :loading="searchingTasks" style="width: 100%">
            <el-option v-for="t in projectTaskOptions" :key="t.id" :label="`${t.id} - ${t.title}`" :value="t.id">
              <span style="float: left">{{ t.id }} - {{ t.title }}</span>
              <span style="float: right; color: #8c8c8c; font-size: 12px">{{ TASK_TYPE_MAP[t.type]?.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联类型">
          <el-select v-model="relationForm.relationType">
            <el-option v-for="(label, key) in RELATION_TYPE_MAP" :key="key" :label="label" :value="Number(key)" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRelationDialog = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="handleAddRelation">添加</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showParentDialog" title="设置父任务" width="500px" @opened="loadParentTaskOptions">
      <el-select v-model="selectedParentId" placeholder="请搜索选择父任务" filterable remote
                 :remote-method="searchParentTasks" :loading="searchingParentTasks" style="width: 100%">
        <el-option v-for="t in parentTaskOptions" :key="t.id" :label="`${t.id} - ${t.title}`" :value="t.id">
          <span style="float: left">{{ t.id }} - {{ t.title }}</span>
          <span style="float: right; color: #8c8c8c; font-size: 12px">{{ TASK_TYPE_MAP[t.type]?.label }}</span>
        </el-option>
      </el-select>
      <template #footer>
        <el-button @click="showParentDialog = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="handleSetParent">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  addComment,
  addTaskRelation,
  assignTask,
  cancelTask,
  closeTask,
  completeDevTask,
  delayTask,
  deleteTaskRelation,
  getActivities,
  getComments,
  getSubtasks,
  getTaskDetail,
  getTaskList,
  getTaskRelations,
  passTestTask,
  rejectReviewTask,
  rejectTestTask,
  reopenTask,
  reviewPassTask,
  startTask,
  updateTask
} from '@/api/task'
import { getProjectDetail, getProjectMembers } from '@/api/project'
import {
  POSITION_CODE,
  RELATION_TYPE_MAP,
  ROLE_CODE,
  TASK_PRIORITY_MAP,
  TASK_STATUS,
  TASK_STATUS_MAP,
  TASK_TYPE_MAP
} from '@/utils/constants'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Calendar,
  ChatDotSquare,
  Clock,
  Connection,
  Cpu,
  Document,
  Edit,
  Flag,
  InfoFilled,
  List,
  Monitor,
  PriceTag,
  RefreshRight,
  Share,
  User
} from '@element-plus/icons-vue'
import CreateTaskDialog from '@/components/task/CreateTaskDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const actionLoading = ref(false)
const saving = ref(false)
const task = ref(null)
const subtasks = ref([])
const relations = ref([])
const comments = ref([])
const activities = ref([])
const projectMembers = ref([])
const sprints = ref([])

const editing = ref(false)
const editForm = ref({})

const showCancelDialog = ref(false)
const showDelayDialog = ref(false)
const showAssignDialog = ref(false)
const showSubtaskCreateDialog = ref(false)
const showRelationDialog = ref(false)
const cancelReason = ref('')
const delayReason = ref('')
const assigneeId = ref(null)
const commentContent = ref('')
const commenting = ref(false)
const relationForm = ref({ relatedTaskId: null, relationType: 1 })
const projectTaskOptions = ref([])
const searchingTasks = ref(false)
const showParentDialog = ref(false)
const selectedParentId = ref(null)
const parentTaskOptions = ref([])
const searchingParentTasks = ref(false)
const historyExpanded = ref(false)

const currentUser = computed(() => authStore.user)
const devMembers = computed(() => projectMembers.value.filter(m => m.positionCode === POSITION_CODE.DEV))
const displayedActivities = computed(() => {
  if (historyExpanded.value) return activities.value
  return activities.value.slice(0, 1)
})
const project = ref(null)
const projectId = computed(() => task.value?.projectId)

const taskNo = computed(() => {
  if (!task.value) return ''
  const code = project.value?.code || 'TASK'
  return `${code}-${task.value.id}`
})

const canStart = computed(() => task.value?.status === TASK_STATUS.TODO && task.value?.assigneeId === currentUser.value?.id)
const canCompleteDev = computed(() => task.value?.status === TASK_STATUS.IN_PROGRESS && task.value?.assigneeId === currentUser.value?.id)
const canReviewPass = computed(() => {
  if (task.value?.status !== TASK_STATUS.IN_REVIEW) return false
  if (currentUser.value?.positionCode !== POSITION_CODE.DEV) return false
  if (task.value?.developerId !== currentUser.value?.id) return true
  return devMembers.value.length <= 1
})
const canReviewReject = computed(() => canReviewPass.value)
const canTestPass = computed(() => task.value?.status === TASK_STATUS.IN_TEST && currentUser.value?.positionCode === POSITION_CODE.QA)
const canTestReject = computed(() => canTestPass.value)
const canReopen = computed(() => (task.value?.status === TASK_STATUS.DONE || task.value?.status === TASK_STATUS.CLOSED) && (currentUser.value?.positionCode === POSITION_CODE.PM || currentUser.value?.positionCode === POSITION_CODE.QA))
const canClose = computed(() => task.value?.status === TASK_STATUS.DONE && (currentUser.value?.positionCode === POSITION_CODE.PM || currentUser.value?.positionCode === POSITION_CODE.DEV))
const canCancel = computed(() => (task.value?.status === TASK_STATUS.TODO || task.value?.status === TASK_STATUS.IN_PROGRESS) && (currentUser.value?.positionCode === POSITION_CODE.PM || currentUser.value?.positionCode === POSITION_CODE.DEV))
const canDelay = computed(() => task.value?.status === TASK_STATUS.IN_PROGRESS && task.value?.assigneeId === currentUser.value?.id)
const canAssign = computed(() => {
  if (!task.value) return false
  if (task.value.status === TASK_STATUS.CANCELLED) return false
  if (task.value.status === TASK_STATUS.DONE) return false
  if (task.value.status === TASK_STATUS.CLOSED) return false
  return currentUser.value?.roles?.includes(ROLE_CODE.ADMIN) || currentUser.value?.positionCode === POSITION_CODE.PM || currentUser.value?.positionCode === POSITION_CODE.DEV
})

function goBack() {
  if (projectId.value) {
    router.push({ name: 'ProjectTasks', params: { id: projectId.value } })
  } else {
    router.back()
  }
}

function goToTask(taskId) {
  router.push({ name: 'TaskDetailPage', params: { taskId } })
}

function startEdit() {
  editForm.value = {
    title: task.value.title,
    description: task.value.description || '',
    type: task.value.type,
    priority: task.value.priority,
    dueDate: task.value.dueDate || '',
    sprintId: task.value.sprintId || null
  }
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function handleSave() {
  if (!editForm.value.title?.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  saving.value = true
  try {
    await updateTask(route.params.taskId, editForm.value)
    ElMessage.success('保存成功')
    editing.value = false
    await loadTaskDetail()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

async function loadTaskDetail() {
  loading.value = true
  try {
    const res = await getTaskDetail(route.params.taskId)
    task.value = res.data
    if (task.value?.projectId) {
      await loadProjectInfo(task.value.projectId)
      await loadProjectMembers()
    }
    if (projectMembers.value.length > 0) {
      const memberMap = new Map(projectMembers.value.map(m => [m.userId, m.nickname || m.username]))
      if (!task.value.developerName && task.value.developerId) {
        task.value.developerName = memberMap.get(task.value.developerId) || ''
      }
      if (!task.value.testerName && task.value.testerId) {
        task.value.testerName = memberMap.get(task.value.testerId) || ''
      }
    }
    if (task.value?.parentId && !task.value.parentTitle) {
      try {
        const parentRes = await getTaskDetail(task.value.parentId)
        task.value.parentTitle = parentRes.data.title
        task.value.parentType = parentRes.data.type
      } catch {
        // 忽略
      }
    }
    await loadSubtasks()
    await loadRelations()
    await loadComments()
    await loadActivities()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

async function loadProjectInfo(pid) {
  try {
    const res = await getProjectDetail(pid)
    project.value = res.data
  } catch {
    // 忽略
  }
}

async function loadProjectMembers() {
  if (!task.value?.projectId) return
  try {
    const res = await getProjectMembers(task.value.projectId)
    projectMembers.value = res.data || []
  } catch {
    // 忽略
  }
}

async function loadSubtasks() {
  try {
    const res = await getSubtasks(route.params.taskId)
    subtasks.value = res.data || []
  } catch {
    // 忽略
  }
}

async function loadRelations() {
  try {
    const res = await getTaskRelations(route.params.taskId)
    relations.value = res.data || []
  } catch {
    // 忽略
  }
}

async function loadComments() {
  try {
    const res = await getComments(route.params.taskId)
    comments.value = res.data || []
  } catch {
    // 忽略
  }
}

async function loadActivities() {
  try {
    const res = await getActivities(route.params.taskId)
    activities.value = res.data || []
  } catch {
    // 忽略
  }
}

async function handleAction(action) {
  actionLoading.value = true
  try {
    const taskId = route.params.taskId
    switch (action) {
      case 'start':
        await startTask(taskId);
        break
      case 'complete-dev':
        await completeDevTask(taskId);
        break
      case 'review-pass':
        await reviewPassTask(taskId);
        break
      case 'review-reject':
        await rejectReviewTask(taskId);
        break
      case 'pass-test':
        await passTestTask(taskId);
        break
      case 'reject-test':
        await rejectTestTask(taskId);
        break
      case 'reopen':
        await reopenTask(taskId);
        break
      case 'close':
        await closeTask(taskId);
        break
    }
    ElMessage.success('操作成功')
    await loadTaskDetail()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    actionLoading.value = false
  }
}

async function handleCancel() {
  if (!cancelReason.value?.trim()) {
    ElMessage.warning('请输入取消原因')
    return
  }
  actionLoading.value = true
  try {
    await cancelTask(route.params.taskId, { reason: cancelReason.value })
    ElMessage.success('任务已取消')
    showCancelDialog.value = false
    cancelReason.value = ''
    await loadTaskDetail()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    actionLoading.value = false
  }
}

async function handleDelay() {
  if (!delayReason.value?.trim()) {
    ElMessage.warning('请输入延期原因')
    return
  }
  actionLoading.value = true
  try {
    await delayTask(route.params.taskId, { reason: delayReason.value })
    ElMessage.success('已标记延期')
    showDelayDialog.value = false
    delayReason.value = ''
    await loadTaskDetail()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    actionLoading.value = false
  }
}

async function handleAssign() {
  if (!assigneeId.value) {
    ElMessage.warning('请选择开发工程师')
    return
  }
  actionLoading.value = true
  try {
    await assignTask(route.params.taskId, { assigneeId: assigneeId.value })
    ElMessage.success('分配成功')
    showAssignDialog.value = false
    assigneeId.value = null
    await loadTaskDetail()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    actionLoading.value = false
  }
}

async function handleRemoveParent() {
  try {
    await updateTask(route.params.taskId, { parentId: null })
    ElMessage.success('已移除父任务')
    await loadTaskDetail()
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleSubtaskCreated() {
  showSubtaskCreateDialog.value = false
  await loadSubtasks()
}

async function handleAddRelation() {
  if (!relationForm.value.relatedTaskId) {
    ElMessage.warning('请选择关联任务')
    return
  }
  actionLoading.value = true
  try {
    await addTaskRelation(route.params.taskId, relationForm.value)
    ElMessage.success('添加成功')
    showRelationDialog.value = false
    relationForm.value = { relatedTaskId: null, relationType: 1 }
    await loadRelations()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    actionLoading.value = false
  }
}

async function handleDeleteRelation(relationId) {
  try {
    await deleteTaskRelation(relationId)
    ElMessage.success('已移除关联')
    await loadRelations()
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleAddComment() {
  if (!commentContent.value?.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  commenting.value = true
  try {
    await addComment(route.params.taskId, commentContent.value)
    commentContent.value = ''
    await loadComments()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    commenting.value = false
  }
}

async function loadProjectTasks() {
  if (!task.value?.projectId) return
  try {
    const res = await getTaskList(task.value.projectId, { pageSize: 100 })
    projectTaskOptions.value = (res.data?.records || []).filter(t => t.id !== Number(route.params.taskId))
  } catch {
    // 忽略
  }
}

async function searchProjectTasks(query) {
  if (!query) return
  searchingTasks.value = true
  try {
    const res = await getTaskList(task.value.projectId, { keyword: query, pageSize: 20 })
    projectTaskOptions.value = (res.data?.records || []).filter(t => t.id !== Number(route.params.taskId))
  } catch {
    // 忽略
  } finally {
    searchingTasks.value = false
  }
}

async function loadParentTaskOptions() {
  if (!task.value?.projectId) return
  try {
    const res = await getTaskList(task.value.projectId, { pageSize: 100 })
    parentTaskOptions.value = (res.data?.records || []).filter(t => t.id !== Number(route.params.taskId))
  } catch {
    // 忽略
  }
}

async function searchParentTasks(query) {
  if (!query) return
  searchingParentTasks.value = true
  try {
    const res = await getTaskList(task.value.projectId, { keyword: query, pageSize: 20 })
    parentTaskOptions.value = (res.data?.records || []).filter(t => t.id !== Number(route.params.taskId))
  } catch {
    // 忽略
  } finally {
    searchingParentTasks.value = false
  }
}

async function handleSetParent() {
  if (!selectedParentId.value) {
    ElMessage.warning('请选择父任务')
    return
  }
  actionLoading.value = true
  try {
    await updateTask(route.params.taskId, { parentId: selectedParentId.value })
    ElMessage.success('设置成功')
    showParentDialog.value = false
    selectedParentId.value = null
    await loadTaskDetail()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    actionLoading.value = false
  }
}

watch(() => route.params.taskId, (newId) => {
  if (newId) {
    loadTaskDetail()
  }
})

onMounted(() => {
  loadTaskDetail()
})
</script>

<style scoped>
.task-detail-page {
  padding: 0 20px 20px;
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 0;
  background: var(--hf-bg-card);
  border-bottom: 1px solid var(--hf-border);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-no {
  font-size: 13px;
  font-weight: 600;
  color: var(--hf-text-secondary);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--hf-text-primary);
}

.header-actions {
  margin-left: auto;
}

.page-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.side-info {
  width: 300px;
  flex-shrink: 0;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.section-card {
  margin-bottom: 16px;
  border-radius: var(--hf-radius-md);
  border: 1px solid var(--hf-border);
}

.section-card :deep(.el-card__header) {
  padding: 12px 20px;
  background: var(--hf-bg-page);
  border-bottom: 1px solid var(--hf-border-light);
}

.section-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--hf-text-primary);
}

.card-header .el-icon {
  font-size: 16px;
  color: var(--hf-primary);
}

.card-header .el-button {
  margin-left: auto;
}

.description-content {
  font-size: 14px;
  color: var(--hf-text-regular);
  line-height: 1.8;
  word-break: break-word;
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
}

.empty-text {
  text-align: center;
  color: var(--hf-text-placeholder);
  padding: 24px 0;
  font-size: 14px;
}

.parent-task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--hf-bg-page);
  border-radius: var(--hf-radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.parent-task-item:hover {
  background: var(--hf-primary-bg);
}

.parent-task-title {
  flex: 1;
  font-size: 14px;
  color: var(--hf-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--hf-radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.subtask-item:hover {
  background: var(--hf-bg-page);
}

.subtask-item + .subtask-item {
  margin-top: 4px;
}

.subtask-title {
  flex: 1;
  font-size: 14px;
  color: var(--hf-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.relation-item + .relation-item {
  border-top: 1px solid var(--hf-divider);
}

.relation-link {
  color: var(--hf-primary);
  cursor: pointer;
  flex: 1;
  font-size: 14px;
}

.relation-link:hover {
  text-decoration: underline;
}

.comment-input {
  margin-bottom: 16px;
}

.comment-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.comment-item {
  padding: 14px 0;
}

.comment-item + .comment-item {
  border-top: 1px solid var(--hf-divider);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 14px;
  font-weight: 500;
  color: var(--hf-text-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--hf-text-placeholder);
}

.comment-content {
  font-size: 14px;
  color: var(--hf-text-regular);
  line-height: 1.6;
  padding-left: 36px;
}

.info-card {
  position: sticky;
  top: 20px;
  border-radius: var(--hf-radius-md);
  border: 1px solid var(--hf-border);
}

.info-card :deep(.el-card__header) {
  padding: 12px 20px;
  background: var(--hf-bg-page);
  border-bottom: 1px solid var(--hf-border-light);
}

.info-card :deep(.el-card__body) {
  padding: 12px 20px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--hf-text-secondary);
  flex-shrink: 0;
}

.info-label .el-icon {
  font-size: 14px;
}

.info-value {
  font-size: 14px;
  color: var(--hf-text-primary);
  text-align: right;
  word-break: break-all;
}

.info-value.overdue {
  color: var(--hf-danger);
  font-weight: 500;
}

.history-list {
  max-height: 120px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.history-list.history-expanded {
  max-height: 400px;
  overflow-y: auto;
}

.history-desc {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: var(--hf-text-secondary);
}
</style>
