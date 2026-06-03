<template>
  <div class="page-header">
    <el-button @click="$emit('go-back')" :icon="ArrowLeft" size="default" text />
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
      <div class="header-actions">
        <!-- 归档项目：禁止所有写操作 -->
        <template v-if="!projectArchived">
          <!-- 状态操作按钮：按职位权限控制 -->
          <template v-if="!editing">
            <!-- 开始任务：PM、管理员、或任务分配的开发 -->
            <el-button v-if="canStartTask" type="primary" size="default" @click="$emit('start-task')">
              开始任务
            </el-button>
            <!-- 完成开发：DEV（且自己是任务开发）、管理员 -->
            <el-button v-if="canCompleteDev" type="success" size="default" @click="$emit('complete-dev')">
              完成开发
            </el-button>
            <!-- 代码审查通过/驳回：DEV（不能审查自己的任务）、管理员 -->
            <template v-if="canCodeReview && task.status === TASK_STATUS.IN_REVIEW">
              <el-button type="success" size="default" @click="$emit('review-pass')">审查通过</el-button>
              <el-button type="warning" size="default" @click="$emit('review-reject')">审查驳回</el-button>
            </template>
            <!-- 测试通过/驳回：QA、管理员 -->
            <template v-if="canTest && task.status === TASK_STATUS.IN_TEST">
              <el-button type="success" size="default" @click="$emit('test-pass')">测试通过</el-button>
              <el-button type="warning" size="default" @click="$emit('test-reject')">测试驳回</el-button>
            </template>
            <!-- 关闭任务：PM、管理员 -->
            <el-button v-if="canCloseTask && task.status === TASK_STATUS.DONE" size="default"
                       @click="$emit('close-task')">
              关闭任务
            </el-button>
            <!-- 重新打开：PM、管理员 -->
            <el-button
              v-if="canReopenTask && [TASK_STATUS.DONE, TASK_STATUS.CLOSED].includes(task.status)"
              size="default"
              @click="$emit('reopen-task')"
            >
              重新打开
            </el-button>
            <el-button type="primary" size="default" @click="$emit('start-edit')">编辑</el-button>
          </template>
          <template v-else>
            <el-button size="default" @click="$emit('cancel-edit')">取消</el-button>
            <el-button type="primary" size="default" :loading="saving" @click="$emit('save')">保存</el-button>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { POSITION_CODE, TASK_STATUS, TASK_STATUS_MAP, TASK_TYPE_MAP } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  task: { type: Object, default: null },
  taskNo: { type: String, default: '' },
  editing: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  projectArchived: { type: Boolean, default: false }
})

defineEmits([
  'go-back', 'start-edit', 'cancel-edit', 'save',
  'start-task', 'complete-dev', 'review-pass', 'review-reject',
  'test-pass', 'test-reject', 'close-task', 'reopen-task'
])

const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.roles?.includes('ADMIN') || false)
const positionCode = computed(() => authStore.user?.positionCode || '')
const currentUserId = computed(() => authStore.user?.id)

const isPM = computed(() => positionCode.value === POSITION_CODE.PM)
const isDev = computed(() => positionCode.value === POSITION_CODE.DEV)
const isQA = computed(() => positionCode.value === POSITION_CODE.QA)

// 是否是任务的开发人员
const isTaskDeveloper = computed(() => {
  return props.task?.developerId && currentUserId.value === props.task.developerId
})

// 开始任务：PM、管理员、或被分配的开发
const canStartTask = computed(() => {
  if (props.task?.status !== TASK_STATUS.TODO) return false
  return isAdmin.value || isPM.value || isTaskDeveloper.value
})

// 完成开发：开发人员（且自己是任务开发）、管理员
const canCompleteDev = computed(() => {
  if (props.task?.status !== TASK_STATUS.IN_PROGRESS) return false
  return isAdmin.value || isTaskDeveloper.value
})

// 代码审查：DEV（不能审查自己的任务）、管理员
const canCodeReview = computed(() => {
  if (!isDev.value && !isAdmin.value) return false
  if (isTaskDeveloper.value) return false
  return true
})

// 测试：QA、管理员
const canTest = computed(() => isAdmin.value || isQA.value)

// 关闭任务：PM、管理员
const canCloseTask = computed(() => isAdmin.value || isPM.value)

// 重新打开：PM、管理员
const canReopenTask = computed(() => isAdmin.value || isPM.value)
</script>

<style scoped>
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
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
