<template>
  <div class="task-detail-page">
    <TaskDetailHeader
      :task="task"
      :task-no="taskNo"
      :editing="editing"
      :saving="saving"
      :project-archived="projectArchived"
      @go-back="goBack"
      @start-edit="startEdit"
      @cancel-edit="cancelEdit"
      @save="saveTask"
      @start-task="handleStartTask"
      @complete-dev="handleCompleteDev"
      @review-pass="handleReviewPass"
      @review-reject="handleReviewReject"
      @test-pass="handleTestPass"
      @test-reject="handleTestReject"
      @close-task="handleCloseTask"
      @reopen-task="handleReopenTask"
    />

    <div v-if="loading" v-loading="true" class="loading-placeholder" />
    <div v-else-if="task" class="detail-content">
      <div class="detail-main">
        <template v-if="editing">
          <TaskEditForm :form="form" :sprints="sprints" />
        </template>
        <template v-else>
          <SectionCard title="描述" :icon="Document">
            <div class="task-description" v-html="task.description || '暂无描述'"></div>
          </SectionCard>
        </template>

        <TaskParentCard :parent-task="parentTask" @go-to-task="goToTask" @add="showAddParent = true"
                        @remove="removeParent" />
        <TaskSubtaskList :subtasks="subtasks" @add="showAddSubtask = true" @go-to-task="goToTask" />
        <TaskRelationList :relations="relations" @add="showAddRelation = true" @remove="removeRelation"
                          @go-to-task="goToTask" />
        <TaskCommentSection :comments="comments" :submitting="submittingComment" @submit="submitComment" />
        <TaskActivityTimeline :activities="activities" />
      </div>

      <div class="detail-sidebar">
        <TaskInfoSidebar :task="task" />
      </div>
    </div>
    <div v-else class="hf-empty-text">任务不存在或已被删除</div>

    <!-- 创建子任务弹窗 -->
    <CreateTaskDialog
      v-model="showAddSubtask"
      :project-id="task?.projectId"
      :parent-task-id="task?.id"
      @created="onSubtaskCreated"
    />
    <!-- 添加关联任务弹窗 -->
    <AddRelationDialog
      v-model="showAddRelation"
      :task-id="task?.id"
      :project-id="task?.projectId"
      @created="onRelationCreated"
    />
    <!-- 设置父任务弹窗 -->
    <AddParentDialog
      v-model="showAddParent"
      :task-id="task?.id"
      :project-id="task?.projectId"
      @selected="setParent"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  addComment,
  deleteTaskRelation,
  getActivities,
  getComments,
  getSubtasks,
  getTaskDetail,
  getTaskRelations,
  transitionTask,
  updateTask
} from '@/api/task'
import { getSprintList } from '@/api/sprint'
import { getProjectDetail, getProjectMembers } from '@/api/project'
import { PROJECT_STATUS, TASK_STATUS } from '@/utils/constants'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import SectionCard from '@/components/common/SectionCard.vue'
import TaskDetailHeader from './TaskDetailHeader.vue'
import TaskInfoSidebar from './TaskInfoSidebar.vue'
import TaskCommentSection from './TaskCommentSection.vue'
import TaskSubtaskList from './TaskSubtaskList.vue'
import TaskRelationList from './TaskRelationList.vue'
import TaskActivityTimeline from './TaskActivityTimeline.vue'
import TaskEditForm from './TaskEditForm.vue'
import TaskParentCard from './TaskParentCard.vue'
import CreateTaskDialog from '@/components/task/CreateTaskDialog.vue'
import AddRelationDialog from './AddRelationDialog.vue'
import AddParentDialog from './AddParentDialog.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const editing = ref(false)
const task = ref(null)
const comments = ref([])
const subtasks = ref([])
const relations = ref([])
const activities = ref([])
const sprints = ref([])
const submittingComment = ref(false)
const showAddSubtask = ref(false)
const showAddRelation = ref(false)
const showAddParent = ref(false)
const projectStatus = ref(null)
const parentTask = ref(null)

const projectArchived = computed(() => projectStatus.value === PROJECT_STATUS.ARCHIVED)

const form = reactive({
  title: '',
  description: '',
  type: 1,
  priority: 2,
  dueDate: '',
  sprintId: null
})

const taskNo = ref('')

function goBack() {
  if (task.value?.projectId) {
    router.push({ name: 'ProjectTasks', params: { id: task.value.projectId } })
  } else {
    router.push({ name: 'MyTasks' })
  }
}

function goToTask(taskId) {
  router.push({ name: 'TaskDetailPage', params: { taskId } })
}

