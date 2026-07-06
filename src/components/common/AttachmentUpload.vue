<template>
  <div class="attachment-upload">
    <el-upload
      :auto-upload="false"
      :show-file-list="false"
      :multiple="true"
      :accept="accept"
      :on-change="handleFileChange"
    >
      <el-button :icon="UploadFilled">添加附件</el-button>
      <template #tip>
        <span class="upload-tip">最多 {{ max }} 个，单个不超过 {{ maxSize }}MB</span>
      </template>
    </el-upload>

    <ul v-if="fileList.length" class="file-list">
      <li v-for="file in fileList" :key="file.uid" class="file-item">
        <el-icon class="file-icon">
          <Document />
        </el-icon>
        <span class="file-name" :title="file.name">{{ file.name }}</span>
        <span class="file-size">{{ formatSize(file.size) }}</span>
        <el-icon class="file-remove" @click="removeFile(file)">
          <Close />
        </el-icon>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Document, UploadFilled } from '@element-plus/icons-vue'
import { deleteAttachment, uploadAttachment } from '@/api/attachment'

const props = defineProps({
  // 已有任务 ID：存在时选择文件后立即上传到后端
  taskId: { type: [String, Number], default: null },
  // 已上传附件列表（用于回显与删除），v-model 绑定
  modelValue: { type: Array, default: () => [] },
  max: { type: Number, default: 10 },
  maxSize: { type: Number, default: 20 },
  accept: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'pending-change'])

// 暂存待上传文件（新建场景下任务尚未创建）
const pendingFiles = ref([])

// 合并展示已上传与待上传文件
const fileList = computed(() => {
  const uploaded = props.modelValue.map(a => ({
    uid: `uploaded-${a.id}`,
    id: a.id,
    taskId: a.taskId,
    name: a.fileName,
    size: a.fileSize,
    status: 'uploaded'
  }))
  const pending = pendingFiles.value.map(f => ({
    uid: f.uid,
    name: f.name,
    size: f.size,
    status: 'pending'
  }))
  return [...uploaded, ...pending]
})

async function handleFileChange(file) {
  if (!file || !file.raw) return
  const total = props.modelValue.length + pendingFiles.value.length
  if (total >= props.max) {
    ElMessage.warning(`最多上传 ${props.max} 个附件`)
    return
  }
  if (file.size > props.maxSize * 1024 * 1024) {
    ElMessage.warning(`文件 ${file.name} 超过 ${props.maxSize}MB 限制`)
    return
  }
  // 立即上传模式（已有任务）
  if (props.taskId) {
    try {
      const res = await uploadAttachment(props.taskId, file.raw)
      emit('update:modelValue', [...props.modelValue, res.data])
    } catch {
      // 错误已在拦截器处理
    }
    return
  }
  // 暂存模式（新建场景）
  pendingFiles.value.push({ uid: file.uid, name: file.name, size: file.size, raw: file.raw })
  emit('pending-change', pendingFiles.value)
}

async function removeFile(file) {
  if (file.status === 'uploaded') {
    try {
      await deleteAttachment(file.id)
      emit('update:modelValue', props.modelValue.filter(a => a.id !== file.id))
    } catch {
      // 错误已在拦截器处理
    }
    return
  }
  pendingFiles.value = pendingFiles.value.filter(f => f.uid !== file.uid)
  emit('pending-change', pendingFiles.value)
}

function formatSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// 暴露暂存文件与清理方法，供父组件在提交后上传
defineExpose({
  getPendingFiles: () => pendingFiles.value.map(f => f.raw),
  clearPending: () => {
    pendingFiles.value = []
    emit('pending-change', pendingFiles.value)
  }
})
</script>

<style scoped>
.upload-tip {
  margin-left: 8px;
  font-size: 12px;
  color: var(--hf-text-secondary, #909399);
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--hf-radius-sm, 4px);
  transition: background 0.2s;
}

.file-item:hover {
  background: var(--hf-bg-page, #f5f7fa);
}

.file-icon {
  color: var(--hf-text-secondary, #909399);
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.file-size {
  font-size: 12px;
  color: var(--hf-text-secondary, #909399);
  flex-shrink: 0;
}

.file-remove {
  cursor: pointer;
  color: var(--hf-text-secondary, #909399);
  flex-shrink: 0;
}

.file-remove:hover {
  color: var(--hf-danger, #f56c6c);
}
</style>
