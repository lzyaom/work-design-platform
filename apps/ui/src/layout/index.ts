import AppLayout from './AppLayout'
import { createLayout } from './utils/createLayout'
import { useLayout } from './composables/useLayout'
import type { LayoutSettings, LayoutContext } from './types'
import type { CreateLayoutOptions } from './utils/createLayout'

export {
  // 主布局组件
  AppLayout,

  // 工具函数
  createLayout,
  useLayout,
}

// 导出类型定义
export type { LayoutSettings, LayoutContext, CreateLayoutOptions }

/**
 * 使用示例:
 *
 * ```ts
 * // 创建布局配置
 * const layoutConfig = createLayout({
 *   layout: {
 *     sidebarWidth: 240,
 *     defaultCollapsed: true
 *   },
 *   responsive: {
 *     mobileBreakpoint: 'lg'
 *   },
 *   routing: {
 *     excludePaths: ['/login', '/register', '/error'],
 *     customLayouts: {
 *       '/design': {
 *         component: DesignLayout,
 *         settings: {
 *           layout: {
 *             sidebarCollapsible: false
 *           }
 *         }
 *       }
 *     }
 *   }
 * })
 *
 * // 在路由配置中使用
 * const router = createRouter({
 *   routes: [
 *     {
 *       path: '/',
 *       component: AppLayout,
 *       props: {
 *         settings: layoutConfig
 *       },
 *       children: [...]
 *     }
 *   ]
 * })
 * ```
 */

// 默认导出主布局组件
export default AppLayout
