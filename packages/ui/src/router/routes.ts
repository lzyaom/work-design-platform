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
        component: () => import('../views/Dashboard/Overview.vue'),
        meta: {
          title: '概览',
        },
      },
      {
        path: 'analysis',
        name: 'DashboardAnalysis',
        component: () => import('../views/Dashboard/Analysis.vue'),
        meta: {
          title: '分析',
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
        component: () => import(/* webpackChunkName: "design" */ '../views/Design/index.vue'),
        meta: {
          title: '设计',
          hideInMenu: false,
        },
      },
      {
        path: 'editor',
        name: 'DesignEditor',
        component: () => import('../views/Design/editor/index.vue'),
        meta: {
          title: '设计空间',
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
    component: () => import(/* webpackChunkName: "profile" */ '../views/Tasks/index.vue'),
    meta: {
      requiresAuth: true,
      title: '任务列表',
    },
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import(/* webpackChunkName: "profile" */ '../views/Monitor/index.vue'),
    meta: {
      requiresAuth: true,
      title: '监控',
    },
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import(/* webpackChunkName: "profile" */ '../views/Log/index.vue'),
    meta: {
      requiresAuth: true,
      title: '日志',
    },
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/login' },
] as RouteRecordRaw[]
