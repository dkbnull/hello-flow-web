import { TASK_STATUS } from '@/utils/constants'

export function useTaskStatus() {
  function isOverdue(task) {
    if (!task?.dueDate) return false
    if (task.status === TASK_STATUS.DONE || task.status === TASK_STATUS.CLOSED || task.status === TASK_STATUS.CANCELLED) return false
    return new Date(task.dueDate) < new Date()
  }

  function isTaskCompleted(task) {
    if (!task) return false
    return task.status === TASK_STATUS.DONE || task.status === TASK_STATUS.CLOSED
  }

  function isTaskCancelled(task) {
    if (!task) return false
    return task.status === TASK_STATUS.CANCELLED
  }

  return { isOverdue, isTaskCompleted, isTaskCancelled }
}
