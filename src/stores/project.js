import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProjectList } from '@/api/project'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const currentProject = ref(null)

  // 获取项目列表
  async function fetchProjects(params) {
    const res = await getProjectList(params)
    projects.value = res.data.records
    return res.data
  }

  // 设置当前项目
  function setCurrentProject(project) {
    currentProject.value = project
  }

  return {
    projects,
    currentProject,
    fetchProjects,
    setCurrentProject
  }
})
