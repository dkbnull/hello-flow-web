<template>
  <div class="task-detail-page">
    <div v-if="loading" v-loading="true" class="loading-placeholder" />
    <div v-else-if="task" class="detail-content">
      <div class="detail-main-panel">
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

        <template v-if="editing">
          <TaskEditForm :form="form" :sprints="sprints" />
        </template>
        <template v-else>
          <!-- 描述 -->
          <div class="detail-section">
            <div class="section-title"><span>描述</span></div>
            <div class="section-body">
              <MarkdownEditor v-if="task.description" :read-only="true" :model-value="task.description" />
              <div v-else class="hf-empty-text">暂无描述</div>
            </div>
          </div>
          <div class="section-divider" />

          <!-- 解决信息（仅缺陷类型且有解决数据时显示） -->
          <template v-if="isBug && hasResolution">
            <div class="detail-section">
              <div class="section-title"><span>解决信息</span></div>
              <div class="section-body resolution-info">
                <div class="resolution-row">
                  <span class="resolution-label">解决状态</span>
                  <el-tag :type="RESOLVE_REASON_MAP[task.resolutionStatus]?.tagType || 'info'" size="small">
                    {{ RESOLVE_REASON_MAP[task.resolutionStatus]?.label || '未知' }}
                  </el-tag>
                </div>
                <div v-if="task.resolutionCause" class="resolution-row">
                  <span class="resolution-label">缺陷原因</span>
                  <span class="resolution-value">{{ task.resolutionCause }}</span>
                </div>
                <div v-if="task.resolutionSolution" class="resolution-row">
                  <span class="resolution-label">解决方案</span>
                  <div class="resolution-md">
                    <MarkdownEditor :read-only="true" :model-value="task.resolutionSolution" />
                  </div>
                </div>
                <div v-if="task.fixVersionIds?.length" class="resolution-row">
                  <span class="resolution-label">修复版本</span>
                  <div class="resolution-versions">
                    <el-tag v-for="vid in task.fixVersionIds" :key="vid" size="small" class="version-tag">
                      {{ versionMap[vid] || vid }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div class="section-divider" />
          </template>

          <!-- 附件 -->
          <div class="detail-section">
            <div class="section-title">
              <span>附件</span>
              <div class="section-title-actions">
                <AttachmentUpload
                  :task-id="task.id"
                  v-model="attachments"
                />
              </div>
            </div>
            <div v-if="attachments.length === 0" class="hf-empty-text section-body">暂无附件</div>
            <div v-else class="section-body">
              <!-- 图片附件预览 -->
              <div v-if="imageAttachments.length" class="attachment-images">
                <div v-for="file in imageAttachments" :key="file.id" class="attachment-image-item"
                     @click="previewImage(file)">
                  <img :src="imageBlobUrls[file.id]" :alt="file.fileName" class="attachment-thumb" />
                  <span class="attachment-image-name">{{ file.fileName }}</span>
                </div>
              </div>
              <!-- 非图片附件列表 -->
              <div v-for="file in otherAttachments" :key="file.id" class="attachment-item" @click="openPreview(file)">
                <el-icon class="attachment-icon">
                  <Document />
                </el-icon>
                <span class="attachment-name" :title="file.fileName">{{ file.fileName }}</span>
                <span class="attachment-size">{{ formatFileSize(file.fileSize) }}</span>
              </div>
            </div>
          </div>
          <div class="section-divider" />

          <!-- 父任务 -->
          <TaskParentCard :parent-task="parentTask" @go-to-task="goToTask" @add="showAddParent = true"
                          @remove="removeParent" />
          <div class="section-divider" />

          <!-- 子任务 -->
          <TaskSubtaskList :subtasks="subtasks" @add="showAddSubtask = true" @go-to-task="goToTask" />
          <div class="section-divider" />

          <!-- 关联任务 -->
          <TaskRelationList :relations="relations" @add="showAddRelation = true" @remove="removeRelation"
                            @go-to-task="goToTask" />
          <div class="section-divider" />

          <!-- 评论 -->
          <TaskCommentSection :comments="comments" :submitting="submittingComment" @submit="submitComment" />
          <div class="section-divider" />

          <!-- 操作历史 -->
          <TaskActivityTimeline :activities="activities" />
        </template>
      </div>

      <div class="detail-sidebar">
        <TaskInfoSidebar :task="task" />
        <el-button
          v-if="canResolve"
          type="primary"
          class="resolve-btn"
          @click="showResolveDialog = true"
        >
          解决缺陷
        </el-button>
      </div>
    </div>
    <div v-else class="hf-empty-text">任务不存在或已被删除</div>

    <!-- 创建子任务弹窗 -->
    <CreateTaskDialog
      v-model="showAddSubtask"
      :project-id="task?.projectId"
      :parent-task-id="task?.id"
      :parent-task="task"
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
    <!-- 缺陷解决弹窗 -->
    <ResolveDefectDialog
      v-model="showResolveDialog"
      :project-id="task?.projectId"
      @confirm="onDefectResolved"
    />
    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="[previewImageUrl]"
      @close="showImageViewer = false"
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
import { downloadAttachment, getAttachments, previewAttachment } from '@/api/attachment'
import { getVersionList } from '@/api/version'
import { PROJECT_STATUS, RESOLVE_REASON_MAP, TASK_STATUS, TASK_TYPE } from '@/utils/constants'
import { ElImageViewer, ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import MarkdownEditor from '@/components/common/MarkdownEditor.vue'
import AttachmentUpload from '@/components/common/AttachmentUpload.vue'
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
import ResolveDefectDialog from '@/components/issue/ResolveDefectDialog.vue'

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
const attachments = ref([])
const showImageViewer = ref(false)
const previewImageUrl = ref('')
// 图片附件的 blob URL 缓存（id → objectUrl），用于 img src
const imageBlobUrls = ref({})
// 版本 ID→名称映射（用于解决信息中修复版本显示）
const versionMap = ref({})

// 图片扩展名
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']

const imageAttachments = computed(() =>
  attachments.value.filter(f => isImageFile(f))
)
const otherAttachments = computed(() =>
  attachments.value.filter(f => !isImageFile(f))
)

function isImageFile(file) {
  if (file.contentType?.startsWith('image/')) return true
  return IMAGE_EXTS.includes(getFileExt(file.fileName))
}

function getFileExt(name) {
  if (!name) return ''
  const dot = name.lastIndexOf('.')
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase()
}

// 通过 axios 请求预览接口（token 在 header 中），返回 blob Object URL
async function fetchPreviewBlobUrl(file) {
  try {
    const res = await previewAttachment(file.id)
    const blob = new Blob([res], { type: file.contentType || undefined })
    return URL.createObjectURL(blob)
  } catch {
    return ''
  }
}

// 图片点击：加载 blob 后用 el-image-viewer 放大
async function previewImage(file) {
  let url = imageBlobUrls.value[file.id]
  if (!url) {
    url = await fetchPreviewBlobUrl(file)
    if (!url) return
    imageBlobUrls.value[file.id] = url
  }
  previewImageUrl.value = url
  showImageViewer.value = true
}

// 非图片点击：加载 blob 后新窗口打开（PDF/文本/视频等由浏览器原生渲染）
async function openPreview(file) {
  let url = await fetchPreviewBlobUrl(file)
  if (url) window.open(url, '_blank')
}

const projectArchived = computed(() => projectStatus.value === PROJECT_STATUS.ARCHIVED)
// 是否为缺陷（缺陷可触发解决流程）
const isBug = computed(() => task.value?.type === TASK_TYPE.BUG)
// 缺陷是否已有解决信息
const hasResolution = computed(() => task.value?.resolutionStatus != null)
// 缺陷是否可解决（开发中状态，开发工程师可填写解决信息）
const canResolve = computed(() => {
  return isBug.value && task.value?.status === TASK_STATUS.IN_PROGRESS
})
const showResolveDialog = ref(false)

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

async function handleTransition(targetStatus, successMsg, extra = {}) {
  try {
    await transitionTask(task.value.id, targetStatus, extra)
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
  // 缺陷类型：开发完成时由开发工程师填入解决信息
  if (isBug.value) {
    showResolveDialog.value = true
  } else {
    handleTransition(TASK_STATUS.IN_REVIEW, '开发已完成')
  }
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

async function onDefectResolved(resolutionData) {
  // 缺陷开发完成：附带解决信息流转到待审查
  await handleTransition(TASK_STATUS.IN_REVIEW, '开发已完成', resolutionData)
  loadActivities()
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
  // 缺陷有修复版本时加载版本名称映射
  if (task.value.projectId && task.value.fixVersionIds?.length) {
    loadVersionMap(task.value.projectId)
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

async function loadVersionMap(projectId) {
  try {
    const res = await getVersionList({ projectId })
    const versions = res.data || []
    versionMap.value = {}
    for (const v of versions) {
      versionMap.value[v.id] = v.name
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

async function loadAttachments() {
  try {
    const res = await getAttachments(route.params.taskId)
    attachments.value = res.data || []
    // 预加载图片附件的 blob URL（用于缩略图显示）
    for (const file of imageAttachments.value) {
      if (!imageBlobUrls.value[file.id]) {
        const url = await fetchPreviewBlobUrl(file)
        if (url) imageBlobUrls.value[file.id] = url
      }
    }
  } catch {
    // 忽略
  }
}

async function downloadFile(file) {
  try {
    const res = await downloadAttachment(file.id)
    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.href = url
    link.download = file.fileName || 'attachment'
    link.click()
    window.URL.revokeObjectURL(url)
  } catch {
    ElMessage.error('下载失败')
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
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
      loadAttachments(),
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
  padding: 0;
}

.loading-placeholder {
  min-height: 400px;
}

.detail-content {
  display: flex;
  gap: 16px;
}

/* 主内容面板：整体白色卡片 */
.detail-main-panel {
  flex: 1;
  min-width: 0;
  background: var(--hf-bg-card);
  border: 1px solid var(--hf-border);
  border-radius: var(--hf-radius-md);
  padding: 0 20px;
}

/* 描述区域 */
.detail-section {
  padding: 16px 0;
}

/* 分区分隔线 */
.section-divider {
  border-bottom: 1px solid var(--hf-border);
}

.detail-sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resolve-btn {
  width: 100%;
}

/* 附件列表 */
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--hf-text-primary);
}

.section-title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-body {
  padding-bottom: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--hf-radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.attachment-item:hover {
  background: var(--hf-bg-page);
}

.attachment-icon {
  color: var(--hf-text-secondary);
  flex-shrink: 0;
}

.attachment-name {
  flex: 1;
  font-size: 13px;
  color: var(--hf-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-name:hover {
  text-decoration: underline;
}

.attachment-size {
  font-size: 12px;
  color: var(--hf-text-secondary);
  flex-shrink: 0;
}

/* 图片预览网格 */
.attachment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.attachment-image-item {
  width: 120px;
  cursor: pointer;
  text-align: center;
}

.attachment-thumb {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--hf-radius-sm);
  border: 1px solid var(--hf-border);
  transition: border-color 0.2s;
}

.attachment-thumb:hover {
  border-color: var(--hf-primary);
}

.attachment-image-name {
  display: block;
  font-size: 12px;
  color: var(--hf-text-secondary);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .detail-content {
    flex-direction: column;
  }

  .detail-sidebar {
    width: 100%;
  }
}

/* 解决信息区域 */
.resolution-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resolution-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.resolution-label {
  flex-shrink: 0;
  width: 70px;
  font-size: 13px;
  color: var(--hf-text-secondary);
  line-height: 24px;
}

.resolution-value {
  font-size: 14px;
  color: var(--hf-text-primary);
  line-height: 24px;
}

.resolution-md {
  flex: 1;
  min-width: 0;
}

.resolution-versions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.version-tag {
  margin: 0;
}
</style>
