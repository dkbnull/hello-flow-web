<template>
  <div class="dict-manage">
    <el-row :gutter="16">
      <!-- 左侧：字典类型列表 -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>字典类型</span>
              <el-button type="primary" size="default" @click="openTypeDialog()">新增</el-button>
            </div>
          </template>
          <HfTable
            :columns="typeColumns"
            :data="dictTypes"
            :total="typeTotal"
            v-model:page="typePage"
            :page-size="typePageSize"
            :show-size-changer="false"
            @action="handleTypeAction"
            @page-change="loadDictTypes"
            @row-click="handleTypeRowClick"
          />
        </el-card>
      </el-col>

      <!-- 右侧：字典数据列表 -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>字典数据 {{ selectedType ? `- ${selectedType.name}` : '' }}</span>
              <el-button type="primary" size="default" :disabled="!selectedType" @click="openDataDialog()">新增
              </el-button>
            </div>
          </template>
          <div v-if="!selectedType" class="hf-empty-text">请选择左侧字典类型</div>
          <HfTable
            v-else
            :columns="dataColumns"
            :data="dictData"
            :total="0"
            :show-size-changer="false"
            @action="handleDataAction"
          />
        </el-card>
      </el-col>
    </el-row>

    <DictTypeDialog
      v-model="showTypeDialog"
      :edit-data="typeEditData"
      @saved="handleTypeSaved"
    />

    <DictDataDialog
      v-model="showDataDialog"
      :edit-data="dataEditData"
      :type-id="selectedType?.id"
      @saved="handleDataSaved"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getDictDataList, getDictTypeList } from '@/api/dict'
import HfTable from '@/components/common/HfTable.vue'
import DictTypeDialog from '@/components/dict/DictTypeDialog.vue'
import DictDataDialog from '@/components/dict/DictDataDialog.vue'

const dictTypes = ref([])
const dictData = ref([])
const selectedType = ref(null)

const typePage = ref(1)
const typePageSize = 20
const typeTotal = ref(0)

const typeColumns = ref([
  { prop: 'name', label: '名称', minWidth: 100 },
  { prop: 'code', label: '编码', minWidth: 100 },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    type: 'status',
    statusMap: { 1: { label: '启用', tagType: 'success' }, 0: { label: '禁用', tagType: 'danger' } }
  },
  { prop: 'operator', label: '操作', width: 80, view: false, edit: true, delete: false }
])

const dataColumns = ref([
  { prop: 'label', label: '标签', minWidth: 100 },
  { prop: 'value', label: '值', minWidth: 100 },
  { prop: 'sort', label: '排序', width: 80 },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    type: 'status',
    statusMap: { 1: { label: '启用', tagType: 'success' }, 0: { label: '禁用', tagType: 'danger' } }
  },
  { prop: 'operator', label: '操作', width: 80, view: false, edit: true, delete: false }
])

const showTypeDialog = ref(false)
const showDataDialog = ref(false)
const typeEditData = ref(null)
const dataEditData = ref(null)

async function loadDictTypes() {
  try {
    const res = await getDictTypeList({ page: typePage.value, pageSize: typePageSize })
    dictTypes.value = res.data.records || res.data || []
    typeTotal.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

function handleTypeAction({ action, row }) {
  if (action === 'edit') {
    openTypeDialog(row)
  }
}

function handleTypeRowClick(row) {
  selectedType.value = row
  loadDictData(row.id)
}

function handleDataAction({ action, row }) {
  if (action === 'edit') {
    openDataDialog(row)
  }
}

async function loadDictData(typeId) {
  try {
    const res = await getDictDataList({ typeId })
    dictData.value = res.data.records || res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

function openTypeDialog(row) {
  typeEditData.value = row || null
  showTypeDialog.value = true
}

function openDataDialog(row) {
  dataEditData.value = row || null
  showDataDialog.value = true
}

function handleTypeSaved() {
  loadDictTypes()
}

function handleDataSaved() {
  if (selectedType.value) {
    loadDictData(selectedType.value.id)
  }
}

onMounted(() => {
  loadDictTypes()
})
</script>

<style scoped>
.dict-manage {
  padding: 16px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
