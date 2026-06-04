<template>
  <el-dialog v-model="visible" title="保存过滤器" width="400px" align-center>
    <el-form @submit.prevent="handleSave">
      <el-form-item label="过滤器名称">
        <el-input v-model="filterName" placeholder="输入过滤器名称" maxlength="20" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filterName = ref('')

watch(() => props.modelValue, (val) => {
  if (val) {
    filterName.value = ''
  }
})

function handleSave() {
  if (!filterName.value.trim()) return
  emit('save', filterName.value.trim())
  visible.value = false
}
</script>
