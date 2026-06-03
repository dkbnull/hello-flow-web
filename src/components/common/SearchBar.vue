<template>
  <div class="search-bar">
    <el-form :inline="true" :model="searchValues" class="search-form" @submit.prevent="handleSearch">
      <template v-for="item in options" :key="item.prop">
        <!-- 输入框 -->
        <el-form-item v-if="item.type === 'input'" :label="item.label">
          <el-input
            v-model="searchValues[item.prop]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </el-form-item>

        <!-- 下拉选择 -->
        <el-form-item v-else-if="item.type === 'select'" :label="item.label">
          <el-select
            v-model="searchValues[item.prop]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            clearable
            style="width: 200px"
            @change="handleSearch"
          >
            <el-option
              v-for="opt in item.options || []"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <!-- 日期选择 -->
        <el-form-item v-else-if="item.type === 'date'" :label="item.label">
          <el-date-picker
            v-model="searchValues[item.prop]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :value-format="item.valueFormat || 'YYYY-MM-DD'"
            clearable
            @change="handleSearch"
          />
        </el-form-item>

        <!-- 日期范围 -->
        <el-form-item v-else-if="item.type === 'daterange'" :label="item.label">
          <el-date-picker
            v-model="searchValues[item.prop]"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :value-format="item.valueFormat || 'YYYY-MM-DD'"
            clearable
            @change="handleSearch"
          />
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
// 配置化搜索栏组件，通过 options 配置搜索项
import { reactive, watch } from 'vue'

const props = defineProps({
  // 搜索项配置
  options: {
    type: Array,
    default: () => []
  },
  // 外部传入的搜索值（v-model）
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

// 初始化搜索值
const searchValues = reactive({})

// 根据 options 初始化默认值
function initDefaults() {
  for (const item of props.options) {
    if (!(item.prop in searchValues)) {
      searchValues[item.prop] = item.defaultValue ?? null
    }
  }
}

initDefaults()

// 同步外部传入的值
watch(() => props.modelValue, (val) => {
  if (val) {
    Object.keys(val).forEach(key => {
      searchValues[key] = val[key]
    })
  }
}, { immediate: true, deep: true })

// 同步内部值到外部
watch(searchValues, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })

function handleSearch() {
  emit('search', { ...searchValues })
}

function handleReset() {
  for (const item of props.options) {
    searchValues[item.prop] = item.defaultValue ?? null
  }
  emit('reset')
  emit('search', { ...searchValues })
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 8px;
  margin-right: 16px;
}
</style>
