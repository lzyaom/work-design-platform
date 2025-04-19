import * as monaco from 'monaco-editor'

// 编辑器主题类型
export type EditorTheme =
  | 'vs'
  | 'vs-dark'
  | 'hc-black'
  | 'github-light'
  | 'github-dark'
  | 'monokai'
  | 'dracula'
  | 'solarized-light'
  | 'solarized-dark'

// 主题变量接口
export interface ThemeVariables {
  '--editor-background': string
  '--editor-foreground': string
  '--editor-loading-color': string
  '--editor-error-background': string
  '--editor-error-border': string
  '--editor-error-foreground': string
  '--editor-border-color': string
  '--editor-toolbar-background': string
  '--editor-toolbar-hover': string
  '--editor-toolbar-active': string
}

// 基础主题变量
const baseThemes: Record<string, ThemeVariables> = {
  vs: {
    '--editor-background': '#ffffff',
    '--editor-foreground': '#000000',
    '--editor-loading-color': '#0078d4',
    '--editor-error-background': 'rgba(205, 43, 49, 0.1)',
    '--editor-error-border': 'rgba(205, 43, 49, 0.2)',
    '--editor-error-foreground': '#cd2b31',
    '--editor-border-color': '#e5e5e5',
    '--editor-toolbar-background': '#f5f5f5',
    '--editor-toolbar-hover': 'rgba(0, 0, 0, 0.05)',
    '--editor-toolbar-active': 'rgba(0, 0, 0, 0.1)',
  },
  'vs-dark': {
    '--editor-background': '#1e1e1e',
    '--editor-foreground': '#d4d4d4',
    '--editor-loading-color': '#0078d4',
    '--editor-error-background': 'rgba(255, 71, 71, 0.1)',
    '--editor-error-border': 'rgba(255, 71, 71, 0.2)',
    '--editor-error-foreground': '#ff4747',
    '--editor-border-color': '#404040',
    '--editor-toolbar-background': '#2d2d2d',
    '--editor-toolbar-hover': 'rgba(255, 255, 255, 0.05)',
    '--editor-toolbar-active': 'rgba(255, 255, 255, 0.1)',
  },
  'hc-black': {
    '--editor-background': '#000000',
    '--editor-foreground': '#ffffff',
    '--editor-loading-color': '#0078d4',
    '--editor-error-background': '#ff0000',
    '--editor-error-border': '#ff0000',
    '--editor-error-foreground': '#ffffff',
    '--editor-border-color': '#ffffff',
    '--editor-toolbar-background': '#000000',
    '--editor-toolbar-hover': '#ffffff',
    '--editor-toolbar-active': '#ffffff',
  },
}

// GitHub Light 主题
export const githubLight: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6a737d' },
    { token: 'keyword', foreground: 'd73a49' },
    { token: 'string', foreground: '032f62' },
    { token: 'number', foreground: '005cc5' },
    { token: 'type', foreground: '6f42c1' },
    { token: 'class', foreground: '6f42c1' },
    { token: 'interface', foreground: '6f42c1' },
    { token: 'function', foreground: '6f42c1' },
    { token: 'variable', foreground: '24292e' },
    { token: 'variable.predefined', foreground: '005cc5' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#24292e',
    'editor.lineHighlightBackground': '#f6f8fa',
    'editor.selectionBackground': '#0366d625',
    'editor.inactiveSelectionBackground': '#0366d610',
  },
}

// GitHub Dark 主题
export const githubDark: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6a737d' },
    { token: 'keyword', foreground: 'ff7b72' },
    { token: 'string', foreground: 'a5d6ff' },
    { token: 'number', foreground: '79c0ff' },
    { token: 'type', foreground: 'd2a8ff' },
    { token: 'class', foreground: 'd2a8ff' },
    { token: 'interface', foreground: 'd2a8ff' },
    { token: 'function', foreground: 'd2a8ff' },
    { token: 'variable', foreground: 'c9d1d9' },
    { token: 'variable.predefined', foreground: '79c0ff' },
  ],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#c9d1d9',
    'editor.lineHighlightBackground': '#161b22',
    'editor.selectionBackground': '#264f7840',
    'editor.inactiveSelectionBackground': '#264f7820',
  },
}

