import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { themeManager } from './themeManager'
import type { EditorTheme } from './themes'

// 主题切换类名
const TRANSITION_CLASS = 'theme-transitioning'

// 动画持续时间（毫秒）
const ANIMATION_DURATION = 300

// 动画超时保护时间（毫秒）
const TIMEOUT_DURATION = 1000

// CSS 样式定义
const GLOBAL_STYLES = `
  :root {
    transition: none;
  }
  
  :root.${TRANSITION_CLASS} {
    transition: background-color ${ANIMATION_DURATION}ms ease,
                color ${ANIMATION_DURATION}ms ease,
                border-color ${ANIMATION_DURATION}ms ease;
  }
  
  :root.${TRANSITION_CLASS} * {
    transition: background-color ${ANIMATION_DURATION}ms ease,
                color ${ANIMATION_DURATION}ms ease,
                border-color ${ANIMATION_DURATION}ms ease !important;
  }
  
  @media (prefers-reduced-motion: reduce) {
    :root.${TRANSITION_CLASS},
    :root.${TRANSITION_CLASS} * {
      transition: none !important;
    }
  }
`

export default defineComponent({
  name: 'ThemeTransition',

  setup() {
    const transitioning = ref(false)
    const currentTheme = ref<EditorTheme>(themeManager.getCurrentTheme())
    const unsubscribe = ref<(() => void) | null>(null)
    let timeoutId: number | null = null
    let styleElement: HTMLStyleElement | null = null

    // 应用过渡效果
    const applyTransition = () => {
      if (transitioning.value) return

      // 设置过渡状态
      transitioning.value = true
      document.documentElement.classList.add(TRANSITION_CLASS)

      // 清理函数
      const cleanup = () => {
        transitioning.value = false
        document.documentElement.classList.remove(TRANSITION_CLASS)
        if (timeoutId) {
          window.clearTimeout(timeoutId)
          timeoutId = null
        }
      }

      // 监听过渡结束
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.target === document.documentElement) {
          cleanup()
          document.documentElement.removeEventListener('transitionend', handleTransitionEnd)
        }
      }

      // 添加过渡结束监听
      document.documentElement.addEventListener('transitionend', handleTransitionEnd)

      // 超时保护
      timeoutId = window.setTimeout(cleanup, TIMEOUT_DURATION)
    }

    // 创建全局样式
    const createStyleSheet = () => {
      styleElement = document.createElement('style')
      styleElement.textContent = GLOBAL_STYLES
      document.head.appendChild(styleElement)
    }

    // 清理全局样式
    const removeStyleSheet = () => {
      if (styleElement && document.head.contains(styleElement)) {
        styleElement.remove()
        styleElement = null
      }
    }

    // 监听主题变化
    onMounted(() => {
      // 创建样式表
      createStyleSheet()

      // 订阅主题变化
      unsubscribe.value = themeManager.subscribe((theme) => {
        if (theme !== currentTheme.value) {
          applyTransition()
          currentTheme.value = theme
        }
      })
    })

    // 组件卸载时清理
    onBeforeUnmount(() => {
      // 取消主题订阅
      unsubscribe.value?.()

      // 清理超时计时器
      if (timeoutId) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }

      // 移除样式表
      removeStyleSheet()

      // 确保移除过渡类名
      document.documentElement.classList.remove(TRANSITION_CLASS)
    })

    // 不需要渲染任何内容
    return () => null
  },
})
