import type { editor, IPosition, IRange } from 'monaco-editor'
import type { EditorTheme } from './themes'

// 工具栏按钮
export interface ToolbarButton {
  icon: string
  label: string
  action: () => void
  disabled?: boolean
  tooltip?: string
  shortcut?: string
}

// 编辑器滚动事件
export interface EditorScrollEvent {
  scrollTop: number
  scrollLeft: number
  scrollWidth: number
  scrollHeight: number
  scrollTopChanged: boolean
  scrollLeftChanged: boolean
}

export interface MonacoEditorProps {
  /**
   * 编辑器内容
   * @default ''
   */
  modelValue: string
  /**
   * 编程语言
   * @default 'javascript'
   */
  language: string

  /**
   * 编辑器主题
   * @default 'vs-dark'
   */
  theme: EditorTheme
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
  /**
   * 只读模式
   * @default false
   */
  readonly?: boolean
  // 新增主题切换相关配置
  themeTransition?: boolean
  // 是否与系统主题同步
  themeSync?: boolean
  // 是否显示主题选择器
  showThemeSelector?: boolean
  // 显示工具栏
  showToolbar?: boolean
  // 工具栏位置
  toolbarPlacement?: 'top' | 'bottom' | 'left' | 'right'
}

export interface MonacoEditorEmits {
  /**
   * 更新编辑器内容
   * @default ''
   * @param value 编辑器内容
   */
  'update:modelValue': (value: string) => void
  /**
   * 内容变更事件
   * @param value 变更后的内容
   */
  change: (value: string) => void
  /**
   * 编辑器就绪事件
   * @param editor 编辑器实例
   */
  ready: (editor: editor.IStandaloneCodeEditor) => void
  /**
   * 获得焦点事件
   */
  focus: () => void
  // 失去焦点事件
  blur: () => void
  // 滚动事件
  scroll: (event: EditorScrollEvent) => void
  /**
   * 初始化错误事件
   * @param error 编辑器实例
   */
  error: (error: Error) => void
  /**
   * 格式化完成事件
   * @param success 是否成功
   */
  format: (success: boolean) => void
}

// 编辑器实例类型
export type EditorInstance = editor.IStandaloneCodeEditor

// 编辑器选项类型
export type EditorOptions = editor.IStandaloneEditorConstructionOptions

// 编辑器暴露方法
export interface MonacoEditorExpose {
  /**
   * 获取编辑器实例
   * @returns EditorInstance
   */
  getEditor: () => EditorInstance | null
  /**
   * 格式化代码
   * @returns Promise<void>
   */
  formatCode: () => Promise<void>
  // 更新布局
  updateLayout: () => void
  // 撤销
  undo: () => void
  // 重做
  redo: () => void
  /**
   * 获取选中的文本
   * @returns 选中的文本
   */
  getSelection: () => string | undefined
  /**
   * 设置选中范围
   * @param start 选中开始位置
   * @param end 选中结束位置
   */
  setSelection: (start: IPosition, end: IPosition) => void
  /**
   * 在光标位置插入文本
   * @param text 插入的文本
   */
  insertText: (text: string) => void
  /**
   * 替换选中的文本
   * @param text 替换的文本
   */
  replaceSelection: (text: string) => void

  revealPosition: (position: IPosition) => void

  revealLine: (lineNumber: number) => void
  /**
   * 跳转到指定位置
   * @param position 光标位置
   */
  setPosition: (position: IPosition) => void
  /**
   * 获取当前位置
   * @returns 光标位置
   */
  getPosition: () => IPosition | null
  // 获取所有装饰器
  getDecorations: () => editor.IModelDecoration[]
  /**
   * 添加装饰器
   * @param range 装饰器范围
   * @param options 装饰器选项
   * @returns 装饰器 ID 数组
   */
  addDecoration: (range: IRange, options: editor.IModelDecorationOptions) => string[]
  removeDecoration: (decorationId: string) => void
  // 清除所有装饰器
  clearDecorations: () => void
}

// 编辑器样式类型
export interface EditorStyle {
  width: string
  height: string
}

// 默认编辑器选项
export const defaultOptions: EditorOptions = {
  automaticLayout: true,
  fontSize: 14,
  lineHeight: 21,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  renderWhitespace: 'selection',
  renderLineHighlight: 'line',
  fixedOverflowWidgets: true,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  quickSuggestions: true,
  lineNumbers: 'on' as const,
  roundedSelection: true,
  guides: {
    indentation: true,
    bracketPairs: true,
    highlightActiveIndentation: true,
    bracketPairsHorizontal: true,
    highlightActiveBracketPair: true,
  },
  renderFinalNewline: 'on',
  trimAutoWhitespace: true,
  bracketPairColorization: { enabled: true },
  scrollbar: {
    vertical: 'visible',
    horizontal: 'visible',
    useShadows: true,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
  overviewRulerBorder: false,
  folding: true,
  formatOnPaste: true,
  formatOnType: false,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  snippetSuggestions: 'inline',
  tabCompletion: 'on',
  wordBasedSuggestions: 'currentDocument',
  parameterHints: {
    enabled: true,
    cycle: true,
  },
  codeLens: true,
  lightbulb: {
    enabled: 'auto' as editor.ShowLightbulbIconMode,
  },
  renderControlCharacters: false,
  colorDecorators: true,
  cursorBlinking: 'smooth',
  mouseWheelZoom: true,
  extraEditorClassName: 'monaco-editor-content',
  renderValidationDecorations: 'on',
  quickSuggestionsDelay: 10,
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  autoSurround: 'languageDefined',
  comments: {
    ignoreEmptyLines: true,
    insertSpace: true,
  },
  contextmenu: true,
  copyWithSyntaxHighlighting: true,
  dragAndDrop: true,
  links: true,
  multiCursorModifier: 'alt',
  occurrencesHighlight: 'singleFile',
  showFoldingControls: 'mouseover',
  suggest: {
    insertMode: 'insert',
    filterGraceful: true,
    snippetsPreventQuickSuggestions: false,
    showIcons: true,
    showStatusBar: true,
    preview: true,
    previewMode: 'prefix',
    shareSuggestSelections: true,
    showDeprecated: true,
    matchOnWordStartOnly: false,
    selectionMode: 'always',
    defaultSelection: 'first',
  } as editor.ISuggestOptions,
}

// 默认主题
export const DEFAULT_THEME = 'vs-dark' as const
