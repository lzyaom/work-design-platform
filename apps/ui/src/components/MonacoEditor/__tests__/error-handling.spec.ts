import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import MonacoEditor from '../index'
import type { MonacoEditorProps } from '../types'
import type * as monacoEditor from 'monaco-editor'

// 定义 Mock 函数的基本类型
type MockFn = Mock & {
  mockReturnValue: (value: any) => MockFn
  mockImplementation: (fn: (...args: any[]) => any) => MockFn
  mockRejectedValue: (value: any) => MockFn
}

// 定义编辑器实例的类型
interface MockEditor {
  getValue: MockFn
  setValue: MockFn
  getModel: MockFn
  onDidChangeModelContent: MockFn
  dispose: MockFn
  layout: MockFn
  updateOptions: MockFn
  getAction: MockFn
  addCommand: MockFn
}

// 定义模型实例的类型
interface MockModel {
  getValue: MockFn
  setValue: MockFn
  dispose: MockFn
}

// 创建类型安全的 Monaco Mock
class MonacoEditorMock {
  private mockModel: MockModel
  private mockEditor: MockEditor
  private mockEditorApi: {
    create: MockFn
    createModel: MockFn
    setModelLanguage: MockFn
    setTheme: MockFn
    KeyMod: { CtrlCmd: number }
    KeyCode: { KeyF: number }
  }

  constructor() {
    // 创建模型实例
    this.mockModel = {
      getValue: vi.fn(() => 'test content'),
      setValue: vi.fn(),
      dispose: vi.fn(),
    }

    // 创建编辑器实例
    this.mockEditor = {
      getValue: vi.fn(() => 'test content'),
      setValue: vi.fn(),
      getModel: vi.fn(() => this.mockModel),
      onDidChangeModelContent: vi.fn((callback) => {
        callback()
        return { dispose: vi.fn() }
      }),
      dispose: vi.fn(),
      layout: vi.fn(),
      updateOptions: vi.fn(),
      getAction: vi.fn(() => ({
        run: vi.fn(() => Promise.resolve()),
      })),
      addCommand: vi.fn()
    }

    // 创建编辑器 API
    this.mockEditorApi = {
      create: vi.fn(() => this.mockEditor),
      createModel: vi.fn(() => this.mockModel),
      setModelLanguage: vi.fn(),
      setTheme: vi.fn(),
      KeyMod: {
        CtrlCmd: 2048
      },
      KeyCode: {
        KeyF: 33
      }
    }
  }

  getMockModel() {
    return this.mockModel
  }

  getMockEditor() {
    return this.mockEditor
  }

  getMockApi() {
    return { editor: this.mockEditorApi }
  }
}

const monacoMock = new MonacoEditorMock()
vi.mock('monaco-editor', () => monacoMock.getMockApi())

describe('MonacoEditor Error Handling', () => {
  let mockEditor: MockEditor

  const defaultProps: MonacoEditorProps = {
    value: 'initial content',
    language: 'javascript',
    theme: 'vs-dark'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockEditor = monacoMock.getMockEditor()
  })

  describe('初始化错误', () => {
    it('应显示初始化失败错误', async () => {
      const { editor } = monacoMock.getMockApi()
      editor.create.mockImplementation(() => {
        throw new Error('初始化失败')
      })

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      await wrapper.vm.$nextTick()

      const error = wrapper.find('.editor-error')
      expect(error.exists()).toBe(true)
      expect(error.text()).toContain('初始化失败')
      expect(wrapper.find('.editor-loading').exists()).toBe(false)
    })

    it('错误信息应在指定时间后自动消失', async () => {
      const { editor } = monacoMock.getMockApi()
      editor.create.mockImplementation(() => {
        throw new Error('临时错误')
      })

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(true)

      // 前进 3 秒
      await vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.editor-error').exists()).toBe(false)
    })
  })

  describe('格式化错误', () => {
    it('应显示格式化失败错误', async () => {
      const { editor } = monacoMock.getMockApi()
      editor.create.mockReturnValue(mockEditor)

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      // 模拟格式化失败
      mockEditor.getAction.mockReturnValue({
        run: vi.fn().mockRejectedValue(new Error('格式化失败'))
      })

      const formatButton = wrapper.find('.editor-toolbar-button')
      await formatButton.trigger('click')
      await wrapper.vm.$nextTick()

      const error = wrapper.find('.editor-error')
      expect(error.exists()).toBe(true)
      expect(error.text()).toContain('格式化失败')
    })

    it('应正确处理格式化命令不可用的情况', async () => {
      const { editor } = monacoMock.getMockApi()
      editor.create.mockReturnValue(mockEditor)

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      // 模拟格式化命令不存在
      mockEditor.getAction.mockReturnValue(null)

      const formatButton = wrapper.find('.editor-toolbar-button')
      await formatButton.trigger('click')
      await wrapper.vm.$nextTick()

      const error = wrapper.find('.editor-error')
      expect(error.exists()).toBe(true)
      expect(error.text()).toContain('格式化命令不可用')
    })
  })

  describe('错误提示交互', () => {
    it('点击关闭按钮应隐藏错误信息', async () => {
      const { editor } = monacoMock.getMockApi()
      editor.create.mockImplementation(() => {
        throw new Error('测试错误')
      })

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      await wrapper.vm.$nextTick()
      const closeButton = wrapper.find('.error-close')
      expect(closeButton.exists()).toBe(true)

      await closeButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.editor-error').exists()).toBe(false)
    })

    it('新的错误应重置自动隐藏定时器', async () => {
      const { editor } = monacoMock.getMockApi()
      editor.create.mockReturnValue(mockEditor)

      const wrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      // 触发第一个错误
      mockEditor.getAction.mockReturnValue(null)
      await wrapper.find('.editor-toolbar-button').trigger('click')
      await wrapper.vm.$nextTick()

      // 前进 2 秒
      await vi.advanceTimersByTime(2000)

      // 触发第二个错误
      mockEditor.getAction.mockReturnValue(null)
      await wrapper.find('.editor-toolbar-button').trigger('click')
      await wrapper.vm.$nextTick()

      // 确认错误仍然显示
      expect(wrapper.find('.editor-error').exists()).toBe(true)

      // 前进 3 秒，错误应该消失
      await vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-error').exists()).toBe(false)
    })
  })

  describe('可访问性', () => {
    it('错误提示应有正确的 ARIA 属性', async () => {
      const { editor } = monacoMock.getMockApi()
      editor.create.mockImplementation(() => {
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