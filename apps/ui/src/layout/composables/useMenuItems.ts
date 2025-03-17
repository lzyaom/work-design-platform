import { computed, h, type Component, type VNode } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import {
  DashboardOutlined,
  LayoutOutlined,
  CodeOutlined,
  UnorderedListOutlined,
  MonitorOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'

// 图标映射
const iconMap: Record<string, Component> = {
  dashboard: DashboardOutlined,
  design: LayoutOutlined,
  program: CodeOutlined,
  tasks: UnorderedListOutlined,
  monitor: MonitorOutlined,
  logs: FileTextOutlined,
}

interface MenuItem {
  key: string
  label: string
  icon?: () => VNode
  children?: MenuItem[]
}

/**
 * 递归过滤和转换路由配置为菜单项
 * @param routes 路由配置数组
 * @returns 菜单项数组
 */
function transformRoutesToMenuItems(routes: readonly RouteRecordRaw[]): MenuItem[] {
  return routes
    .filter((route) => route.meta?.showSidebar)
    .map((route) => {
      const menuItem: MenuItem = {
        key: route.name as string,
        label: (route.meta?.title || '').toString(),
        icon: () => h(iconMap[route.name?.toString().toLowerCase() || '']),
      }

      // 如果有子路由，递归处理
      if (route.children?.length) {
        const children = transformRoutesToMenuItems(route.children)
        // 只有当子菜单不为空时才添加children属性
        if (children.length) {
          return {
            ...menuItem,
            children,
          }
        }
      }

      return menuItem
    })
}

/**
 * 生成菜单项的组合函数
 * @param routes 路由配置数组
 */
/**
 * 基于路由配置生成菜单项的组合式函数
 *
 * 处理逻辑：
 * 1. 过滤不需要显示的路由：
 *    - 跳过 hideInMenu = true 的路由
 *    - 保留有子路由的父路由
 *    - 保留未明确隐藏的路由
 *
 * 2. 转换为菜单项结构：
 *    - 提取路由标题作为菜单名称
 *    - 映射路由名称到对应图标
 *    - 递归处理子路由
 *
 * 3. 生成响应式菜单数据
 *
 * @param routes 路由配置数组
 * @returns 生成的菜单项
 */
export function useMenuItems(routes: readonly RouteRecordRaw[]) {
  const menuItems = computed(() => transformRoutesToMenuItems(routes))

  return {
    menuItems,
  }
}

/**
 * 使用示例:
 *
 * ```ts
 * // 在组件中使用
 * const routes = useRouter().options.routes
 * const { menuItems } = useMenuItems(routes)
 *
 * // 在模板中使用
 * <Menu :items="menuItems">
 * ```
 */
