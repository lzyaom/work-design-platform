import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ThemePreview from '../ThemePreview'
import { themeManager } from '../themeManager'
import type { EditorTheme } from '../themes'
import { nextTick } from 'vue'
import { getSupportedLanguages } from '../themePreviewSamples'

// 模拟主题管理器
vi.mock('../themeManager', () => ({
  themeManager: {
    getAvailableThemes: vi.fn().mockReturnValue([
      { value: 'vs', label: '浅色' },
      { value: 'vs-dark', label: '深色' },
      { value: 'github-light', label: 'GitHub 浅色' }
    ])
  }
}))

// 模拟代码示例
vi.mock('../themePreviewSamples', () => ({
  codeSamples: [{ label: 'JavaScript', language: 'javascript', code: 'const x = 1;' }],
  sampleIterator: vi.fn().mockReturnValue({
    next: () => ({ value: { label: 'JavaScript', language: 'javascript', code: 'const x = 1;' }, done: false })
  }),
  getSampleByLanguage: vi.fn(),
  getSupportedLanguages: vi.fn().mockReturnValue(['javascript', 'typescript'])
}))

describe('ThemePreview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 重置 DOM 环境
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(ThemePreview, {
      props: {
        modelValue: 'vs-dark' as EditorTheme,
        ...props
      },
      attachTo: document.body // 附加到真实 DOM 以测试焦点行为
    })
  }

  describe('基本渲染', () => {
    // ... 之前的基本渲染测试保持不变 ...
  })

  describe('边界条件测试', () => {
    it('应该处理空主题列表', async () => {
      vi.mocked(themeManager.getAvailableThemes).mockReturnValueOnce([])
      const wrapper = createWrapper()
      await wrapper.find('.theme-selected').trigger('click')
      
      expect(wrapper.find('.theme-options').exists()).toBe(true)
      expect(wrapper.findAll('.theme-option')).toHaveLength(0)
    })

    it('应该处理无效的主题值', () => {
      const wrapper = createWrapper({ modelValue: 'invalid-theme' as EditorTheme })
      expect(wrapper.find('.theme-name').text()).toBe('invalid-theme')
    })

    it('应该处理语言列表为空的情况', async () => {
      vi.mocked(getSupportedLanguages).mockReturnValueOnce([])
      const wrapper = createWrapper()
      await wrapper.find('.theme-selected').trigger('click')
      
      expect(wrapper.find('.language-selector').exists()).toBe(false)
    })

    it('应该处理快速切换主题', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.theme-selected').trigger('click')
      
      const options = wrapper.findAll('.theme-option')
      await options[0].trigger('click')
      await options[1].trigger('click')
      await options[2].trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(3)
    })

    it('应该处理同时触发的鼠标和键盘事件', async () => {
      const wrapper = createWrapper()
      const selected = wrapper.find('.theme-selected')
      
      // 同时触发点击和按键
      await Promise.all([
        selected.trigger('click'),
        selected.trigger('keydown', { key: 'Enter' })
      ])
      
      // 确保弹出层状态正确
      expect(wrapper.find('.theme-options').exists()).toBe(true)
    })
  })

  describe('性能测试', () => {
    it('应该限制快速切换主题的频率', async () => {
      const wrapper = createWrapper()
      const startTime = performance.now()
      
      // 快速切换 100 次主题
      for (let i = 0; i < 100; i++) {
        await wrapper.setProps({
          modelValue: i % 2 === 0 ? 'vs' : 'vs-dark'
        })
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // 确保性能在可接受范围内
    })

    it('应该优化滚动性能', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.theme-selected').trigger('click')
      
      const startTime = performance.now()
      
      // 模拟大量滚动事件
      for (let i = 0; i < 100; i++) {
        await wrapper.find('.theme-options').trigger('scroll')
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(500)
    })

    it('应该优化内存使用', async () => {
      const initialMemory = process.memoryUsage().heapUsed
      const wrapper = createWrapper()
      
      // 模拟大量操作
      for (let i = 0; i < 1000; i++) {
        await wrapper.setProps({
          modelValue: i % 2 === 0 ? 'vs' : 'vs-dark'
        })
      }
      
      wrapper.unmount()
      const finalMemory = process.memoryUsage().heapUsed
      expect(finalMemory - initialMemory).toBeLessThan(5 * 1024 * 1024) // 内存增长不超过 5MB
    })
  })

  describe('并发和竞态条件', () => {
    it('应该处理快速打开/关闭弹出层', async () => {
      const wrapper = createWrapper()
      const selected = wrapper.find('.theme-selected')
      
      // 快速切换弹出层状态
      await Promise.all([
        selected.trigger('click'),
        selected.trigger('click'),
        selected.trigger('click')
      ])
      
      // 确保状态一致
      const isOpen = wrapper.find('.theme-options').exists()
      expect(wrapper.emitted('click')?.length).toBe(3)
      expect(isOpen).toBe(true)
    })

    it('应该处理主题切换时的动画完成', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.theme-selected').trigger('click')
      
      const option = wrapper.find('.theme-option')
      await option.trigger('click')
      
      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 300))
      expect(wrapper.find('.theme-options').exists()).toBe(false)
    })
  })

  describe('资源管理', () => {
    it('应该在组件卸载时清理所有定时器', () => {
      const wrapper = createWrapper({ autoCarousel: true })
      expect(vi.getTimerCount()).toBe(1)
      
      wrapper.unmount()
      expect(vi.getTimerCount()).toBe(0)
    })

    it('应该在组件卸载时移除所有事件监听器', () => {
      const wrapper = createWrapper()
      const removeEventListener = vi.spyOn(document, 'removeEventListener')
      
      wrapper.unmount()
      expect(removeEventListener).toHaveBeenCalled()
    })
  })

  describe('无障碍性进阶测试', () => {
    it('应该支持屏幕阅读器导航', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.theme-selected').trigger('click')
      
      const options = wrapper.findAll('.theme-option')
      expect(options[0].attributes('role')).toBe('option')
      expect(options[0].attributes('aria-selected')).toBe('false')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    })

    it('应该支持高对比度模式', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.theme-selected').attributes('style'))
        .not.toContain('transparent')
    })

    it('应该响应减少动画设置', () => {
      // 模拟 prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      Object.defineProperty(mediaQuery, 'matches', { value: true })
      
      const wrapper = createWrapper()
      const style = window.getComputedStyle(wrapper.element)
      expect(style.transition).toBe('none')
    })
  })
})