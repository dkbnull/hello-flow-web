<template>
  <div class="markdown-editor-wrapper" :class="{ 'is-readonly': readOnly }">
    <MdEditor
      v-if="!readOnly"
      v-model="model"
      language="zh-CN"
      theme="light"
      previewTheme="github"
      :toolbarsExclude="excludedToolbars"
      :style="{ height }"
      :placeholder="placeholder"
      :preview="showPreview"
      noUploadImg
      noKatex
      noMermaid
      noPrettier
      showCodeRowNumber
    />
    <MdPreview v-else :modelValue="model" theme="light" previewTheme="github" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

// Markdown 富文本编辑器，支持编辑与只读预览两种模式
defineProps({
  // 是否只读预览
  readOnly: { type: Boolean, default: false },
  // 编辑器高度
  height: { type: String, default: '320px' },
  // 占位提示
  placeholder: { type: String, default: '请输入内容，支持 Markdown 语法' }
})

// 双向绑定 markdown 文本
const model = defineModel({ type: String, default: '' })

// 默认仅编辑模式，用户可通过工具栏预览按钮切换
const showPreview = ref(false)

// 排除的工具栏项，减少干扰
const excludedToolbars = ['github', 'save', 'pageFullscreen', 'catalog', 'htmlPreview', 'mark']
</script>

<style scoped>
.markdown-editor-wrapper {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.markdown-editor-wrapper :deep(.md-editor) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border-radius: var(--hf-radius-sm, 6px);
  overflow: hidden;
  border: 1px solid var(--hf-border, #dcdfe6);
}

/* ===== 只读预览模式样式覆盖 ===== */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview) {
  border: none;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
  padding: 0;
  color: var(--hf-text-regular, #475569);
  background: transparent;
}

/* 标题 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview h1) {
  font-size: 22px;
  margin: 20px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--hf-border-light, #f1f5f9);
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview h2) {
  font-size: 18px;
  margin: 18px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--hf-border-light, #f1f5f9);
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview h3) {
  font-size: 16px;
  margin: 14px 0 6px;
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview h4) {
  font-size: 15px;
  margin: 12px 0 6px;
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview h5),
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview h6) {
  font-size: 14px;
  margin: 10px 0 4px;
}

/* 段落 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview p) {
  margin: 0 0 10px;
  line-height: 1.7;
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview p:last-child) {
  margin-bottom: 0;
}

/* 引用块 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview blockquote) {
  margin: 10px 0;
  padding: 8px 16px;
  border-left: 3px solid var(--hf-primary, #2563eb);
  background: var(--hf-bg-page, #f8fafc);
  border-radius: 0 var(--hf-radius-sm, 4px) var(--hf-radius-sm, 4px) 0;
  color: var(--hf-text-secondary, #64748b);
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview blockquote p) {
  margin: 0;
}

/* 代码 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview code) {
  font-size: 13px;
  padding: 2px 6px;
  background: var(--hf-bg-page, #f8fafc);
  border: 1px solid var(--hf-border-light, #e2e8f0);
  border-radius: 3px;
  color: #e83e8c;
}

/* 代码块 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview pre) {
  margin: 10px 0;
  padding: 12px 16px;
  background: var(--hf-bg-page, #f8fafc);
  border: 1px solid var(--hf-border-light, #e2e8f0);
  border-radius: var(--hf-radius-sm, 6px);
  overflow-x: auto;
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview pre code) {
  padding: 0;
  background: transparent;
  border: none;
  color: var(--hf-text-regular, #475569);
  font-size: 13px;
  line-height: 1.5;
}

/* 列表 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview ul),
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview li) {
  margin: 4px 0;
  line-height: 1.7;
}

/* 表格 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview table) {
  width: 100%;
  margin: 10px 0;
  border-collapse: collapse;
  font-size: 13px;
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview th) {
  padding: 8px 12px;
  background: var(--hf-bg-page, #f8fafc);
  border: 1px solid var(--hf-border, #e2e8f0);
  font-weight: 600;
  text-align: left;
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview td) {
  padding: 8px 12px;
  border: 1px solid var(--hf-border, #e2e8f0);
}

/* 图片 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview img) {
  max-width: 100%;
  border-radius: var(--hf-radius-sm, 6px);
  margin: 8px 0;
}

/* 水平线 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview hr) {
  border: none;
  border-top: 1px solid var(--hf-border-light, #e2e8f0);
  margin: 16px 0;
}

/* 编辑模式预览区代码块浅色覆盖 */
.markdown-editor-wrapper :deep(.md-editor-preview pre) {
  background: var(--hf-bg-page, #f8fafc) !important;
  border: 1px solid var(--hf-border-light, #e2e8f0) !important;
}

.markdown-editor-wrapper :deep(.md-editor-preview pre code) {
  color: var(--hf-text-regular, #475569) !important;
}

/* 链接 */
.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview a) {
  color: var(--hf-primary, #2563eb);
  text-decoration: none;
}

.markdown-editor-wrapper.is-readonly :deep(.md-editor-preview a:hover) {
  text-decoration: underline;
}
</style>
