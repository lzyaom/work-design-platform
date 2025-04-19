import { defineComponent, ref, computed, watch } from 'vue'
import type { PropType } from 'vue'
import { ThemeBuilder, type ThemeDefinition, type ThemeColors, tokenGroups } from './themeBuilder'
import type { EditorTheme } from './themes'
import ColorPicker from './ColorPicker'
import MonacoEditor from './index'

export default defineComponent({
  name: 'ThemeEditor',

  components: {
    ColorPicker,
    MonacoEditor,
  },

  props: {
    modelValue: {
      type: String as PropType<EditorTheme>,
      required: true,
    },
    showPreview: {
      type: Boolean,
      default: true,
    },
  },

  emits: {
    'update:modelValue': (theme: EditorTheme) => true,
    change: (theme: EditorTheme) => true,
  },

  setup(props, { emit }) {
    // 主题状态
    const currentTheme = ref<ThemeDefinition>(ThemeBuilder.createTheme(props.modelValue))
    const activeTab = ref<'colors' | 'tokens'>('colors')
    const importButtonRef = ref<HTMLInputElement | null>(null)
    const previewCode = ref(`function example() {
  // 这是一个注释
  const greeting: string = "Hello, World!";
  const nums: number[] = [1, 2, 3];
  
  return nums.map(n => greeting + n);
}

interface User {
  id: number;
  name: string;
}

class UserService {
  private users: Map<number, User> = new Map();

  async findById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
}`)

    // 计算属性
    const colorCategories = computed(() => ({
      编辑器: {
        'editor.background': '背景色',
        'editor.foreground': '前景色',
        'editor.lineHighlightBackground': '当前行背景',
        'editor.selectionBackground': '选中背景',
        'editor.inactiveSelectionBackground': '非活动选中背景',
      },
      行号和缩进: {
        'editorLineNumber.foreground': '行号颜色',
        'editorLineNumber.activeForeground': '当前行号颜色',
        'editorIndentGuide.background': '缩进指示线',
        'editorIndentGuide.activeBackground': '活动缩进指示线',
      },
      光标和空格: {
        'editorCursor.foreground': '光标颜色',
        'editorWhitespace.foreground': '空格显示颜色',
      },
      搜索和高亮: {
        'editor.findMatchBackground': '搜索匹配背景',
        'editor.findMatchHighlightBackground': '搜索高亮背景',
        'editor.wordHighlightBackground': '单词高亮背景',
        'editor.wordHighlightStrongBackground': '写入高亮背景',
      },
    }))

    // 事件处理
    const handleColorChange = (key: string, value: string) => {
      currentTheme.value = {
        ...currentTheme.value,
        colors: {
          ...currentTheme.value.colors,
          [key]: value,
        },
      }
      updateTheme()
    }

    const handleTokenChange = (token: string, value: string) => {
      const rules = [...currentTheme.value.rules]
      const index = rules.findIndex((r) => r.token === token)

      if (index >= 0) {
        rules[index] = { ...rules[index], foreground: value.replace('#', '') }
      } else {
        rules.push({ token, foreground: value.replace('#', '') })
      }

      currentTheme.value = {
        ...currentTheme.value,
        rules,
      }
      updateTheme()
    }

    const updateTheme = () => {
      ThemeBuilder.registerCustomTheme(currentTheme.value)
      emit('update:modelValue', currentTheme.value.name as EditorTheme)
      emit('change', currentTheme.value.name as EditorTheme)
    }

    const exportTheme = () => {
      const json = JSON.stringify(currentTheme.value, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentTheme.value.name}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    const handleImport = (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const theme = JSON.parse(e.target?.result as string)
            currentTheme.value = theme
            updateTheme()
          } catch (err) {
            console.error('主题导入失败:', err)
          }
        }
        reader.readAsText(file)
      }
    }

    // 监听属性变化
    watch(
      () => props.modelValue,
      (newTheme) => {
        currentTheme.value = ThemeBuilder.createTheme(newTheme)
      },
    )

    return () => (
      <div class="theme-editor">
        <div class="theme-editor-header">
          <div class="theme-tabs">
            <button
              class={['tab', { active: activeTab.value === 'colors' }]}
              onClick={() => (activeTab.value = 'colors')}
            >
              颜色
            </button>
            <button
              class={['tab', { active: activeTab.value === 'tokens' }]}
              onClick={() => (activeTab.value = 'tokens')}
            >
              语法高亮
            </button>
          </div>
          <div class="theme-actions">
            <button class="action-button" onClick={exportTheme}>
              导出主题
            </button>
            <input
              ref={importButtonRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <button class="action-button" onClick={() => importButtonRef.value?.click()}>
              导入主题
            </button>
          </div>
        </div>

        <div class="theme-editor-content">
          {activeTab.value === 'colors' ? (
            <div class="color-editor">
              {Object.entries(colorCategories.value).map(([category, colors]) => (
                <div key={category} class="color-category">
                  <h3>{category}</h3>
                  <div class="color-list">
                    {Object.entries(colors).map(([key, label]) => (
                      <div key={key} class="color-item">
                        <label>{label}</label>
                        <ColorPicker
                          modelValue={currentTheme.value.colors[key]}
                          backgroundColor={currentTheme.value.colors['editor.background']}
                          onChange={(color) => handleColorChange(key, color)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div class="token-editor">
              {Object.entries(tokenGroups).map(([group, tokens]) => (
                <div key={group} class="token-category">
                  <h3>{group}</h3>
                  <div class="token-list">
                    {tokens.map((token) => {
                      const rule = currentTheme.value.rules.find((r) => r.token === token)
                      return (
                        <div key={token} class="token-item">
                          <label>{token}</label>
                          <ColorPicker
                            modelValue={rule?.foreground ? `#${rule.foreground}` : '#000000'}
                            backgroundColor={currentTheme.value.colors['editor.background']}
                            onChange={(color) => handleTokenChange(token, color)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {props.showPreview && (
          <div class="theme-preview">
            <h3>预览</h3>
            <div class="preview-editor">
              <MonacoEditor
                modelValue={previewCode.value}
                language="typescript"
                theme={props.modelValue}
                height="300px"
                readonly
              />
            </div>
          </div>
        )}

        <style>
          {`
          .theme-editor {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
            background: var(--editor-background);
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
          }

          .theme-editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .theme-tabs {
            display: flex;
            gap: 8px;
          }

          .tab {
            padding: 8px 16px;
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
            background: none;
            color: var(--editor-foreground);
            cursor: pointer;
          }

          .tab.active {
            background: var(--editor-toolbar-active);
          }

          .theme-actions {
            display: flex;
            gap: 8px;
          }

          .action-button {
            padding: 8px 16px;
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
            background: var(--editor-toolbar-background);
            color: var(--editor-foreground);
            cursor: pointer;
          }

          .action-button:hover {
            background: var(--editor-toolbar-hover);
          }

          .color-editor,
          .token-editor {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .color-category,
          .token-category {
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
            padding: 16px;
          }

          h3 {
            margin: 0 0 12px;
            color: var(--editor-foreground);
            font-size: 14px;
          }

          .color-list,
          .token-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 12px;
          }

          .color-item,
          .token-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          label {
            font-size: 12px;
            color: var(--editor-foreground);
          }

          @media (max-width: 768px) {
            .color-list,
            .token-list {
              grid-template-columns: 1fr;
            }
          }
          `}
        </style>
      </div>
    )
  },
})
