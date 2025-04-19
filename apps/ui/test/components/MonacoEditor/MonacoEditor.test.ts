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

// 模拟 monaco-editor
vi.mock('monaco-editor', () => {
  return {
    editor: {
      setModelLanguage: vi.fn(),
      setTheme: vi.fn()
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

    it('应触发更新事件', async () => {
      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as MonacoEditorExpose
      const editor = vm.getEditor()
      
      if (editor) {
        vi.mocked(editor.getValue).mockReturnValue('new content')
        const mockEvent = createMockChangeEvent()
        // @ts-ignore - 测试环境不需要完整的事件对象
        vi.mocked(editor.onDidChangeModelContent).mock.calls[0][0](mockEvent)

        expect(wrapper.emitted('update:value')?.[0]).toEqual(['new content'])
        expect(wrapper.emitted('change')?.[0]).toEqual(['new content'])
      }
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