<template>
  <div class="detail-section">
    <div class="section-title">
      <span>评论</span>
    </div>
    <div class="section-body">
      <div class="comment-input">
        <el-input v-model="content" type="textarea" :rows="2" placeholder="输入评论..." />
        <div class="comment-submit">
          <el-button type="primary" size="default" :loading="submitting" @click="handleSubmit">发表评论</el-button>
        </div>
      </div>
      <div v-if="comments.length === 0" class="hf-empty-text">暂无评论</div>
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <el-avatar :size="28" :src="comment.avatar">{{ comment.nickname?.charAt(0) }}</el-avatar>
          <span class="comment-author">{{ comment.nickname || comment.username }}</span>
          <span class="comment-time">{{ comment.createdAt }}</span>
        </div>
        <div class="comment-content" v-html="comment.content"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['submit'])

const content = ref('')

async function handleSubmit() {
  if (!content.value?.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  emit('submit', content.value)
  content.value = ''
}
</script>

<style scoped>
.detail-section {
  padding: 0;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--hf-text-primary);
}

.section-body {
  padding-bottom: 12px;
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
</style>
