import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import MonacoEditor from '../index'
import type { MonacoEditorProps } from '../types'
import * as monaco from 'monaco-editor'

describe('MonacoEditor', () => {
  let monacoMock: {
    editor: {
      create: Mock
      setModelLanguage: Mock
      setTheme: Mock
    }
  }

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()

    // 创建 monaco editor mock
    monacoMock = {
      editor: {
        create: vi.fn(() => ({
          dispose: vi.fn(),
          onDidChangeModelContent: vi.fn(() => ({ dispose: vi.fn() })),
          getModel: vi.fn(() => ({
            dispose: vi.fn()
          })),
          layout: vi.fn(),
          setValue: vi.fn(),
          getValue: vi.fn(() => 'test content')
        })),
        setModelLanguage: vi.fn(),
        setTheme: vi.fn()
      }
    }
    vi.mock('monaco-editor', () => monacoMock)
  })

  it('应正确渲染编辑器组件', () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'initial content',
        language: 'javascript',
        theme: 'vs-dark'
      }
    })
    
    expect(wrapper.find('.monaco-editor-container').exists()).toBe(true)
    expect(monacoMock.editor.create).toHaveBeenCalled()
  })

  it('应在值变化时更新编辑器内容', async () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'initial content',
        language: 'javascript',
        theme: 'vs-dark'
      }
    })

    // 更新 props
    await wrapper.setProps({
      modelValue: 'updated content'
    })

    const mockEditor = monacoMock.editor.create()
    expect(mockEditor.setValue).toHaveBeenCalledWith('updated content')
  })

  it('应在编辑器内容变化时触发 update:modelValue 事件', async () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'initial content',
        language: 'javascript',
        theme: 'vs-dark'
      }
    })

    const mockEditor = monacoMock.editor.create()
    const changeCallback = mockEditor.onDidChangeModelContent.mock.calls[0][0]
    
    // 模拟编辑器内容变化
    mockEditor.getValue.mockReturnValueOnce('changed content')
    changeCallback()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['changed content'])
  })

  it('应在组件销毁时清理资源', () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'initial content',
        language: 'javascript',
        theme: 'vs-dark'
      }
    })

    const mockEditor = monacoMock.editor.create()
    const mockModel = mockEditor.getModel()

    wrapper.unmount()

    expect(mockModel.dispose).toHaveBeenCalled()
    expect(mockEditor.dispose).toHaveBeenCalled()
  })

  it('应正确处理编辑器选项', () => {
    const customOptions = {
      minimap: { enabled: true },
      lineNumbers: 'off' as const,
      wordWrap: 'on' as const
    }

    mount(MonacoEditor, {
      props: {
        modelValue: 'initial content',
        language: 'javascript',
        theme: 'vs-dark',
        options: customOptions
      }
    })

    expect(monacoMock.editor.create).toHaveBeenCalledWith(
      expect.any(Element),
      expect.objectContaining(customOptions)
    )
  })

  it('应支持编辑器方法', () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'initial content',
        language: 'javascript',
        theme: 'vs-dark'
      }
    })

    const mockEditor = monacoMock.editor.create()
    mockEditor.layout = vi.fn()

    // 测试 expose 的方法
    const vm = wrapper.vm as any
    vm.updateLayout()
    expect(mockEditor.layout).toHaveBeenCalled()
  })
})