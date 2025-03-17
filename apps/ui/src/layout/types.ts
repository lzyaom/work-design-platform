import type { Component, Ref, ComputedRef } from 'vue'

export interface LayoutSettings {
  // 布局结构配置
  layout: {
    sidebarWidth: number
    collapsedWidth: number
    headerHeight: number
    sidebarCollapsible: boolean
    defaultCollapsed: boolean
  }

  // 组件配置
  components: {
    sidebar?: Component
    header?: Component
    logo?: Component
    footer?: Component
  }

  // 响应式配置
  responsive: {
    breakpoints: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
    }
    mobileBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }

  // 路由配置
  routing: {
    // 不使用布局的路由路径
    excludePaths: string[]
    // 自定义布局的路由配置
    customLayouts: {
      [key: string]: {
        component: Component
        settings?: Partial<LayoutSettings>
      }
    }
  }
}

// 默认布局配置
export const defaultSettings: LayoutSettings = {
  layout: {
    sidebarWidth: 220,
    collapsedWidth: 80,
    headerHeight: 64,
    sidebarCollapsible: true,
    defaultCollapsed: false,
  },
  components: {},
  responsive: {
    breakpoints: {
      xs: 480,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
    },
    mobileBreakpoint: 'md',
  },
  routing: {
    excludePaths: ['/login', '/register'],
    customLayouts: {},
  },
}

// 布局上下文接口
export interface LayoutContext {
  collapsed: Ref<boolean>
  toggleCollapsed: () => void
  isMobile: ComputedRef<boolean>
  settings: LayoutSettings
}
