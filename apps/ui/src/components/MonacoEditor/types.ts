import type { editor } from 'monaco-editor'

export interface MonacoEditorProps {
  /**
   * 编辑器内容
   * @default ''
   */
  value: string

  /**
   * 编程语言
   * @default 'javascript'
   */
  language: string

  /**
   * 编辑器主题
   * @default 'vs-dark'
   */
  theme: string

  /**
   * Monaco Editor 配置项
   * @see https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneEditorConstructionOptions.html
   */
  options?: editor.IStandaloneEditorConstructionOptions

  /**
   * 编辑器宽度
   * @default '100%'
   */
  width?: number | string

  /**
   * 编辑器高度
   * @default '300px'
   */
  height?: number | string
}

export interface MonacoEditorEmits {
  /**
   * 更新编辑器内容
   */
  'update:value': [value: string]

  /**
   * 内容变更事件
   */
  'change': [value: string]

  /**
   * 编辑器就绪事件
   */
  'ready': [editor: editor.IStandaloneCodeEditor]
}

export interface MonacoEditorExpose {
  /**
   * 获取编辑器实例
   */
  getEditor: () => editor.IStandaloneCodeEditor | undefined
  
  /**
   * 格式化代码
   */
  formatCode: () => Promise<void>

  /**
   * 更新编辑器大小
   */
  updateLayout: () => void
}

/**
 * 编辑器默认配置
 */
export const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  minimap: {
    enabled: false
  },
  scrollBeyondLastLine: false,
  lineNumbers: 'on',
  roundedSelection: false,
  readOnly: false,
  cursorStyle: 'line',
  selectOnLineNumbers: true,
  contextmenu: true,
  wordWrap: 'off',
  fontSize: 14,
  tabSize: 2,
  folding: true,
  suggestOnTriggerCharacters: true,
  snippetSuggestions: 'inline',
  scrollbar: {
    vertical: 'visible',
    horizontal: 'visible',
    useShadows: false,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10
  }
}