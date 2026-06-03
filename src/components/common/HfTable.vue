<template>
  <div class="hf-table">
    <el-table v-bind="$attrs" :data="data" stripe @row-click="handleRowClick">
      <template v-for="col in columns" :key="col.prop">
        <!-- 序号列 -->
        <el-table-column
          v-if="col.type === 'index'"
          type="index"
          :label="col.label || '序号'"
          :width="col.width || 60"
          :fixed="col.fixed"
        />

        <!-- 选择列 -->
        <el-table-column
          v-else-if="col.type === 'selection'"
          type="selection"
          :width="col.width || 50"
          :fixed="col.fixed"
        />

        <!-- 操作列 -->
        <el-table-column
          v-else-if="col.prop === 'operator'"
          :label="col.label || '操作'"
          :width="col.width || 170"
          :fixed="col.fixed || 'right'"
        >
          <template #default="{ row, $index }">
            <el-button
              v-if="col.view !== false"
              link type="primary" size="small"
              @click="handleAction('view', row, $index)"
            >
              查看
            </el-button>
            <el-button
              v-if="col.edit !== false"
              link type="primary" size="small"
              @click="handleAction('edit', row, $index)"
            >
              编辑
            </el-button>
            <el-button
              v-if="col.delete"
              link type="danger" size="small"
              @click="handleAction('delete', row, $index)"
            >
              删除
            </el-button>
            <!-- 自定义操作按钮 -->
            <template v-if="col.actions">
              <el-button
                v-for="(action, idx) in col.actions"
                :key="idx"
                link
                :type="action.type || 'primary'"
                size="small"
                @click="action.handler ? action.handler(row, $index) : handleAction(action.action, row, $index)"
              >
                {{ action.label }}
              </el-button>
            </template>
            <!-- 插槽：自定义操作内容 -->
            <slot name="operator" :row="row" :index="$index" />
          </template>
        </el-table-column>

        <!-- 状态列：自动渲染 el-tag -->
        <el-table-column
          v-else-if="col.type === 'status'"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row[col.prop], col.statusMap)"
              size="small"
            >
              {{ getStatusLabel(row[col.prop], col.statusMap) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 自定义渲染列 -->
        <el-table-column
          v-else-if="col.slot"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :show-overflow-tooltip="col.showOverflowTooltip"
        >
          <template #default="{ row, $index }">
            <slot :name="col.slot" :row="row" :index="$index" />
          </template>
        </el-table-column>

        <!-- 普通文本列 -->
        <el-table-column
          v-else
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :show-overflow-tooltip="col.showOverflowTooltip !== false"
        />
      </template>

      <!-- 默认插槽：额外的列 -->
      <slot />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="paginationLayout"
      class="pagination"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
// 配置化表格组件，通过 columns 配置列，自动处理操作列、状态列、分页等
import { computed } from 'vue'

const props = defineProps({
  // 列配置
  columns: {
    type: Array,
    default: () => []
  },
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  // 分页总数
  total: {
    type: Number,
    default: 0
  },
  // 当前页码
  page: {
    type: Number,
    default: 1
  },
  // 每页条数
  pageSize: {
    type: Number,
    default: 20
  },
  // 每页条数选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  // 是否显示分页大小选择
  showSizeChanger: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:page', 'update:pageSize', 'action', 'page-change', 'row-click'])

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

const paginationLayout = computed(() => {
  const parts = ['total']
  if (props.showSizeChanger) parts.push('sizes')
  parts.push('prev', 'pager', 'next')
  return parts.join(', ')
})

function handleAction(action, row, index) {
  emit('action', { action, row, index })
}

function handleRowClick(row, column, event) {
  emit('row-click', row, column, event)
}

function handlePageChange(page) {
  emit('update:page', page)
  emit('page-change')
}

function handleSizeChange(size) {
  emit('update:pageSize', size)
  emit('page-change')
}

// 根据 statusMap 获取状态标签类型
function getStatusTagType(value, statusMap) {
  if (!statusMap) return ''
  return statusMap[value]?.tagType ?? ''
}

// 根据 statusMap 获取状态标签文本
function getStatusLabel(value, statusMap) {
  if (!statusMap) return value
  return statusMap[value]?.label ?? value
}
</script>

<style scoped>
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
