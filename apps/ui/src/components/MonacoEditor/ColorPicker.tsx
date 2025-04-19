import { defineComponent, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { ThemeBuilder } from './themeBuilder'

export default defineComponent({
  name: 'ColorPicker',

  props: {
    modelValue: {
      type: String,
      required: true,
    },
    showVariants: {
      type: Boolean,
      default: true,
    },
    showContrast: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
  },

  emits: {
    'update:modelValue': (color: string) => true,
    change: (color: string) => true,
  },

  setup(props, { emit }) {
    const inputRef = ref<HTMLInputElement>()
    const showPalette = ref(false)
    const currentColor = ref(props.modelValue)

    // 生成颜色变体
    const variants = ref(ThemeBuilder.generateColorVariants(props.modelValue))
    const complementaryColors = ref(ThemeBuilder.generateComplementaryColors(props.modelValue))

    // 预设颜色
    const presetColors = [
      '#1E1E1E',
      '#FFFFFF', // 黑白
      '#0078D4',
      '#2B88D8', // 蓝色
      '#107C10',
      '#28A745', // 绿色
      '#C50F1F',
      '#E74856', // 红色
      '#CA5010',
      '#F76707', // 橙色
      '#8764B8',
      '#B4A0FF', // 紫色
      '#C19C00',
      '#FFD700', // 金色
    ]

    const updateColor = (color: string) => {
      if (color.match(/^#[0-9a-fA-F]{6}$/)) {
        currentColor.value = color
        variants.value = ThemeBuilder.generateColorVariants(color)
        complementaryColors.value = ThemeBuilder.generateComplementaryColors(color)
        emit('update:modelValue', color)
        emit('change', color)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        showPalette.value = false
      }
    }

    watch(
      () => props.modelValue,
      (newColor) => {
        currentColor.value = newColor
        variants.value = ThemeBuilder.generateColorVariants(newColor)
        complementaryColors.value = ThemeBuilder.generateComplementaryColors(newColor)
      },
    )

    return () => (
      <div class="color-picker">
        <div
          class="color-preview"
          onClick={() => {
            showPalette.value = !showPalette.value
            if (showPalette.value) {
              requestAnimationFrame(() => {
                inputRef.value?.focus()
              })
            }
          }}
        >
          <div class="color-swatch" style={{ backgroundColor: currentColor.value }} />
          <input
            ref={inputRef}
            type="text"
            class="color-input"
            value={currentColor.value}
            onChange={(e) => updateColor((e.target as HTMLInputElement).value)}
            onKeydown={handleKeyDown}
          />
          {props.showContrast && (
            <div
              class={[
                'contrast-indicator',
                {
                  good: ThemeBuilder.validateColorContrast(
                    currentColor.value,
                    props.backgroundColor,
                  ),
                  poor: !ThemeBuilder.validateColorContrast(
                    currentColor.value,
                    props.backgroundColor,
                  ),
                },
              ]}
            >
              {ThemeBuilder.validateColorContrast(currentColor.value, props.backgroundColor)
                ? 'AA'
                : '!'}
            </div>
          )}
        </div>

        {showPalette.value && (
          <div class="color-palette" onKeydown={handleKeyDown}>
            {props.showVariants && (
              <div class="color-section">
                <h4>颜色变体</h4>
                <div class="color-grid">
                  {variants.value.map((color) => (
                    <button
                      key={color}
                      class="color-option"
                      style={{ backgroundColor: color }}
                      onClick={() => updateColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div class="color-section">
              <h4>互补色</h4>
              <div class="color-grid">
                {complementaryColors.value.map((color) => (
                  <button
                    key={color}
                    class="color-option"
                    style={{ backgroundColor: color }}
                    onClick={() => updateColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div class="color-section">
              <h4>预设颜色</h4>
              <div class="color-grid">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    class="color-option"
                    style={{ backgroundColor: color }}
                    onClick={() => updateColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <style>
          {`
          .color-picker {
            position: relative;
            display: inline-block;
          }

          .color-preview {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
            background: var(--editor-background);
            cursor: pointer;
          }

          .color-swatch {
            width: 24px;
            height: 24px;
            border-radius: 2px;
            border: 1px solid var(--editor-border-color);
          }

          .color-input {
            width: 80px;
            padding: 2px 4px;
            border: 1px solid var(--editor-border-color);
            border-radius: 2px;
            background: var(--editor-background);
            color: var(--editor-foreground);
            font-family: monospace;
            font-size: 12px;
          }

          .contrast-indicator {
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 10px;
            font-weight: bold;
          }

          .contrast-indicator.good {
            background: #107C10;
            color: #fff;
          }

          .contrast-indicator.poor {
            background: #C50F1F;
            color: #fff;
          }

          .color-palette {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            padding: 12px;
            background: var(--editor-background);
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
          }

          .color-section {
            margin-bottom: 12px;
          }

          .color-section:last-child {
            margin-bottom: 0;
          }

          h4 {
            margin: 0 0 8px;
            font-size: 12px;
            color: var(--editor-foreground);
          }

          .color-grid {
            display: grid;
            grid-template-columns: repeat(8, 24px);
            gap: 4px;
          }

          .color-option {
            width: 24px;
            height: 24px;
            border: 1px solid var(--editor-border-color);
            border-radius: 2px;
            cursor: pointer;
            padding: 0;
          }

          .color-option:hover {
            transform: scale(1.1);
          }

          .color-option:focus-visible {
            outline: 2px solid var(--editor-focus-border);
            outline-offset: 2px;
          }

          @media (max-width: 768px) {
            .color-palette {
              position: fixed;
              inset: 20px;
              margin: 0;
              overflow: auto;
            }

            .color-grid {
              grid-template-columns: repeat(6, 1fr);
            }
          }
          `}
        </style>
      </div>
    )
  },
})
