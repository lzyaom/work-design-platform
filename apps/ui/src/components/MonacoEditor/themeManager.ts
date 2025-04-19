import type { EditorTheme, ThemeVariables } from './themes'
import { registerThemes, getThemeVariables } from './themes'
import * as monaco from 'monaco-editor'

// 用于存储主题变化的回调函数
type ThemeChangeCallback = (theme: EditorTheme) => void

class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: EditorTheme = 'vs-dark'
  private subscribers: Set<ThemeChangeCallback> = new Set()
  private themeVariables: ThemeVariables | null = null
  private initialized = false

  private constructor() {
    // 注册所有主题
    registerThemes()
    // 从本地存储加载上次使用的主题
    this.loadTheme()
  }

  // 单例模式获取实例
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  // 初始化主题
  public init() {
    if (this.initialized) return
    this.initialized = true

    // 监听系统主题变化
    this.watchSystemTheme()
  }

  // 监听系统主题变化
  private watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'vs-dark' : 'vs'
      if (!localStorage.getItem('editor-theme')) {
        this.setTheme(systemTheme as EditorTheme)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
  }

  // 从本地存储加载主题
  private loadTheme() {
    const savedTheme = localStorage.getItem('editor-theme')
    if (savedTheme && this.isValidTheme(savedTheme)) {
      this.setTheme(savedTheme)
    } else {
      // 根据系统主题设置默认主题
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.setTheme(isDarkMode ? 'vs-dark' : 'vs')
    }
  }

  // 验证主题是否有效
  private isValidTheme(theme: string): theme is EditorTheme {
    return this.getAvailableThemes().some((t) => t.value === theme)
  }

  // 设置主题
  public setTheme(theme: EditorTheme) {
    if (this.currentTheme === theme) return

    try {
      // 更新 Monaco Editor 主题
      monaco.editor.setTheme(theme)

      // 获取并应用主题变量
      const variables = getThemeVariables(theme) as ThemeVariables
      this.themeVariables = variables

      // 应用主题变量
      this.applyThemeVariables(variables)

      // 保存到本地存储
      localStorage.setItem('editor-theme', theme)

      // 更新当前主题
      this.currentTheme = theme

      // 通知订阅者
      this.notifySubscribers()
    } catch (error) {
      console.error('Failed to set theme:', error)
    }
  }

  // 获取当前主题
  public getCurrentTheme(): EditorTheme {
    return this.currentTheme
  }

  // 获取当前主题变量
  public getThemeVariables(): ThemeVariables {
    if (!this.themeVariables) {
      this.themeVariables = getThemeVariables(this.currentTheme) as ThemeVariables
    }
    return this.themeVariables
  }

  // 应用主题变量到 DOM
  private applyThemeVariables(variables: ThemeVariables) {
    const root = document.documentElement
    Object.entries(variables).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        root.style.setProperty(key, value)
      }
    })
  }

  // 订阅主题变化
  public subscribe(callback: ThemeChangeCallback): () => void {
    this.subscribers.add(callback)
    // 立即触发一次回调，传递当前主题
    callback(this.currentTheme)
    // 返回取消订阅函数
    return () => this.subscribers.delete(callback)
  }

  // 通知所有订阅者
  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.currentTheme))
  }

  // 获取所有可用主题
  public getAvailableThemes(): ReadonlyArray<{ value: EditorTheme; label: string }> {
    return [
      { value: 'vs', label: '浅色' },
      { value: 'vs-dark', label: '深色' },
      { value: 'hc-black', label: '高对比度' },
      { value: 'github-light', label: 'GitHub 浅色' },
      { value: 'github-dark', label: 'GitHub 深色' },
      { value: 'monokai', label: 'Monokai' },
      { value: 'dracula', label: 'Dracula' },
      { value: 'solarized-light', label: 'Solarized 浅色' },
      { value: 'solarized-dark', label: 'Solarized 深色' },
    ] as const
  }

  // 预加载主题资源
  public async preloadThemes() {
    const themes = this.getAvailableThemes()
    await Promise.all(
      themes.map(async ({ value }) => {
        try {
          monaco.editor.setTheme(value)
        } catch (error) {
          console.warn(`Failed to preload theme: ${value}`, error)
        }
      }),
    )
    // 恢复当前主题
    monaco.editor.setTheme(this.currentTheme)
  }

  // 清理资源
  public dispose() {
    this.subscribers.clear()
    this.themeVariables = null
    this.initialized = false
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance()

// 导出主题变量类型
export type { ThemeVariables }
