// 任务状态枚举
export const TASK_STATUS = {
  TODO: 1,
  IN_PROGRESS: 2,
  IN_REVIEW: 3,
  IN_TEST: 4,
  DONE: 5,
  CLOSED: 6,
  CANCELLED: 7
}

export const TASK_STATUS_MAP = {
  [TASK_STATUS.TODO]: { label: '未开始', color: '#909399', tagType: '' },
  [TASK_STATUS.IN_PROGRESS]: { label: '进行中', color: '#409EFF', tagType: '' },
  [TASK_STATUS.IN_REVIEW]: { label: '待审查', color: '#E6A23C', tagType: 'warning' },
  [TASK_STATUS.IN_TEST]: { label: '待测试', color: '#F56C6C', tagType: 'danger' },
  [TASK_STATUS.DONE]: { label: '已完成', color: '#67C23A', tagType: 'success' },
  [TASK_STATUS.CLOSED]: { label: '已关闭', color: '#909399', tagType: 'info' },
  [TASK_STATUS.CANCELLED]: { label: '取消', color: '#909399', tagType: 'danger' }
}

// 任务类型枚举
export const TASK_TYPE = {
  REQUIREMENT: 1,
  IMPROVEMENT: 2,
  BUG: 3
}

export const TASK_TYPE_MAP = {
  [TASK_TYPE.REQUIREMENT]: { label: '需求', color: '#67C23A', tagType: 'success' },
  [TASK_TYPE.IMPROVEMENT]: { label: '完善', color: '#409EFF', tagType: 'primary' },
  [TASK_TYPE.BUG]: { label: '缺陷', color: '#F56C6C', tagType: 'danger' }
}

// 任务优先级枚举
export const TASK_PRIORITY = {
  LOWEST: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  HIGHEST: 5
}

export const TASK_PRIORITY_MAP = {
  [TASK_PRIORITY.LOWEST]: { label: '最低', color: '#909399' },
  [TASK_PRIORITY.LOW]: { label: '低', color: '#67C23A' },
  [TASK_PRIORITY.MEDIUM]: { label: '中', color: '#409EFF' },
  [TASK_PRIORITY.HIGH]: { label: '高', color: '#E6A23C' },
  [TASK_PRIORITY.HIGHEST]: { label: '最高', color: '#F56C6C' }
}

// 关联类型
export const RELATION_TYPE = {
  RELATED: 1,
  DEPENDS: 2,
  DUPLICATE: 3
}

export const RELATION_TYPE_MAP = {
  [RELATION_TYPE.RELATED]: '关联',
  [RELATION_TYPE.DEPENDS]: '依赖',
  [RELATION_TYPE.DUPLICATE]: '重复'
}

// 通知类型
export const NOTIFICATION_TYPE = {
  TASK_ASSIGN: 1,
  STATUS_CHANGE: 2,
  REOPEN: 3,
  COMMENT: 4,
  SYSTEM: 5
}

export const NOTIFICATION_TYPE_MAP = {
  [NOTIFICATION_TYPE.TASK_ASSIGN]: '任务分配',
  [NOTIFICATION_TYPE.STATUS_CHANGE]: '状态变更',
  [NOTIFICATION_TYPE.REOPEN]: '重新打开',
  [NOTIFICATION_TYPE.COMMENT]: '评论',
  [NOTIFICATION_TYPE.SYSTEM]: '系统通知'
}

// Sprint 状态
export const SPRINT_STATUS = {
  PLANNING: 1,
  ACTIVE: 2,
  COMPLETED: 3
}

export const SPRINT_STATUS_MAP = {
  [SPRINT_STATUS.PLANNING]: { label: '计划中', tagType: 'info' },
  [SPRINT_STATUS.ACTIVE]: { label: '进行中', tagType: '' },
  [SPRINT_STATUS.COMPLETED]: { label: '已完成', tagType: 'success' }
}

// 项目状态
export const PROJECT_STATUS = {
  ARCHIVED: 0,
  ACTIVE: 1
}

export const PROJECT_STATUS_MAP = {
  [PROJECT_STATUS.ARCHIVED]: { label: '归档', tagType: 'info' },
  [PROJECT_STATUS.ACTIVE]: { label: '进行中', tagType: '' }
}

// 职位编码
export const POSITION_CODE = {
  PM: 'PM',
  DEV: 'DEV',
  QA: 'QA'
}

export const POSITION_NAME_MAP = {
  PM: '项目经理',
  DEV: '开发工程师',
  QA: '测试工程师'
}

// 角色编码
export const ROLE_CODE = {
  ADMIN: 'ADMIN',
  USER: 'USER'
}

// 错误码
export const ERROR_CODE = {
  SUCCESS: 0,
  PARAM_ERROR: 10001,
  UNAUTHORIZED: 20001,
  TOKEN_EXPIRED: 20002,
  TOKEN_INVALID: 20003,
  LOGIN_FAILED: 20004,
  ACCOUNT_DISABLED: 20005,
  FORBIDDEN: 30001,
  RESOURCE_NOT_FOUND: 40001,
  USER_NOT_FOUND: 40002,
  PROJECT_NOT_FOUND: 40003,
  TASK_NOT_FOUND: 40004,
  SPRINT_NOT_FOUND: 40005,
  ROLE_NOT_FOUND: 40006,
  USERNAME_EXISTS: 50001,
  MEMBER_EXISTS: 50002,
  RELATION_EXISTS: 50003,
  BIZ_ERROR: 50004,
  STATUS_INVALID: 50005,
  CANNOT_REVIEW_OWN: 50006,
  PM_CANNOT_REVIEW: 50013,
  TASK_CANCELLED: 50007,
  PROJECT_ARCHIVED: 50008,
  SERVER_ERROR: 90001,
  DB_ERROR: 90003
}
