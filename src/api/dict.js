import request from '@/utils/request'

// 字典类型列表
export function getDictTypeList(params) {
  return request.get('/dict-types', { params })
}

// 创建字典类型
export function createDictType(data) {
  return request.post('/dict-types', data)
}

// 更新字典类型
export function updateDictType(id, data) {
  return request.put(`/dict-types/${id}`, data)
}

// 字典数据列表
export function getDictDataList(params) {
  return request.get('/dict-data', { params })
}

// 创建字典数据
export function createDictData(data) {
  return request.post('/dict-data', data)
}

// 更新字典数据
export function updateDictData(id, data) {
  return request.put(`/dict-data/${id}`, data)
}
