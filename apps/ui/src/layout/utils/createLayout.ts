import type { LayoutSettings } from '../types'
import { defaultSettings } from '../types'

export interface CreateLayoutOptions extends Partial<LayoutSettings> {
  // 允许扩展配置
  [key: string]: any
}

export function createLayout(options: CreateLayoutOptions = {}): LayoutSettings {
  return {
    ...defaultSettings,
    ...options,
    // 深度合并布局配置
    layout: {
      ...defaultSettings.layout,
      ...options.layout,
    },
    // 深度合并响应式配置
    responsive: {
      ...defaultSettings.responsive,
      ...options.responsive,
      breakpoints: {
        ...defaultSettings.responsive.breakpoints,
        ...(options.responsive?.breakpoints || {}),
      },
    },
    // 深度合并路由配置
    routing: {
      ...defaultSettings.routing,
      ...options.routing,
      customLayouts: {
        ...defaultSettings.routing.customLayouts,
        ...(options.routing?.customLayouts || {}),
      },
    },
  }
}

// 辅助函数：检查路径是否应该使用布局
export function shouldUseLayout(path: string, settings: LayoutSettings): boolean {
  // 检查是否在排除路径列表中
  if (settings.routing.excludePaths.some((p) => path.startsWith(p))) {
    return false
  }

  // 检查是否有自定义布局配置
  return !Object.keys(settings.routing.customLayouts).some((p) => path.startsWith(p))
}

// 辅助函数：获取路径的自定义布局
export function getCustomLayout(path: string, settings: LayoutSettings) {
  const matchedPath = Object.keys(settings.routing.customLayouts).find((p) => path.startsWith(p))

  return matchedPath ? settings.routing.customLayouts[matchedPath] : null
}