function startEdit() {
  if (!task.value) return
  form.title = task.value.title
  form.description = task.value.description || ''
  form.type = task.value.type
  form.priority = task.value.priority
  form.dueDate = task.value.dueDate || ''
  form.sprintId = task.value.sprintId || null
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function saveTask() {
  saving.value = true
  try {
    await updateTask(task.value.id, form)
    ElMessage.success('保存成功')
    editing.value = false
    await loadTask()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

async function submitComment(content) {
  submittingComment.value = true
  try {
    await addComment(task.value.id, { content })
    await loadComments()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    submittingComment.value = false
  }
}

async function removeRelation(relationId) {
  try {
    await deleteTaskRelation(task.value.id, relationId)
    await loadRelations()
  } catch {
    // 错误已在拦截器中处理
  }
}

function onSubtaskCreated() {
  loadSubtasks()
}

function onRelationCreated() {
  loadRelations()
}

async function removeParent() {
  try {
    await updateTask(task.value.id, { parentId: null })
    parentTask.value = null
    await loadTask()
    ElMessage.success('已移除父任务')
  } catch {
    // 错误已在拦截器中处理
  }
}

async function setParent(parentId) {
  try {
    await updateTask(task.value.id, { parentId })
    await loadTask()
    ElMessage.success('已设置父任务')
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleTransition(targetStatus, successMsg, cancelReason) {
  try {
    await transitionTask(task.value.id, targetStatus, cancelReason)
    ElMessage.success(successMsg)
    await loadTask()
  } catch {
    // 错误已在拦截器中处理
  }
}

function handleStartTask() {
  handleTransition(TASK_STATUS.IN_PROGRESS, '任务已开始')
}

function handleCompleteDev() {
  handleTransition(TASK_STATUS.IN_REVIEW, '开发已完成')
}

function handleReviewPass() {
  handleTransition(TASK_STATUS.IN_TEST, '审查通过')
}

function handleReviewReject() {
  handleTransition(TASK_STATUS.IN_PROGRESS, '审查已驳回')
}

function handleTestPass() {
  handleTransition(TASK_STATUS.DONE, '测试通过')
}

function handleTestReject() {
  handleTransition(TASK_STATUS.IN_PROGRESS, '测试已驳回')
}

function handleCloseTask() {
  handleTransition(TASK_STATUS.CLOSED, '任务已关闭')
}

function handleReopenTask() {
  handleTransition(TASK_STATUS.TODO, '任务已重新打开')
}

async function loadTask() {
  const res = await getTaskDetail(route.params.taskId)
  task.value = res.data
  taskNo.value = task.value.taskCode || `${task.value.projectCode || 'TASK'}-${task.value.id}`
  // 加载项目状态，判断是否归档
  if (task.value.projectId) {
    try {
      const projRes = await getProjectDetail(task.value.projectId)
      projectStatus.value = projRes.data.status
    } catch {
      // 忽略
    }
  }
  // 补充开发/测试工程师名称
  if (task.value.projectId && (!task.value.developerName || !task.value.testerName)) {
    fillMemberNames()
  }
  // 加载父任务详情
  if (task.value.parentId) {
    loadParentTask()
  } else {
    parentTask.value = null
  }
}

async function loadParentTask() {
  try {
    const res = await getTaskDetail(task.value.parentId)
    parentTask.value = res.data
  } catch {
    parentTask.value = null
  }
}

async function fillMemberNames() {
  try {
    const res = await getProjectMembers(task.value.projectId)
    const members = res.data || []
    const memberMap = new Map(members.map(m => [m.userId, m.nickname || m.username]))
    if (!task.value.developerName && task.value.developerId) {
      task.value.developerName = memberMap.get(task.value.developerId) || ''
    }
    if (!task.value.testerName && task.value.testerId) {
      task.value.testerName = memberMap.get(task.value.testerId) || ''
    }
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

async function loadActivities() {
  try {
    const res = await getActivities(route.params.taskId)
    activities.value = res.data || []
  } catch {
    // 忽略
  }
}

async function loadSprints() {
  if (!task.value?.projectId) return
  try {
    const res = await getSprintList(task.value.projectId)
    sprints.value = res.data || []
  } catch {
    // 忽略
  }
}

// 路由参数变化时重新加载数据（同组件内跳转不会重新挂载）
watch(() => route.params.taskId, (newId) => {
  if (newId) {
    loadAll()
  }
})

async function loadAll() {
  loading.value = true
  try {
    await loadTask()
    await Promise.all([
      loadComments(),
      loadSubtasks(),
      loadRelations(),
      loadActivities(),
      loadSprints()
    ])
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadAll()
})
</script>

<style scoped>
.task-detail-page {
  padding: var(--hf-page-padding);
}

.loading-placeholder {
  min-height: 400px;
}

.detail-content {
  display: flex;
  gap: 20px;
}

.detail-main {
  flex: 1;
  min-width: 0;
}

.detail-sidebar {
  width: 320px;
  flex-shrink: 0;
}

.task-description {
  font-size: 14px;
  color: var(--hf-text-regular);
  line-height: 1.7;
}

@media (max-width: 1024px) {
  .detail-content {
    flex-direction: column;
  }

  .detail-sidebar {
    width: 100%;
  }
}
</style>
