import { defineComponent, computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { PropType, SetupContext, ComputedRef } from 'vue'
import type { EditorTheme } from './themes'
import type { CodeSample } from './themePreviewSamples'
import { themeManager } from './themeManager'
import {
  codeSamples,
  sampleIterator,
  getSampleByLanguage,
  getSupportedLanguages,
} from './themePreviewSamples'

// 常量定义
const CAROUSEL_INTERVAL = 5000 // 轮播间隔（毫秒）

// 主题选项接口
interface ThemeOption {
  readonly value: EditorTheme
  readonly label: string
}

export default defineComponent({
  name: 'ThemePreview',

  props: {
    modelValue: {
      type: String as PropType<EditorTheme>,
      required: true,
    },
    placement: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'bottom',
    },
    showPreview: {
      type: Boolean,
      default: true,
    },
    autoCarousel: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: '',
    },
  },

  emits: {
    'update:modelValue': (theme: EditorTheme) => true,
    change: (theme: EditorTheme) => true,
  },

  setup(
    props,
    {
      emit,
    }: SetupContext<{
      'update:modelValue': [theme: EditorTheme]
      change: [theme: EditorTheme]
    }>,
  ) {
    // 状态管理
    const hoverTheme = ref<EditorTheme | null>(null)
    const showPopover = ref(false)
    const currentSample = ref<CodeSample>(codeSamples[0])
    const carouselTimer = ref<number | null>(null)

    // 计算属性
    const themes: ComputedRef<readonly ThemeOption[]> = computed(() =>
      themeManager.getAvailableThemes(),
    )
    const languages = computed(() => getSupportedLanguages())
    const previewTheme = computed(() => hoverTheme.value || props.modelValue)

    // 更新示例代码
    const updateSample = () => {
      if (props.language) {
        const sample = getSampleByLanguage(props.language)
        if (sample) {
          currentSample.value = sample
          return
        }
      }
      startCarousel()
    }

    // 轮播控制
    const startCarousel = () => {
      if (!props.autoCarousel) return

      const iterator = sampleIterator()
      currentSample.value = iterator.next().value

      carouselTimer.value = window.setInterval(() => {
        const result = iterator.next()
        if (!result.done) {
          currentSample.value = result.value
        }
      }, CAROUSEL_INTERVAL)
    }

    const stopCarousel = () => {
      if (carouselTimer.value !== null) {
        window.clearInterval(carouselTimer.value)
        carouselTimer.value = null
      }
    }

    // 事件处理
    const handleThemeChange = (themeValue: EditorTheme) => {
      emit('update:modelValue', themeValue)
      emit('change', themeValue)
      showPopover.value = false
    }

    const handleMouseEnter = (themeValue: EditorTheme) => {
      hoverTheme.value = themeValue
      stopCarousel()
    }

    const handleMouseLeave = () => {
      hoverTheme.value = null
      if (!showPopover.value) {
        startCarousel()
      }
    }

    const handleLanguageChange = (e: Event) => {
      const select = e.target as HTMLSelectElement
      const sample = getSampleByLanguage(select.value)
      if (sample) {
        currentSample.value = sample
      }
    }

    // 键盘导航
    const handleKeyDown = (e: KeyboardEvent, themeValue?: EditorTheme) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (themeValue) {
            handleThemeChange(themeValue)
          } else {
            showPopover.value = !showPopover.value
          }
          break
        case 'Escape':
          e.preventDefault()
          showPopover.value = false
          break
        case 'ArrowUp':
        case 'ArrowDown':
          if (showPopover.value && themeValue) {
            e.preventDefault()
            const themeList = themes.value
            const currentIndex = themeList.findIndex((t) => t.value === themeValue)
            const nextIndex =
              e.key === 'ArrowUp'
                ? (currentIndex - 1 + themeList.length) % themeList.length
                : (currentIndex + 1) % themeList.length
            handleThemeChange(themeList[nextIndex].value)
          }
          break
      }
    }

    // 生成元素属性
    const getThemeButtonProps = (themeValue?: EditorTheme) => ({
      role: themeValue ? 'option' : 'button',
      'aria-selected': themeValue ? themeValue === props.modelValue : undefined,
      'aria-expanded': !themeValue ? showPopover.value : undefined,
      'aria-haspopup': !themeValue ? ('listbox' as const) : undefined,
      tabindex: 0,
      onKeydown: (e: KeyboardEvent) => handleKeyDown(e, themeValue),
      onClick: () =>
        themeValue ? handleThemeChange(themeValue) : (showPopover.value = !showPopover.value),
      onMouseenter: themeValue ? () => handleMouseEnter(themeValue) : undefined,
      onMouseleave: themeValue ? handleMouseLeave : undefined,
    })

    // 监听属性变化
    watch(() => props.language, updateSample)
    watch(
      () => props.autoCarousel,
      (autoCarousel: boolean) => {
        if (autoCarousel) {
          startCarousel()
        } else {
          stopCarousel()
        }
      },
    )

    // 生命周期
    onMounted(() => {
      updateSample()
    })

    onBeforeUnmount(() => {
      stopCarousel()
    })

    return () => (
      <div class={['theme-preview', `theme-preview--${props.placement}`]}>
        <div class="theme-selector">
          <div class="theme-selected" {...getThemeButtonProps()}>
            <span class="theme-name">
              {themes.value.find((t) => t.value === props.modelValue)?.label || props.modelValue}
            </span>
            <span class="theme-icon" aria-hidden="true">
              {showPopover.value ? '▼' : '▲'}
            </span>
          </div>

          {showPopover.value && (
            <div class="theme-options" role="listbox" aria-label="选择主题">
              {themes.value.map((theme) => (
                <div
                  key={theme.value}
                  class={[
                    'theme-option',
                    { 'theme-option--active': theme.value === props.modelValue },
                  ]}
                  {...getThemeButtonProps(theme.value)}
                >
                  <span class="theme-option-name">{theme.label}</span>
                  {props.showPreview && (
                    <div
                      class="theme-preview-popup"
                      role="tooltip"
                      aria-label={`${theme.label} 主题预览`}
                    >
                      <div class="preview-header">
                        <span class="preview-language">{currentSample.value.label}</span>
                        {languages.value.length > 1 && (
                          <select
                            class="language-selector"
                            value={currentSample.value.language}
                            onChange={handleLanguageChange}
                            aria-label="选择预览代码语言"
                          >
                            {languages.value.map((lang) => (
                              <option key={lang} value={lang}>
                                {getSampleByLanguage(lang)?.label || lang}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <pre
                        class={[
                          'preview-code',
                          `preview-${theme.value}`,
                          `language-${currentSample.value.language}`,
                        ]}
                      >
                        {currentSample.value.code}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{/* 样式代码保持不变 */}</style>
      </div>
    )
  },
})
