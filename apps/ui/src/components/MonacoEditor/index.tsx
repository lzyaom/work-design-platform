import { defineComponent, onMounted, onBeforeUnmount, watch, shallowRef, computed, ref } from 'vue'
import './style.css'
import * as monaco from 'monaco-editor'
import type { MonacoEditorProps, MonacoEditorExpose } from './types'
import { defaultOptions } from './types'

export default defineComponent({
  name: 'MonacoEditor',
  
  props: {
    value: {
      type: String,
      default: '',
      required: true
    },
    language: {
      type: String,
      default: 'javascript',
      required: true
    },
    theme: {
      type: String,
      default: 'vs-dark',
      required: true
    },
    options: {
      type: Object as () => monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions,
      default: () => ({})
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    height: {
      type: [Number, String],
      default: '300px'
    }
  },

  emits: {
    'update:value': (value: string) => true,
    'change': (value: string) => true,
    'ready': (editor: monaco.editor.IStandaloneCodeEditor) => true
  },

  setup(props: MonacoEditorProps, { emit, expose }) {
    // refs
    const editorRef = shallowRef<HTMLElement>()
    const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor>()
    const loading = ref(true)
    const error = ref<string | null>(null)
    const errorTimeout = ref<number | null>(null)
    
    // 显示错误信息
    const showError = (message: string, duration = 3000) => {
      error.value = message
      // 清除之前的定时器
      if (errorTimeout.value) {
        window.clearTimeout(errorTimeout.value)
      }
      // 设置新的定时器
      errorTimeout.value = window.setTimeout(() => {
        error.value = null
        errorTimeout.value = null
      }, duration)
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
      } catch (err) {
        const message = err instanceof Error ? err.message : '格式化失败'
        showError(message)
      }
    }

    const initializeEditor = async () => {
      if (!editorRef.value) return

      try {
        loading.value = true
        error.value = null

        // 创建编辑器
        editorInstance.value = monaco.editor.create(editorRef.value, {
          ...defaultOptions,
          value: props.value,
          language: props.language,
          theme: props.theme,
          ...(props.options || {})
        } as monaco.editor.IStandaloneEditorConstructionOptions)

        // 配置编辑器
        editorInstance.value.onDidChangeModelContent(() => {
          const value = editorInstance.value?.getValue() || ''
          emit('update:value', value)
          emit('change', value)
        })

        // 添加快捷键和命令
        try {
          editorInstance.value.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
            formatCode
          )
        } catch (err) {
          // 处理快捷键注册失败的情况
          const message = err instanceof Error? err.message : '快捷键注册失败'
          showError(message)
          console.warn('快捷键注册失败:', err)
        }

        // 触发ready事件
        emit('ready', editorInstance.value)
        loading.value = false
      } catch (err) {
        console.error('初始化编辑器失败:', err)
        const message = err instanceof Error ? err.message : '初始化编辑器失败'
        showError(message)
        loading.value = false
      }
    }

    // watchers
    watch(
      () => props.value,
      (newValue) => {
        if (editorInstance.value && newValue !== editorInstance.value.getValue()) {
          editorInstance.value.setValue(newValue)
        }
      }
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

        editorInstance.value.updateOptions(props.options || {})
      }
    )

    watch(
      () => [props.width, props.height],
      () => updateLayout()
    )

    // lifecycle
    onMounted(() => {
      initializeEditor()
    })

    onBeforeUnmount(() => {
      if (editorInstance.value) {
        editorInstance.value.getModel()?.dispose()
        editorInstance.value.dispose()
      }
    })

    // expose
    expose({
      getEditor,
      formatCode,
      updateLayout
    })

    // template refs and methods
    return {
      editorRef,
      formatCode,
      loading,
      error,
      style: computed(() => ({
        width: typeof props.width === 'number' ? `${props.width}px` : props.width,
        height: typeof props.height === 'number' ? `${props.height}px` : props.height
      }))
    }
  },

  render() {
    const containerTheme = this.theme === 'vs-dark' ? 'dark' : 'light'

    return (
      <div class="monaco-editor-container" data-theme={containerTheme}>
        <div class="editor-toolbar">
          <button
            class="editor-toolbar-button"
            onClick={this.formatCode}
            title="格式化代码 (Ctrl/Cmd + F)"
          >
            <i class="editor-icon editor-icon-format" />
            格式化
          </button>
        </div>
        <div class="editor-content">
          <div
            ref="editorRef"
            style={this.style}
          />
          {this.loading && (
            <div class="editor-loading">
              <div class="editor-loading-spinner" />
            </div>
          )}
          {this.error && (
            <div class="editor-error show" role="alert">
              <span class="error-icon">⚠️</span>
              <span class="error-message">{this.error}</span>
              <button
                class="error-close"
                onClick={() => this.error = null}
                aria-label="关闭错误提示"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
})