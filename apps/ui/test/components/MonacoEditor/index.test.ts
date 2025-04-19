import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MonacoEditor from '../../../src/components/MonacoEditor'
import type { MonacoEditorProps, MonacoEditorExpose } from '../../../src/components/MonacoEditor/types'
import * as monacoEditor from 'monaco-editor'

// 创建模拟的内容变更事件
const createMockChangeEvent = () => ({
  changes: [{
    range: {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1
    },
    rangeLength: 0,
    rangeOffset: 0,
    text: ''
  }]
})

// 创建模拟的编辑器动作
const createMockAction = (opts: { shouldFail?: boolean } = {}): monacoEditor.editor.IEditorAction => ({
  id: 'editor.action.formatDocument',
  label: 'Format Document',
  alias: 'Format Document',
  metadata: { description: 'Format the document' },
  isSupported: () => true,
  run: vi.fn(() => opts.shouldFail 
    ? Promise.reject(new Error('格式化失败'))
    : Promise.resolve()
  )
})

// 模拟 monaco-editor
vi.mock('monaco-editor', () => {
  return {
    editor: {
      setModelLanguage: vi.fn(),
      setTheme: vi.fn(),
      create: vi.fn()
    }
  }
})

describe('MonacoEditor 组件', () => {
  const defaultProps: MonacoEditorProps = {
    value: 'initial content',
    language: 'javascript',
    theme: 'vs-dark'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应正确渲染编辑器', () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      expect(wrapper.find('.monaco-editor-container').exists()).toBe(true)
      expect(wrapper.find('.editor-toolbar').exists()).toBe(true)
      expect(wrapper.find('.editor-content').exists()).toBe(true)
    })

    it('应使用正确的主题类', () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      expect(wrapper.find('.monaco-editor-container').attributes('data-theme')).toBe('dark')

      wrapper.setProps({ theme: 'vs' })
      expect(wrapper.find('.monaco-editor-container').attributes('data-theme')).toBe('light')
    })

    it('应应用正确的尺寸样式', () => {
      const wrapper = mount(MonacoEditor, {
        props: {
          ...defaultProps,
          width: 500,
          height: 300
        }
      })
      const content = wrapper.find('.editor-content div')
      expect(content.attributes('style')).toContain('width: 500px')
      expect(content.attributes('style')).toContain('height: 300px')
    })
  })

  describe('编辑器状态', () => {
    it('应在初始化时显示加载状态', () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      expect(wrapper.find('.editor-loading').exists()).toBe(true)
      expect(wrapper.find('.editor-loading-spinner').exists()).toBe(true)
    })

    it('应在就绪后隐藏加载状态', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-loading').exists()).toBe(false)
    })

    it('初始化失败时应显示错误信息', async () => {
      vi.mocked(monacoEditor.editor.create).mockImplementationOnce(() => {
        throw new Error('初始化失败')
      })

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(true)
      expect(wrapper.find('.editor-error').text()).toContain('初始化失败')
    })

    it('错误信息应在指定时间后自动消失', async () => {
      vi.useFakeTimers()
      vi.mocked(monacoEditor.editor.create).mockImplementationOnce(() => {
        throw new Error('临时错误')
      })

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(true)

      await vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('格式化功能', () => {
    it('应显示格式化失败错误', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()

      if (editor) {
        vi.mocked(editor.getAction).mockReturnValueOnce(createMockAction({ shouldFail: true }))
      }

      await wrapper.find('.editor-toolbar-button').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.editor-error').exists()).toBe(true)
      expect(wrapper.find('.editor-error').text()).toContain('格式化失败')
    })

    it('应正确处理格式化命令不可用的情况', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()

      if (editor) {
        vi.mocked(editor.getAction).mockReturnValueOnce(null)
      }

      await wrapper.find('.editor-toolbar-button').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.editor-error').exists()).toBe(true)
      expect(wrapper.find('.editor-error').text()).toContain('格式化命令不可用')
    })
  })

  describe('错误提示交互', () => {
    it('点击关闭按钮应隐藏错误信息', async () => {
      vi.mocked(monacoEditor.editor.create).mockImplementationOnce(() => {
        throw new Error('测试错误')
      })

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(true)

      await wrapper.find('.error-close').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(false)
    })

    it('新的错误应重置自动隐藏定时器', async () => {
      vi.useFakeTimers()
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()

      if (editor) {
        vi.mocked(editor.getAction).mockReturnValue(null)
      }

      // 触发第一个错误
      await wrapper.find('.editor-toolbar-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(true)

      // 前进 2 秒
      await vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()

      // 触发第二个错误
      await wrapper.find('.editor-toolbar-button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(true)

      // 前进 3 秒，错误应该消失
      await vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('资源管理', () => {
    it('应在销毁时清理编辑器实例', () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()
      const model = editor?.getModel()

      wrapper.unmount()
      
      expect(model?.dispose).toHaveBeenCalled()
      expect(editor?.dispose).toHaveBeenCalled()
    })

    it('应在组件卸载时清理事件监听器', () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()
      const disposable = { dispose: vi.fn() }
      
      if (editor) {
        vi.mocked(editor.onDidChangeModelContent).mockReturnValue(disposable)
      }

      wrapper.unmount()
      
      expect(disposable.dispose).toHaveBeenCalled()
    })
  })

  describe('可访问性', () => {
    it('工具栏按钮应有正确的 ARIA 标签', () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const formatButton = wrapper.find('.editor-toolbar-button')
      expect(formatButton.attributes('title')).toBe('格式化代码 (Ctrl/Cmd + F)')
    })

    it('加载状态应有正确的语义标记', () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const loading = wrapper.find('.editor-loading')
      expect(loading.attributes('role')).toBe('status')
      expect(loading.attributes('aria-label')).toBe('加载编辑器')
    })

    it('错误提示应有正确的 ARIA 属性', async () => {
      vi.mocked(monacoEditor.editor.create).mockImplementationOnce(() => {
        throw new Error('可访问性测试')
      })

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      await wrapper.vm.$nextTick()
      const error = wrapper.find('.editor-error')
      expect(error.attributes('role')).toBe('alert')
      expect(wrapper.find('.error-close').attributes('aria-label')).toBe('关闭错误提示')
    })
  })
})