<template>
  <el-dialog
    v-model="visible"
    :width="width"
    :show-close="false"
    align-center
    class="hf-confirm-dialog"
    @close="handleClose"
  >
    <div class="hf-confirm-dialog__body">
      <div :class="['hf-confirm-dialog__icon', `hf-confirm-dialog__icon--${type}`]">
        <el-icon :size="24">
          <WarningFilled v-if="type === 'warning'" />
          <CircleCloseFilled v-else-if="type === 'danger'" />
          <QuestionFilled v-else />
        </el-icon>
      </div>
      <div class="hf-confirm-dialog__content">
        <div v-if="title" class="hf-confirm-dialog__title">{{ title }}</div>
        <div class="hf-confirm-dialog__message">{{ message }}</div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button :type="confirmType" :loading="loading" @click="handleConfirm">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { CircleCloseFilled, QuestionFilled, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  type: { type: String, default: 'warning' }, // warning | danger | info
  confirmText: { type: String, default: '确定' },
  width: { type: String, default: '400px' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const confirmType = computed(() => {
  if (props.type === 'danger') return 'danger'
  return 'primary'
})

function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  visible.value = false
  emit('cancel')
}
</script>

<style scoped>
.hf-confirm-dialog__body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
}

.hf-confirm-dialog__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.hf-confirm-dialog__icon--warning {
  background: var(--hf-warning-bg);
  color: var(--hf-warning);
}

.hf-confirm-dialog__icon--danger {
  background: var(--hf-danger-bg);
  color: var(--hf-danger);
}

.hf-confirm-dialog__icon--info {
  background: var(--hf-primary-bg);
  color: var(--hf-primary);
}

.hf-confirm-dialog__content {
  flex: 1;
  min-width: 0;
}

.hf-confirm-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--hf-text-primary);
  margin-bottom: 8px;
}

.hf-confirm-dialog__message {
  font-size: 14px;
  color: var(--hf-text-regular);
  line-height: 1.5;
}
</style>
