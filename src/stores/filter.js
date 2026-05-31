import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createFilter, deleteFilter, getFilterList, updateFilter } from '@/api/filter'

export const useFilterStore = defineStore('filter', () => {
  const filters = ref([])

  // 获取过滤器列表
  async function fetchFilters() {
    const res = await getFilterList()
    filters.value = res.data
  }

  // 创建过滤器
  async function addFilter(data) {
    const res = await createFilter(data)
    filters.value.push(res.data)
    return res.data
  }

  // 更新过滤器
  async function editFilter(id, data) {
    const res = await updateFilter(id, data)
    const index = filters.value.findIndex(f => f.id === id)
    if (index !== -1) {
      filters.value[index] = res.data
    }
    return res.data
  }

  // 删除过滤器
  async function removeFilter(id) {
    await deleteFilter(id)
    filters.value = filters.value.filter(f => f.id !== id)
  }

  return {
    filters,
    fetchFilters,
    addFilter,
    editFilter,
    removeFilter
  }
})
