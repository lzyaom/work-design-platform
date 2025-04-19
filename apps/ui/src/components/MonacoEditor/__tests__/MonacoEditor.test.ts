import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MonacoEditor from '../index'
import type { MonacoEditorProps, MonacoEditorExpose } from '../types'
import * as monacoEditor from 'monaco-editor'

// 模拟 monaco-editor
vi.mock('monaco-editor', () => {
  return {
    editor: {
      setModelLanguage: vi.fn(),
      setTheme: vi.fn()
    }
  }
})

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

describe('MonacoEditor 组件', () => {
  const defaultProps: MonacoEditorProps = {
    value: 'initial content',
    language: 'javascript',
    theme: 'vs-dark'
  }

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

    it('应支持百分比尺寸', () => {
      const wrapper = mount(MonacoEditor, {
        props: {
          ...defaultProps,
          width: '100%',
          height: '50%'
        }
      })
      const content = wrapper.find('.editor-content div')
      expect(content.attributes('style')).toContain('width: 100%')
      expect(content.attributes('style')).toContain('height: 50%')
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
  })

  describe('值更新', () => {
    it('应响应外部值变化', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()
      
      await wrapper.setProps({ value: 'new content' })
      expect(editor?.setValue).toHaveBeenCalledWith('new content')
    })

    it('不应在值相同时更新编辑器', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()
      
      await wrapper.setProps({ value: 'initial content' })
      expect(editor?.setValue).not.toHaveBeenCalled()
    })

    it('应触发更新事件', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()
      
      if (editor) {
        vi.mocked(editor.getValue).mockReturnValue('new content')
        // 触发内容变化事件
        const mockEvent = createMockChangeEvent()
        // @ts-ignore - 测试环境不需要完整的事件对象
        vi.mocked(editor.onDidChangeModelContent).mock.calls[0][0](mockEvent)

        expect(wrapper.emitted('update:value')?.[0]).toEqual(['new content'])
        expect(wrapper.emitted('change')?.[0]).toEqual(['new content'])
      }
    })
  })

  describe('配置更新', () => {
    it('应响应语言变化', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      await wrapper.setProps({ language: 'typescript' })
      expect(vi.mocked(monacoEditor.editor).setModelLanguage).toHaveBeenCalledWith(
        expect.anything(),
        'typescript'
      )
    })

    it('应响应主题变化', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      await wrapper.setProps({ theme: 'vs-light' })
      expect(vi.mocked(monacoEditor.editor).setTheme).toHaveBeenCalledWith('vs-light')
    })

    it('应更新编辑器选项', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()
      
      const newOptions: monacoEditor.editor.IEditorOptions = {
        fontSize: 16,
        lineNumbers: 'on'
      }
      await wrapper.setProps({ options: newOptions })
      expect(editor?.updateOptions).toHaveBeenCalledWith(newOptions)
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
  })
})