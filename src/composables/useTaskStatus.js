import { TASK_STATUS } from '@/utils/constants'

const TERMINAL_STATUSES = [TASK_STATUS.DONE, TASK_STATUS.CLOSED, TASK_STATUS.CANCELLED]

export function useTaskStatus() {
  function isOverdue(task) {
    if (!task?.dueDate) return false
    if (TERMINAL_STATUSES.includes(task.status)) return false
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
