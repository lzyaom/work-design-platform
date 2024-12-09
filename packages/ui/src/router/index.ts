import { createRouter, createWebHistory } from 'vue-router'
import nprogress from 'nprogress'
import routes from './routes'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  nprogress.start()
  // 路由守卫
  // if (to.meta.requiresAuth && !store.state.user.token) {
  //   next('/login')
  // } else {
  //   next()
  // }
  document.title = to.meta.title || '平台'
  next()
})

router.afterEach(() => {
  // 路由守卫
  nprogress.done()
})

router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g
  const isChunkLoadFailed = error.message.match(pattern)
  const targetPath = router.currentRoute.value.fullPath
  if (isChunkLoadFailed) {
    router.replace(targetPath)
  }
})
export default router
