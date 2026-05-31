<template>
  <div class="dict-manage">
    <el-row :gutter="16">
      <!-- 左侧：字典类型列表 -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>字典类型</span>
              <el-button type="primary" size="small" @click="openTypeDialog()">新增</el-button>
            </div>
          </template>
          <el-table :data="dictTypes" stripe highlight-current-row @current-change="handleTypeSelect">
            <el-table-column prop="name" label="名称" min-width="100" />
            <el-table-column prop="code" label="编码" min-width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click.stop="openTypeDialog(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="typeTotal > typePageSize"
            v-model:current-page="typePage"
            :page-size="typePageSize"
            :total="typeTotal"
            layout="prev, pager, next"
            class="pagination"
            @current-change="loadDictTypes"
          />
        </el-card>
      </el-col>

      <!-- 右侧：字典数据列表 -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>字典数据 {{ selectedType ? `- ${selectedType.name}` : '' }}</span>
              <el-button type="primary" size="small" :disabled="!selectedType" @click="openDataDialog()">新增
              </el-button>
            </div>
          </template>
          <div v-if="!selectedType" class="empty-text">请选择左侧字典类型</div>
          <el-table v-else :data="dictData" stripe>
            <el-table-column prop="label" label="标签" min-width="100" />
            <el-table-column prop="value" label="值" min-width="100" />
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openDataDialog(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 字典类型对话框 -->
    <el-dialog v-model="showTypeDialog" :title="isTypeEdit ? '编辑字典类型' : '新增字典类型'" width="480px">
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="70px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="typeForm.name" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="typeForm.code" :disabled="isTypeEdit" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="typeForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTypeDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveType">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字典数据对话框 -->
    <el-dialog v-model="showDataDialog" :title="isDataEdit ? '编辑字典数据' : '新增字典数据'" width="480px">
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="70px">
        <el-form-item label="标签" prop="label">
          <el-input v-model="dataForm.label" />
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="dataForm.value" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dataForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDataDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveData">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getDictTypeList, createDictType, updateDictType,
  getDictDataList, createDictData, updateDictData
} from '@/api/dict'
import { ElMessage } from 'element-plus'

const dictTypes = ref([])
const dictData = ref([])
const selectedType = ref(null)

const typePage = ref(1)
const typePageSize = 20
const typeTotal = ref(0)

const showTypeDialog = ref(false)
const showDataDialog = ref(false)
const isTypeEdit = ref(false)
const isDataEdit = ref(false)
const saving = ref(false)
const typeFormRef = ref(null)
const dataFormRef = ref(null)

const typeForm = ref({ id: null, name: '', code: '', remark: '' })
const dataForm = ref({ id: null, typeId: null, label: '', value: '', sort: 0, remark: '' })

const typeRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

const dataRules = {
  label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }]
}

async function loadDictTypes() {
  try {
    const res = await getDictTypeList({ page: typePage.value, pageSize: typePageSize })
    dictTypes.value = res.data.records || res.data || []
    typeTotal.value = res.data.total || 0
  } catch {
    // 错误已在拦截器中处理
  }
}

async function handleTypeSelect(row) {
  selectedType.value = row
  if (row) {
    await loadDictData(row.id)
  }
}

async function loadDictData(typeId) {
  try {
    const res = await getDictDataList(typeId)
    dictData.value = res.data.records || res.data || []
  } catch {
    // 错误已在拦截器中处理
  }
}

function openTypeDialog(row) {
  isTypeEdit.value = !!row
  typeForm.value = row
    ? { id: row.id, name: row.name, code: row.code, remark: row.remark || '' }
    : { id: null, name: '', code: '', remark: '' }
  showTypeDialog.value = true
}

function openDataDialog(row) {
  isDataEdit.value = !!row
  dataForm.value = row
    ? {
      id: row.id,
      typeId: selectedType.value.id,
      label: row.label,
      value: row.value,
      sort: row.sort || 0,
      remark: row.remark || ''
    }
    : { id: null, typeId: selectedType.value.id, label: '', value: '', sort: 0, remark: '' }
  showDataDialog.value = true
}

async function handleSaveType() {
  const valid = await typeFormRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isTypeEdit.value) {
      await updateDictType(typeForm.value.id, typeForm.value)
    } else {
      await createDictType(typeForm.value)
    }
    ElMessage.success('保存成功')
    showTypeDialog.value = false
    await loadDictTypes()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

async function handleSaveData() {
  const valid = await dataFormRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isDataEdit.value) {
      await updateDictData(dataForm.value.id, dataForm.value)
    } else {
      // typeId 在 Body 中
      await createDictData(dataForm.value)
    }
    ElMessage.success('保存成功')
    showDataDialog.value = false
    await loadDictData(selectedType.value.id)
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
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

.empty-text {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
</style>