// Monokai 主题
export const monokai: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '88846f' },
    { token: 'keyword', foreground: 'f92672' },
    { token: 'string', foreground: 'e6db74' },
    { token: 'number', foreground: 'ae81ff' },
    { token: 'type', foreground: '66d9ef' },
    { token: 'class', foreground: 'a6e22e' },
    { token: 'interface', foreground: '66d9ef' },
    { token: 'function', foreground: 'a6e22e' },
    { token: 'variable', foreground: 'f8f8f2' },
  ],
  colors: {
    'editor.background': '#272822',
    'editor.foreground': '#f8f8f2',
    'editor.lineHighlightBackground': '#3e3d32',
    'editor.selectionBackground': '#49483e',
    'editor.inactiveSelectionBackground': '#49483e80',
  },
}

// Dracula 主题
export const dracula: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6272a4' },
    { token: 'keyword', foreground: 'ff79c6' },
    { token: 'string', foreground: 'f1fa8c' },
    { token: 'number', foreground: 'bd93f9' },
    { token: 'type', foreground: '8be9fd' },
    { token: 'class', foreground: '50fa7b' },
    { token: 'interface', foreground: '8be9fd' },
    { token: 'function', foreground: '50fa7b' },
    { token: 'variable', foreground: 'f8f8f2' },
  ],
  colors: {
    'editor.background': '#282a36',
    'editor.foreground': '#f8f8f2',
    'editor.lineHighlightBackground': '#44475a',
    'editor.selectionBackground': '#44475a',
    'editor.inactiveSelectionBackground': '#44475a80',
  },
}

// Solarized Light 主题
export const solarizedLight: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '93a1a1' },
    { token: 'keyword', foreground: '859900' },
    { token: 'string', foreground: '2aa198' },
    { token: 'number', foreground: 'cb4b16' },
    { token: 'type', foreground: '268bd2' },
    { token: 'class', foreground: '268bd2' },
    { token: 'interface', foreground: '268bd2' },
    { token: 'function', foreground: '268bd2' },
    { token: 'variable', foreground: '657b83' },
  ],
  colors: {
    'editor.background': '#fdf6e3',
    'editor.foreground': '#657b83',
    'editor.lineHighlightBackground': '#eee8d5',
    'editor.selectionBackground': '#eee8d5',
    'editor.inactiveSelectionBackground': '#eee8d580',
  },
}

// Solarized Dark 主题
export const solarizedDark: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '586e75' },
    { token: 'keyword', foreground: '859900' },
    { token: 'string', foreground: '2aa198' },
    { token: 'number', foreground: 'cb4b16' },
    { token: 'type', foreground: '268bd2' },
    { token: 'class', foreground: '268bd2' },
    { token: 'interface', foreground: '268bd2' },
    { token: 'function', foreground: '268bd2' },
    { token: 'variable', foreground: '839496' },
  ],
  colors: {
    'editor.background': '#002b36',
    'editor.foreground': '#839496',
    'editor.lineHighlightBackground': '#073642',
    'editor.selectionBackground': '#073642',
    'editor.inactiveSelectionBackground': '#07364280',
  },
}

