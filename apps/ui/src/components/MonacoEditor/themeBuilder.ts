import * as monaco from 'monaco-editor'
import { themeManager } from './themeManager'
import type { EditorTheme } from './themes'

export interface ThemeToken {
  token: string
  foreground?: string
  background?: string
  fontStyle?: string
}

// 确保 ThemeColors 与 monaco.editor.IColors 兼容
export type ThemeColors = {
  [K in keyof monaco.editor.IColors]: string
} & {
  [key: string]: string
}

export interface ThemeDefinition {
  name: string
  base: 'vs' | 'vs-dark' | 'hc-black'
  inherit: boolean
  rules: ThemeToken[]
  colors: ThemeColors
}

// 标记分组
export const tokenGroups = {
  基础: ['comment', 'string', 'number', 'keyword', 'operator'],
  类型: ['type', 'class', 'interface', 'enum'],
  函数和变量: ['function', 'variable', 'parameter', 'property'],
  标记: ['tag', 'attribute', 'value'],
  其他: ['regexp', 'constant', 'namespace'],
}

// 默认标记样式
export const defaultTokenStyles: Record<string, Partial<ThemeToken>> = {
  comment: { foreground: '6A9955' },
  string: { foreground: 'CE9178' },
  number: { foreground: 'B5CEA8' },
  keyword: { foreground: '569CD6' },
  operator: { foreground: 'D4D4D4' },
  type: { foreground: '4EC9B0' },
  class: { foreground: '4EC9B0' },
  interface: { foreground: '4EC9B0' },
  enum: { foreground: '4EC9B0' },
  function: { foreground: 'DCDCAA' },
  variable: { foreground: '9CDCFE' },
  parameter: { foreground: '9CDCFE' },
  property: { foreground: '9CDCFE' },
  tag: { foreground: '569CD6' },
  attribute: { foreground: '9CDCFE' },
  value: { foreground: 'CE9178' },
  regexp: { foreground: 'D16969' },
  constant: { foreground: '4FC1FF' },
  namespace: { foreground: '4EC9B0' },
}

// 默认颜色主题
export const defaultThemeColors: ThemeColors = {
  'editor.background': '#1E1E1E',
  'editor.foreground': '#D4D4D4',
  'editor.lineHighlightBackground': '#2D2D2D',
  'editor.selectionBackground': '#264F78',
  'editor.inactiveSelectionBackground': '#3A3D41',
  'editorLineNumber.foreground': '#858585',
  'editorLineNumber.activeForeground': '#C6C6C6',
  'editor.selectionHighlightBackground': '#2D2D2D',
  'editor.wordHighlightBackground': '#575757',
  'editor.wordHighlightStrongBackground': '#004972',
  'editorCursor.foreground': '#D4D4D4',
  'editorWhitespace.foreground': '#3B3B3B',
  'editorIndentGuide.background': '#404040',
  'editorIndentGuide.activeBackground': '#707070',
  'editor.findMatchBackground': '#515C6A',
  'editor.findMatchHighlightBackground': '#314365',
}

class ThemeBuilder {
  private static validateColors(colors: Partial<ThemeColors>): ThemeColors {
    // 确保所有颜色值都是有效的字符串
    const validatedColors: ThemeColors = { ...defaultThemeColors }

    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string' && value.match(/^#[0-9a-fA-F]{6}$/)) {
        validatedColors[key] = value
      }
    })

    return validatedColors
  }

  // 创建新主题
  static createTheme(name: string, options: Partial<ThemeDefinition> = {}): ThemeDefinition {
    return {
      name,
      base: options.base || 'vs-dark',
      inherit: options.inherit ?? true,
      rules:
        options.rules ||
        Object.entries(defaultTokenStyles).map(([token, style]) => ({
          token,
          ...style,
        })),
      colors: this.validateColors(options.colors || {}),
    }
  }

  // 注册主题
  static registerCustomTheme(theme: ThemeDefinition): void {
    const themeData: monaco.editor.IStandaloneThemeData = {
      base: theme.base,
      inherit: theme.inherit,
      rules: theme.rules,
      colors: theme.colors,
    }

    monaco.editor.defineTheme(theme.name, themeData)
    themeManager.setTheme(theme.name as EditorTheme)
  }

  // 更新主题
  static updateTheme(name: string, updates: Partial<ThemeDefinition>): void {
    const theme = {
      name,
      base: updates.base || 'vs-dark',
      inherit: updates.inherit ?? true,
      rules: updates.rules || [],
      colors: this.validateColors(updates.colors || {}),
    }

    this.registerCustomTheme(theme)
  }

  // 生成颜色变体
  static generateColorVariants(baseColor: string, count: number = 5): string[] {
    const lighten = (color: string, amount: number): string => {
      const hex = color.replace('#', '')
      const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + amount)
      const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + amount)
      const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + amount)
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    const darken = (color: string, amount: number): string => {
      const hex = color.replace('#', '')
      const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - amount)
      const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - amount)
      const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - amount)
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    const step = Math.floor(255 / (count + 1))
    const variants: string[] = [baseColor]

    for (let i = 1; i <= Math.floor(count / 2); i++) {
      variants.unshift(darken(baseColor, i * step))
      variants.push(lighten(baseColor, i * step))
    }

    return variants
  }

  // 生成对比色
  static generateComplementaryColors(baseColor: string): string[] {
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    // 补色
    const complement = `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`

    // 三分色
    const triadic1 = `#${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`
    const triadic2 = `#${b.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}`

    return [baseColor, complement, triadic1, triadic2]
  }

  // 验证颜色对比度
  static validateColorContrast(foreground: string, background: string): boolean {
    const getLuminance = (color: string): number => {
      const hex = color.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255

      const toSRGB = (c: number): number => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      }

      return 0.2126 * toSRGB(r) + 0.7152 * toSRGB(g) + 0.0722 * toSRGB(b)
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

    return contrast >= 4.5 // WCAG AA 标准
  }
}

// 主题预设
export const themePresets = {
  dark: ThemeBuilder.createTheme('custom-dark', {
    base: 'vs-dark',
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
    },
  }),
  light: ThemeBuilder.createTheme('custom-light', {
    base: 'vs',
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
    },
  }),
  highContrast: ThemeBuilder.createTheme('custom-hc', {
    base: 'hc-black',
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#FFFFFF',
    },
  }),
}

export { ThemeBuilder }
