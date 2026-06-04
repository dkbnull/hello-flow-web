<template>
  <el-dialog v-model="visible" title="添加成员" width="400px" align-center>
    <el-select v-model="selectedUserId" placeholder="请选择用户" filterable style="width: 100%">
      <el-option
        v-for="user in availableUsers"
        :key="user.id"
        :label="`${user.nickname || user.username} (${user.positionName || ''})`"
        :value="user.id"
      />
    </el-select>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="adding" @click="handleAdd">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { addProjectMember } from '@/api/project'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  projectId: { type: [String, Number], default: null },
  members: { type: Array, default: () => [] },
  allUsers: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedUserId = ref(null)
const adding = ref(false)

const availableUsers = computed(() => {
  const memberIds = props.members.map(m => m.userId)
  return props.allUsers.filter(u => !memberIds.includes(u.id))
})

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedUserId.value = null
  }
})

async function handleAdd() {
  if (!selectedUserId.value) {
    ElMessage.warning('请选择用户')
    return
  }
  adding.value = true
  try {
    await addProjectMember(props.projectId, selectedUserId.value)
    ElMessage.success('添加成功')
    visible.value = false
    emit('saved')
  } catch {
    // 错误已在拦截器中处理
  } finally {
    adding.value = false
  }
}
</script>