// 自定义主题变量
const customThemes: Record<string, ThemeVariables> = {
  'github-light': {
    ...baseThemes['vs'],
    '--editor-loading-color': '#0366d6',
    '--editor-error-background': 'rgba(203, 36, 49, 0.1)',
    '--editor-error-border': 'rgba(203, 36, 49, 0.2)',
    '--editor-error-foreground': '#cb2431',
    '--editor-border-color': '#e1e4e8',
    '--editor-toolbar-background': '#f6f8fa',
    '--editor-toolbar-hover': 'rgba(3, 102, 214, 0.05)',
    '--editor-toolbar-active': 'rgba(3, 102, 214, 0.1)',
  },
  'github-dark': {
    ...baseThemes['vs-dark'],
    '--editor-loading-color': '#58a6ff',
    '--editor-error-background': 'rgba(248, 81, 73, 0.1)',
    '--editor-error-border': 'rgba(248, 81, 73, 0.2)',
    '--editor-error-foreground': '#f85149',
    '--editor-border-color': '#30363d',
    '--editor-toolbar-background': '#161b22',
    '--editor-toolbar-hover': 'rgba(88, 166, 255, 0.05)',
    '--editor-toolbar-active': 'rgba(88, 166, 255, 0.1)',
  },
  monokai: {
    ...baseThemes['vs-dark'],
    '--editor-loading-color': '#a6e22e',
    '--editor-error-background': 'rgba(249, 38, 114, 0.1)',
    '--editor-error-border': 'rgba(249, 38, 114, 0.2)',
    '--editor-error-foreground': '#f92672',
    '--editor-border-color': '#49483e',
    '--editor-toolbar-background': '#3e3d32',
    '--editor-toolbar-hover': 'rgba(166, 226, 46, 0.05)',
    '--editor-toolbar-active': 'rgba(166, 226, 46, 0.1)',
  },
  dracula: {
    ...baseThemes['vs-dark'],
    '--editor-loading-color': '#50fa7b',
    '--editor-error-background': 'rgba(255, 121, 198, 0.1)',
    '--editor-error-border': 'rgba(255, 121, 198, 0.2)',
    '--editor-error-foreground': '#ff79c6',
    '--editor-border-color': '#44475a',
    '--editor-toolbar-background': '#282a36',
    '--editor-toolbar-hover': 'rgba(80, 250, 123, 0.05)',
    '--editor-toolbar-active': 'rgba(80, 250, 123, 0.1)',
  },
  'solarized-light': {
    ...baseThemes['vs'],
    '--editor-loading-color': '#268bd2',
    '--editor-error-background': 'rgba(203, 75, 22, 0.1)',
    '--editor-error-border': 'rgba(203, 75, 22, 0.2)',
    '--editor-error-foreground': '#cb4b16',
    '--editor-border-color': '#eee8d5',
    '--editor-toolbar-background': '#eee8d5',
    '--editor-toolbar-hover': 'rgba(38, 139, 210, 0.05)',
    '--editor-toolbar-active': 'rgba(38, 139, 210, 0.1)',
  },
  'solarized-dark': {
    ...baseThemes['vs-dark'],
    '--editor-loading-color': '#268bd2',
    '--editor-error-background': 'rgba(203, 75, 22, 0.1)',
    '--editor-error-border': 'rgba(203, 75, 22, 0.2)',
    '--editor-error-foreground': '#cb4b16',
    '--editor-border-color': '#073642',
    '--editor-toolbar-background': '#073642',
    '--editor-toolbar-hover': 'rgba(38, 139, 210, 0.05)',
    '--editor-toolbar-active': 'rgba(38, 139, 210, 0.1)',
  },
}

// 注册所有主题
export function registerThemes() {
  monaco.editor.defineTheme('github-light', githubLight)
  monaco.editor.defineTheme('github-dark', githubDark)
  monaco.editor.defineTheme('monokai', monokai)
  monaco.editor.defineTheme('dracula', dracula)
  monaco.editor.defineTheme('solarized-light', solarizedLight)
  monaco.editor.defineTheme('solarized-dark', solarizedDark)
}

// 获取主题CSS变量
export function getThemeVariables(theme: EditorTheme): ThemeVariables {
  return {
    ...(customThemes[theme] || baseThemes[theme] || baseThemes['vs']),
  }
}
