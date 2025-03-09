import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
    title: string
    hideInMenu?: boolean
    icon?: string
    hideInBreadcrumb?: boolean
    hideInTab?: boolean
    hideInSidebar?: boolean
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
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
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
    name: 'Dashboard',
    meta: {
      requiresAuth: true,
      title: '仪表盘',
    },
    children: [
      {
        path: 'overview',
        name: 'DashboardOverview',
        component: () => import('../views/Dashboard/Overview.tsx'),
        meta: {
          title: '概览',
          requiresAuth: true,
        },
      },
      {
        path: 'analysis',
        name: 'DashboardAnalysis',
        component: () => import('../views/Dashboard/Analysis.vue'),
        meta: {
          title: '分析',
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/design',
    name: 'Design',
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
    children: [
      {
        path: '',
        name: 'DesignList',
        component: () => import(/* webpackChunkName: "design" */ '../views/Design/index.tsx'),
        meta: {
          title: '设计',
          requiresAuth: true,
          hideInMenu: false,
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
    name: 'Program',
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
    children: [
      {
        path: '',
        name: 'ProgramList',
        component: () => import(/* webpackChunkName: "program" */ '../views/Program/index.vue'),
        meta: {
          title: '编程',
          hideInMenu: false,
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
    name: 'Tasks',
    component: () => import('@/views/Tasks/index'),
    meta: {
      requiresAuth: true,
      title: '任务管理',
    },
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('@/views/Monitor/index'),
    meta: {
      requiresAuth: true,
      title: '监控管理',
    },
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/Log/index'),
    meta: {
      requiresAuth: true,
      title: '日志管理',
    },
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/login' },
] as RouteRecordRaw[]
