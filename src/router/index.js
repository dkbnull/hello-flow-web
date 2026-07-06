import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginPage.vue'),
    meta: { guest: true, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardPage.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'projects',
        name: 'ProjectList',
        component: () => import('@/views/project/ProjectList.vue'),
        meta: { title: '项目列表' }
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/project/ProjectDetail.vue'),
        meta: { title: '项目详情' },
        children: [
          {
            path: '',
            name: 'ProjectDetailIndex',
            redirect: (to) => ({ name: 'ProjectOverview', params: to.params })
          },
          {
            path: 'overview',
            name: 'ProjectOverview',
            component: () => import('@/views/project/ProjectOverview.vue'),
            meta: { title: '项目概览' }
          },
          {
            path: 'tasks',
            name: 'ProjectTasks',
            component: () => import('@/views/task/TaskList.vue'),
            meta: { title: '任务列表' }
          },
          {
            path: 'board',
            name: 'ProjectBoard',
            component: () => import('@/views/board/BoardView.vue'),
            meta: { title: '看板视图' }
          },
          {
            path: 'sprints',
            name: 'ProjectSprints',
            component: () => import('@/views/sprint/SprintList.vue'),
            meta: { title: '迭代管理' }
          },
          {
            path: 'sprints/:sprintId',
            name: 'SprintDetail',
            component: () => import('@/views/sprint/SprintDetail.vue'),
            meta: { title: 'Sprint详情' }
          },
          {
            path: 'members',
            name: 'ProjectMembers',
            component: () => import('@/views/project/ProjectMembers.vue'),
            meta: { title: '项目成员' }
          },
          {
            path: 'modules',
            name: 'ProjectModules',
            component: () => import('@/views/project/ProjectModules.vue'),
            meta: { title: '模块管理' }
          },
          {
            path: 'versions',
            name: 'ProjectVersions',
            component: () => import('@/views/project/ProjectVersions.vue'),
            meta: { title: '版本管理' }
          },
          {
            path: 'settings',
            name: 'ProjectSettings',
            component: () => import('@/views/project/ProjectSettings.vue'),
            meta: { title: '项目设置' }
          }
        ]
      },
      {
        path: 'my-tasks',
        name: 'MyTasks',
        component: () => import('@/views/task/MyTasks.vue'),
        meta: { title: '我的任务' }
      },
      {
        path: 'tasks/:taskId',
        name: 'TaskDetailPage',
        component: () => import('@/views/task/TaskDetailPage.vue'),
        meta: { title: '任务详情' }
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/notification/NotificationList.vue'),
        meta: { title: '通知中心' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfilePage.vue'),
        meta: { title: '个人设置' },
        children: [
          {
            path: '',
            name: 'ProfileIndex',
            redirect: '/profile/info'
          },
          {
            path: 'info',
            name: 'ProfileInfo',
            component: () => import('@/views/profile/ProfileInfo.vue'),
            meta: { title: '个人信息' }
          },
          {
            path: 'notification-settings',
            name: 'NotificationSettings',
            component: () => import('@/views/profile/NotificationSettings.vue'),
            meta: { title: '通知设置' }
          }
        ]
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/admin/AdminLayout.vue'),
        meta: { title: '管理后台', requiresAdmin: true },
        children: [
          {
            path: '',
            name: 'AdminIndex',
            redirect: '/admin/users'
          },
          {
            path: 'users',
            name: 'AdminUsers',
            component: () => import('@/views/admin/UserManage.vue'),
            meta: { title: '用户管理', requiresAdmin: true }
          },
          {
            path: 'projects',
            name: 'AdminProjects',
            component: () => import('@/views/admin/ProjectManage.vue'),
            meta: { title: '项目管理', requiresAdmin: true }
          },
          {
            path: 'dicts',
            name: 'AdminDicts',
            component: () => import('@/views/admin/DictManage.vue'),
            meta: { title: '字典管理', requiresAdmin: true }
          }
        ]
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: { title: '访问受限', guest: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在', guest: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  document.title = to.meta.title ? `${to.meta.title} - HelloFlow` : 'HelloFlow'

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && authStore.isLoggedIn) {
    return { name: 'Dashboard' }
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'Forbidden' }
  }

  if (authStore.isLoggedIn && !authStore.user && !authStore.userLoading) {
    await authStore.fetchCurrentUser()
  }
})

export default router
