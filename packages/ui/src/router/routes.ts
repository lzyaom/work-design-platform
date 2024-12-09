import { RouteRecordRaw } from 'vue-router'

export default [
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
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: '仪表盘',
    },
  },
  {
    path: '/design',
    name: 'Design',
    component: () => import(/* webpackChunkName: "design" */ '../views/Design/index.vue'),
    meta: {
      requiresAuth: true,
      title: '设计',
    },
  },
  {
    path: '/program',
    name: 'Program',
    component: () => import(/* webpackChunkName: "profile" */ '../views/Program/index.vue'),
    meta: {
      requiresAuth: true,
      title: '编程',
    },
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
    component: () => import(/* webpackChunkName: "profile" */ '../views/Logs/index.vue'),
    meta: {
      requiresAuth: true,
      title: '日志',
    },
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/login' },
] as RouteRecordRaw[]
