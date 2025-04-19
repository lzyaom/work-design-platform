import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  watch,
  shallowRef,
  computed,
  ref,
  useTemplateRef,
} from 'vue'
import type { PropType } from 'vue'
import './style.css'
import * as monaco from 'monaco-editor'
import type {
  MonacoEditorProps,
  MonacoEditorExpose,
  EditorScrollEvent,
  ToolbarButton,
  EditorInstance,
  EditorOptions,
} from './types'
import { defaultOptions, DEFAULT_THEME } from './types'
import { themeManager } from './themeManager'
import ThemeTransition from './ThemeTransition'
import EditorToolbar from './Toolbar'
import type { EditorTheme } from './themes'

export default defineComponent({
  name: 'MonacoEditor',
  components: {
    ThemeTransition,
    EditorToolbar,
  },

  props: {
    modelValue: {
      type: String,
      default: '',
      required: true,
    },
    language: {
      type: String,
      default: 'javascript',
    },
    theme: {
      type: String as PropType<EditorTheme>,
      default: DEFAULT_THEME,
    },
    options: {
      type: Object as PropType<EditorOptions>,
      default: () => ({}),
    },
    width: {
      type: [Number, String] as PropType<number | string>,
      default: '100%',
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: '300px',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    themeTransition: {
      type: Boolean,
      default: true,
    },
    themeSync: {
      type: Boolean,
      default: true,
    },
    showThemeSelector: {
      type: Boolean,
      default: true,
    },
    showToolbar: {
      type: Boolean,
      default: true,
    },
    toolbarPlacement: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'top',
    },
  },

  emits: {
    'update:modelValue': (value: string) => true,
    'update:theme': (theme: EditorTheme) => true,
    change: (value: string) => true,
    ready: (editor: monaco.editor.IStandaloneCodeEditor) => true,
    focus: () => true,
    blur: () => true,
    scroll: (event: EditorScrollEvent) => true,
    error: (error: Error) => true,
    format: (success: boolean) => true,
    'theme-change': (theme: string) => true,
  },

  setup(props: MonacoEditorProps, { emit, expose }) {
    const containerRef = useTemplateRef<HTMLDivElement | null>('containerRef')
    const editorRef = useTemplateRef<HTMLDivElement | null>('editorRef')
    const editorInstance = shallowRef<EditorInstance | null>(null)
    const loading = ref<boolean>(true)
    const error = ref<string | null>(null)
    const errorTimeout = ref<number | null>(null)

    const style = computed(() => ({
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    }))
    // 使用主题管理器同步主题
    const syncTheme = () => {
      if (props.themeSync) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'vs-dark'
          : 'vs'
        themeManager.setTheme(systemTheme)
        emit('theme-change', systemTheme)
      }
    }

    const handleThemeChange = (theme: EditorTheme) => {
      emit('update:theme', theme)
      emit('theme-change', theme)
      if (editorInstance.value) {
        monaco.editor.setTheme(theme)
      }
    }

    const showError = (message: string, duration = 3000) => {
      error.value = message
      emit('error', new Error(message))

      if (errorTimeout.value) {
        window.clearTimeout(errorTimeout.value)
      }

      errorTimeout.value = window.setTimeout(() => {
        error.value = null
        errorTimeout.value = null
      }, duration)
    }
    const hiddenError = () => {
      if (errorTimeout.value) {
        window.clearTimeout(errorTimeout.value)
        errorTimeout.value = null
      }
      error.value = null
    }
    // methods
    const getEditor = () => editorInstance.value

    const updateLayout = () => {
      editorInstance.value?.layout()
    }

    const formatCode = async () => {
      if (!editorInstance.value) return
      try {
        await editorInstance.value.getAction('editor.action.formatDocument')?.run()
        emit('format', true)
      } catch (err) {
        const message = err instanceof Error ? err.message : '格式化失败'
        showError(message)
        emit('format', false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey

      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (!e.shiftKey) {
              e.preventDefault()
              editorInstance.value?.trigger('keyboard', 'undo', null)
            }
            break
          case 'y':
            e.preventDefault()
            editorInstance.value?.trigger('keyboard', 'redo', null)
            break
          case 'f':
            if (!e.shiftKey) {
              e.preventDefault()
              editorInstance.value?.trigger('', 'actions.find', null)
            }
            break
          case 'h':
            e.preventDefault()
            editorInstance.value?.trigger('', 'editor.action.startFindReplaceAction', null)
            break
          case 's':
            if (!props.readonly) {
              e.preventDefault()
              formatCode()
            }
            break
        }
      }
    }

    const toolbarButtons = computed<ToolbarButton[]>(() => [
      {
        icon: '⟲',
        label: '撤销',
        action: () => editorInstance.value?.trigger('keyboard', 'undo', null),
        disabled: !editorInstance.value,
        tooltip: 'Ctrl+Z',
        shortcut: 'Ctrl+Z',
      },
      {
        icon: '⟳',
        label: '重做',
        action: () => editorInstance.value?.trigger('keyboard', 'redo', null),
        disabled: !editorInstance.value,
        tooltip: 'Ctrl+Y',
        shortcut: 'Ctrl+Y',
      },
      {
        icon: '⎘',
        label: '格式化',
        action: formatCode,
        disabled: !editorInstance.value || props.readonly,
        tooltip: 'Ctrl+Shift+F',
        shortcut: 'Ctrl+Shift+F',
      },
      {
        icon: '⌕',
        label: '查找',
        action: () => editorInstance.value?.trigger('', 'actions.find', null),
        disabled: !editorInstance.value,
        tooltip: 'Ctrl+F',
        shortcut: 'Ctrl+F',
      },
      {
        icon: '⇄',
        label: '替换',
        action: () =>
          editorInstance.value?.trigger('', 'editor.action.startFindReplaceAction', null),
        disabled: !editorInstance.value || props.readonly,
        tooltip: 'Ctrl+H',
        shortcut: 'Ctrl+H',
      },
    ])

    // 初始化编辑器
    const initializeEditor = () => {
      if (!editorRef.value) return

      try {
        loading.value = true
        error.value = null

        editorInstance.value = monaco.editor.create(editorRef.value, {
          ...defaultOptions,
          value: props.modelValue,
          language: props.language,
          theme: props.theme,
          readOnly: props.readonly,
          ...(props.options || {}),
        } as monaco.editor.IStandaloneEditorConstructionOptions)

        const disposables = [
          editorInstance.value.onDidChangeModelContent(() => {
            const value = editorInstance.value?.getValue() || ''
            emit('update:modelValue', value)
            emit('change', value)
          }),
          editorInstance.value.onDidFocusEditorText(() => {
            emit('focus')
          }),
          editorInstance.value.onDidBlurEditorText(() => {
            emit('blur')
          }),
          editorInstance.value.onDidScrollChange((e) => {
            const scrollEvent: EditorScrollEvent = {
              scrollTop: e.scrollTop,
              scrollLeft: e.scrollLeft,
              scrollWidth: e.scrollWidth,
              scrollHeight: e.scrollHeight,
              scrollTopChanged: e.scrollTopChanged,
              scrollLeftChanged: e.scrollLeftChanged,
            }
            emit('scroll', scrollEvent)
          }),
        ]

        containerRef.value?.addEventListener('keydown', handleKeyDown)
        emit('ready', editorInstance.value)
        loading.value = false

        onBeforeUnmount(() => {
          disposables.forEach((d) => d.dispose())
          containerRef.value?.removeEventListener('keydown', handleKeyDown)
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : '初始化编辑器失败'
        showError(message)
        loading.value = false
      }
    }

    const undo = () => {
      editorInstance.value?.trigger('keyboard', 'undo', null)
    }

    const redo = () => {
      editorInstance.value?.trigger('keyboard', 'redo', null)
    }

    const getSelection = () => {
      if (!editorInstance.value) return
      const selection = editorInstance.value.getSelection()
      if (!selection) return
      return editorInstance.value.getModel()?.getValueInRange(selection)
    }

    const setSelection = (start: monaco.IPosition, end: monaco.IPosition) => {
      editorInstance.value?.setSelection(
        new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
      )
    }

    const insertText = (text: string) => {
      editorInstance.value?.trigger('keyboard', 'type', { text })
    }

    const replaceSelection = (text: string) => {
      if (!editorInstance.value) return
      const selection = editorInstance.value.getSelection()
      if (!selection) return
      editorInstance.value.executeEdits('', [
        {
          range: selection,
          text,
          forceMoveMarkers: true,
        },
      ])
    }

    const revealPosition = (position: monaco.IPosition) => {
      editorInstance.value?.revealPositionInCenter(position)
    }

    const revealLine = (lineNumber: number) => {
      editorInstance.value?.revealLineInCenter(lineNumber)
    }

    const setPosition = (position: monaco.IPosition) => {
      editorInstance.value?.setPosition(position)
    }

    const getPosition = () => {
      return editorInstance.value?.getPosition() || null
    }

    const getDecorations = () => {
      return editorInstance.value?.getModel()?.getAllDecorations() || []
    }

    const addDecoration = (
      range: monaco.IRange,
      options: monaco.editor.IModelDecorationOptions,
    ) => {
      return (
        editorInstance.value?.deltaDecorations(
          [],
          [
            {
              range,
              options,
            },
          ],
        ) || []
      )
    }

    const removeDecoration = (decorationId: string) => {
      editorInstance.value?.deltaDecorations([decorationId], [])
    }

    const clearDecorations = () => {
      const decorations = getDecorations()
      if (decorations.length > 0) {
        editorInstance.value?.deltaDecorations(
          decorations.map((d) => d.id),
          [],
        )
      }
    }

    // 监听属性变化
    watch(
      () => props.modelValue,
      (newValue) => {
        if (editorInstance.value && newValue !== editorInstance.value.getValue()) {
          editorInstance.value.setValue(newValue)
        }
      },
    )

    watch(
      () => [props.language, props.theme, props.options],
      () => {
        if (!editorInstance.value) return

        monaco.editor.setTheme(props.theme)

        const model = editorInstance.value.getModel()
        if (model) {
          monaco.editor.setModelLanguage(model, props.language)
        }

        editorInstance.value.updateOptions({
          ...props.options,
          readOnly: props.readonly,
        })
      },
    )

    watch(
      () => props.readonly,
      (newReadonly) => {
        editorInstance.value?.updateOptions({ readOnly: newReadonly })
      },
    )

    watch(
      () => [props.width, props.height],
      () => updateLayout(),
    )

    // 生命周期
    onMounted(() => {
      initializeEditor()
      if (props.themeSync) {
        syncTheme()
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme)
      }
    })

    onBeforeUnmount(() => {
      if (props.themeSync) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', syncTheme)
      }
      if (editorInstance.value) {
        editorInstance.value.getModel()?.dispose()
        editorInstance.value.dispose()
      }
    })

    // expose
    expose({
      getEditor,
      formatCode,
      updateLayout,
      undo,
      redo,
      getSelection,
      setSelection,
      insertText,
      replaceSelection,
      revealPosition,
      revealLine,
      setPosition,
      getPosition,
      getDecorations,
      addDecoration,
      removeDecoration,
      clearDecorations,
    } as MonacoEditorExpose)
    return {
      containerRef,
      editorRef,
      formatCode,
      loading,
      error,
      style,
      toolbarButtons,
      handleThemeChange,
      hiddenError,
    }
  },

  render() {
    return (
      <div
        ref="containerRef"
        class="monaco-editor-container"
        data-theme={this.theme === 'vs-dark' ? 'dark' : 'light'}
        tabindex="-1"
        role="application"
        aria-label="代码编辑器"
      >
        {this.showToolbar && this.toolbarPlacement === 'top' && (
          <EditorToolbar
            theme={this.theme}
            placement={this.toolbarPlacement}
            showThemeSelector={this.showThemeSelector}
            buttons={this.toolbarButtons}
            onUpdate:theme={this.handleThemeChange}
            onTheme-change={this.handleThemeChange}
          />
        )}
        {this.themeTransition && <ThemeTransition />}
        <div class="editor-content">
          <div ref="editorRef" style={this.style} />
          {this.loading && (
            <div class="editor-loading" role="status">
              <div class="editor-loading-spinner" aria-hidden="true" />
              <span class="editor-loading-text">加载中...</span>
            </div>
          )}
          {this.error && (
            <div class="editor-error show" role="alert">
              <span class="error-icon" aria-hidden="true">
                ⚠️
              </span>
              <span class="error-message">{this.error}</span>
              <button class="error-close" onClick={this.hiddenError} aria-label="关闭错误提示">
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    )
  },
})
