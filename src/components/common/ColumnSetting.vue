<template>
  <el-dialog
    v-model="visible"
    title="列设置"
    width="380px"
    align-center
    :close-on-click-modal="false"
  >
    <div class="column-setting">
      <div class="setting-actions">
        <el-button link type="primary" @click="selectAll">全选</el-button>
        <el-button link @click="resetDefault">恢复默认</el-button>
      </div>
      <el-checkbox-group v-model="localSelected" class="column-group">
        <div v-for="col in columns" :key="col.prop" class="column-item">
          <el-checkbox :value="col.prop" :label="col.label" />
        </div>
      </el-checkbox-group>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// 列设置弹窗：勾选需要显示的列，确认后回传选中的列 prop 数组
const props = defineProps({
  modelValue: Boolean,
  // 所有可选列：[{ prop, label }]
  columns: { type: Array, default: () => [] },
  // 当前已选中的列 prop 数组
  selected: { type: Array, default: () => [] },
  // 恢复默认时使用的列 prop 数组
  defaultColumns: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
// 内部编辑态，避免直接修改父组件数据
const localSelected = ref([])

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    localSelected.value = [...props.selected]
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function selectAll() {
  localSelected.value = props.columns.map(c => c.prop)
}

function resetDefault() {
  localSelected.value = props.defaultColumns.length ? [...props.defaultColumns] : props.columns.map(c => c.prop)
}

function handleConfirm() {
  emit('confirm', [...localSelected.value])
  visible.value = false
}
</script>

<style scoped>
.setting-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.column-group {
  display: flex;
  flex-direction: column;
}

.column-item {
  padding: 6px 0;
}
</style>
