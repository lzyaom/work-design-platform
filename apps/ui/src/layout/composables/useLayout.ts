import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { LayoutSettings, LayoutContext } from '../types'
import { defaultSettings } from '../types'

export function useLayout(settings: Partial<LayoutSettings> = {}): LayoutContext {
  const mergedSettings = {
    ...defaultSettings,
    ...settings,
    layout: { ...defaultSettings.layout, ...settings.layout },
    responsive: { ...defaultSettings.responsive, ...settings.responsive },
  }

  const route = useRoute()
  const collapsed = ref(mergedSettings.layout.defaultCollapsed)
  const windowWidth = ref(window.innerWidth)

  // 计算是否为移动设备
  const isMobile = computed(() => {
    const breakpoint =
      mergedSettings.responsive.breakpoints[mergedSettings.responsive.mobileBreakpoint]
    return windowWidth.value <= breakpoint
  })

  // 处理窗口大小变化
  const handleResize = () => {
    windowWidth.value = window.innerWidth
    // 在移动设备上自动折叠侧边栏
    if (isMobile.value && !collapsed.value) {
      collapsed.value = true
    }
  }

  // 切换侧边栏状态
  const toggleCollapsed = () => {
    if (mergedSettings.layout.sidebarCollapsible) {
      collapsed.value = !collapsed.value
    }
  }

  // 监听窗口大小变化
  onMounted(() => {
    window.addEventListener('resize', handleResize)
    handleResize()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    collapsed,
    toggleCollapsed,
    isMobile,
    settings: mergedSettings,
  }
}
