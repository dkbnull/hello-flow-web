<template>
  <div class="link-issue-picker">
    <div class="picker-input">
      <el-select v-model="currentRelationType" placeholder="链接类型" class="relation-select">
        <el-option
          v-for="(label, key) in RELATION_TYPE_MAP"
          :key="key"
          :label="label"
          :value="Number(key)"
        />
      </el-select>
      <el-select
        v-model="searchKeyword"
        filterable
        remote
        clearable
        reserve-keyword
        placeholder="搜索任务标题/编码"
        class="task-select"
        :remote-method="searchTasks"
        :loading="searching"
        @change="handleSelect"
        @focus="loadOnFocus"
      >
        <el-option
          v-for="t in searchResults"
          :key="t.id"
          :label="`${t.projectCode || 'TASK'}-${t.id} ${t.title}`"
          :value="t.id"
        />
      </el-select>
      <el-button :disabled="!selectedTaskId || !currentRelationType" @click="addLink">添加</el-button>
    </div>

    <ul v-if="modelValue.length" class="link-list">
      <li v-for="(item, idx) in modelValue" :key="idx" class="link-item">
        <el-tag size="small" type="info" effect="plain">{{ RELATION_TYPE_MAP[item.relationType] }}</el-tag>
        <span class="link-title" :title="item.taskTitle">{{ item.taskTitle || `TASK-${item.taskId}` }}</span>
        <el-icon class="link-remove" @click="removeLink(idx)">
          <Close />
        </el-icon>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { getTaskList } from '@/api/task'
import { RELATION_TYPE_MAP } from '@/utils/constants'

// 链接问题选择器：选择任务并指定链接类型（关联/依赖/重复）
const props = defineProps({
  // 已链接列表，v-model 绑定：[{ taskId, taskTitle, relationType }]
  modelValue: { type: Array, default: () => [] },
  projectId: { type: [String, Number], default: null },
  // 排除的任务 ID（如自身）
  excludeIds: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const searchKeyword = ref('')
const selectedTaskId = ref(null)
const currentRelationType = ref(1)
const searchResults = ref([])
const searching = ref(false)

async function searchTasks(query) {
  searching.value = true
  try {
    const params = { page: 1, pageSize: 20 }
    if (query) params.keyword = query
    if (props.projectId) params.projectId = props.projectId
    const res = await getTaskList(params)
    searchResults.value = (res.data.records || []).filter(t => !props.excludeIds.includes(t.id))
  } catch {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// 首次聚焦时预加载任务列表
let loaded = false

function loadOnFocus() {
  if (!loaded) {
    loaded = true
    searchTasks('')
  }
}

function handleSelect(taskId) {
  selectedTaskId.value = taskId
}

function addLink() {
  if (!selectedTaskId.value || !currentRelationType.value) return
  // 防止重复链接同一任务
  if (props.modelValue.some(item => item.taskId === selectedTaskId.value)) return
  const task = searchResults.value.find(t => t.id === selectedTaskId.value)
  emit('update:modelValue', [
    ...props.modelValue,
    {
      taskId: selectedTaskId.value,
      taskTitle: task?.title,
      relationType: currentRelationType.value
    }
  ])
  selectedTaskId.value = null
  searchKeyword.value = ''
  searchResults.value = []
}

function removeLink(idx) {
  const list = [...props.modelValue]
  list.splice(idx, 1)
  emit('update:modelValue', list)
}
</script>

<style scoped>
.picker-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.task-select {
  flex: 1;
  min-width: 200px;
}

.relation-select {
  width: 100px !important;
  flex-shrink: 0;
  flex-grow: 0;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--hf-radius-sm, 4px);
  transition: background 0.2s;
}

.link-item:hover {
  background: var(--hf-bg-page, #f5f7fa);
}

.link-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.link-remove {
  cursor: pointer;
  color: var(--hf-text-secondary, #909399);
  flex-shrink: 0;
}

.link-remove:hover {
  color: var(--hf-danger, #f56c6c);
}
</style>
