import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import MonacoEditor from '../index'
import type { MonacoEditorProps, MonacoEditorExpose } from '../types'
import type * as monacoEditor from 'monaco-editor'

// Mock monaco-editor
const mockMonaco = {
  editor: {
    create: vi.fn(),
    createModel: vi.fn(),
    setModelLanguage: vi.fn(),
    setTheme: vi.fn(),
    KeyMod: {
      CtrlCmd: 2048
    } as const,
    KeyCode: {
      KeyF: 33
    } as const
  }
}

const createMockEditor = () => {
  const mockModel = {
    getValue: vi.fn(() => 'test content'),
    setValue: vi.fn(),
    dispose: vi.fn(),
  }

  const mockEditor = {
    getValue: vi.fn(() => 'test content'),
    setValue: vi.fn(),
    getModel: vi.fn(() => mockModel),
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
    addCommand: vi.fn(),
  }

  mockMonaco.editor.create.mockReturnValue(mockEditor)
  mockMonaco.editor.createModel.mockReturnValue(mockModel)

  return { mockEditor, mockModel }
}

vi.mock('monaco-editor', () => mockMonaco)

describe('MonacoEditor', () => {
  let wrapper: ReturnType<typeof mount<typeof MonacoEditor>>
  let mockEditor: ReturnType<typeof createMockEditor>['mockEditor']

  const defaultProps: MonacoEditorProps = {
    value: 'initial content',
    language: 'javascript',
    theme: 'vs-dark',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockEditor()
    mockEditor = mocks.mockEditor
    wrapper = mount(MonacoEditor, {
      props: defaultProps,
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('基础功能', () => {
    it('创建时应设置正确的初始值', () => {
      expect(mockMonaco.editor.create).toHaveBeenCalled()
      const createCall = mockMonaco.editor.create.mock.calls[0]
      expect(createCall[1]).toMatchObject({
        theme: 'vs-dark',
        value: 'initial content'
      })
    })

    it('当内容变化时应触发更新事件', async () => {
      mockEditor.getValue.mockReturnValue('new content')
      mockEditor.onDidChangeModelContent.mock.calls[0][0]()

      expect(wrapper.emitted('update:value')?.[0]).toEqual(['new content'])
      expect(wrapper.emitted('change')?.[0]).toEqual(['new content'])
    })
  })

  describe('属性更新', () => {
    it('当属性变化时应更新编辑器', async () => {
      await wrapper.setProps({
        language: 'typescript',
        theme: 'vs-light',
        value: 'updated content'
      })

      expect(mockMonaco.editor.setModelLanguage).toHaveBeenCalledWith(
        mockEditor.getModel(),
        'typescript'
      )
      expect(mockMonaco.editor.setTheme).toHaveBeenCalledWith('vs-light')
      expect(mockEditor.setValue).toHaveBeenCalledWith('updated content')
    })

    it('当尺寸变化时应更新布局', async () => {
      await wrapper.setProps({
        width: 500,
        height: 300
      })

      expect(mockEditor.layout).toHaveBeenCalled()
    })
  })

  describe('编辑器实例', () => {
    it('组件销毁时应清理资源', () => {
      wrapper.unmount()
      const mockModel = mockEditor.getModel()

      expect(mockModel.dispose).toHaveBeenCalled()
      expect(mockEditor.dispose).toHaveBeenCalled()
    })

    it('应暴露正确的方法', () => {
      const exposed = wrapper.vm as unknown as MonacoEditorExpose

      expect(exposed.getEditor).toBeDefined()
      expect(exposed.formatCode).toBeDefined()
      expect(exposed.updateLayout).toBeDefined()
    })
  })

  describe('格式化功能', () => {
    it('格式化代码应正确执行', async () => {
      const exposed = wrapper.vm as unknown as MonacoEditorExpose
      await exposed.formatCode()

      expect(mockEditor.getAction).toHaveBeenCalledWith('editor.action.formatDocument')
      expect(mockEditor.getAction().run).toHaveBeenCalled()
    })

    it('格式化快捷键应正确注册', () => {
      expect(mockEditor.addCommand).toHaveBeenCalledWith(
        mockMonaco.editor.KeyMod.CtrlCmd | mockMonaco.editor.KeyCode.KeyF,
        expect.any(Function)
      )
    })
  })

  describe('加载状态', () => {
    it('初始化时应显示加载状态', () => {
      expect(wrapper.find('.editor-loading').exists()).toBe(true)
    })

    it('编辑器就绪后应隐藏加载状态', async () => {
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.editor-loading').exists()).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('初始化失败时应显示错误信息', async () => {
      mockMonaco.editor.create.mockImplementationOnce(() => {
        throw new Error('初始化失败')
      })

      const errorWrapper = mount(MonacoEditor, {
        props: defaultProps
      })

      await errorWrapper.vm.$nextTick()
      expect(errorWrapper.find('.editor-error').exists()).toBe(true)
      expect(errorWrapper.find('.editor-error').text()).toContain('初始化失败')
    })
  })
})