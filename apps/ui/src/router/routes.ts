import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
    title: string
    hideInMenu?: boolean
    icon?: string
    hideInBreadcrumb?: boolean
    hideInTab?: boolean
    showSidebar?: boolean
  }
}

export default [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login/index.tsx'),
    meta: {
      requiresAuth: false,
      title: '登录',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "register" */ '../views/Register.vue'),
    meta: {
      requiresAuth: false,
      title: '注册',
    },
  },
  {
    path: '/dashboard',
    component: () => import('@/layout/AppLayout'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/Overview.tsx'),
        meta: {
          title: '仪表盘',
          requiresAuth: true,
          showSidebar: true,
        },
      },
      {
        path: 'analysis',
        name: 'DashboardAnalysis',
        component: () => import('../views/Dashboard/Analysis.vue'),
        meta: {
          title: '分析',
          requiresAuth: true,
          showSidebar: false,
        },
      },
    ],
  },
  {
    path: '/design',
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
    component: () => import('@/layout/AppLayout'),
    children: [
      {
        path: '',
        name: 'Design',
        component: () => import(/* webpackChunkName: "design" */ '../views/Design/index.tsx'),
        meta: {
          title: '设计',
          requiresAuth: true,
          showSidebar: true,
        },
      },
      {
        path: 'editor',
        name: 'DesignEditor',
        component: () => import('../views/Design/editor/index.tsx'),
        meta: {
          title: '设计空间',
          requiresAuth: true,
          hideInMenu: true,
        },
      },
    ],
  },
  {
    path: '/program',
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
    component: () => import('@/layout/AppLayout'),
    children: [
      {
        path: '',
        name: 'Program',
        component: () => import(/* webpackChunkName: "program" */ '../views/Program/index.tsx'),
        meta: {
          title: '编程',
          showSidebar: true,
        },
      },
      {
        path: 'editor',
        name: 'ProgramEditor',
        component: () => import('../views/Program/editor/index.vue'),
        meta: {
          title: '编程空间',
          hideInMenu: true,
        },
      },
    ],
  },
  {
    path: '/tasks',
    component: () => import('@/layout/AppLayout'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'Tasks',
        component: () => import('@/views/Tasks/index'),
        meta: {
          title: '任务管理',
          showSidebar: true,
        },
      },
    ],
  },
  {
    path: '/monitor',
    component: () => import('@/layout/AppLayout'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'Monitor',
        component: () => import('@/views/Monitor/index'),
        meta: {
          title: '监控管理',
          showSidebar: true,
        },
      },
    ],
  },
  {
    path: '/logs',
    component: () => import('@/layout/AppLayout'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'Logs',
        component: () => import('@/views/Log/index'),
        meta: {
          title: '日志管理',
          showSidebar: true,
        },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/login' },
] as RouteRecordRaw[]
