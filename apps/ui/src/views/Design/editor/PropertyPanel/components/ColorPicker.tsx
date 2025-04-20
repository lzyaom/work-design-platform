import { defineComponent, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { Button, Popover } from 'ant-design-vue'
import './ColorPicker.css'

export interface ColorValue {
  hex: string
  alpha: number
}

export const CustomColorPicker = defineComponent({
  name: 'CustomColorPicker',

  props: {
    value: {
      type: String,
      required: true
    },
    onChange: {
      type: Function as PropType<(value: string) => void>,
      required: true
    }
  },

  setup(props) {
    const currentColor = ref(props.value)
    const showPicker = ref(false)

    // 监听外部值变化
    watch(
      () => props.value,
      (newValue) => {
        if (newValue !== currentColor.value) {
          currentColor.value = newValue
        }
      }
    )

    // 更新颜色值
    const updateColor = (color: string) => {
      currentColor.value = color
      props.onChange(color)
    }

    // 处理颜色输入变化
    const handleColorChange = (e: Event) => {
      const input = e.target as HTMLInputElement
      if (input?.value) {
        updateColor(input.value)
      }
    }

    const PRESET_COLORS = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
      '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#C0C0C0'
    ]

    // 颜色面板内容
    const colorPanel = () => (
      <div class="color-picker-panel">
        <div class="color-presets">
          {PRESET_COLORS.map(color => (
            <div
              key={color}
              class={`color-preset ${color === currentColor.value ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => updateColor(color)}
              role="button"
              tabindex={0}
              aria-label={`选择颜色 ${color}`}
              onKeypress={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  updateColor(color)
                }
              }}
            />
          ))}
        </div>
        <div class="color-input">
          <input
            type="color"
            value={currentColor.value}
            onChange={handleColorChange}
            aria-label="选择自定义颜色"
          />
        </div>
      </div>
    )

    return () => (
      <Popover
        v-model:open={showPicker.value}
        trigger="click"
        placement="bottom"
        content={colorPanel}
        overlayClassName="color-picker-popover"
      >
        <Button
          class="color-picker-trigger"
          style={{
            backgroundColor: currentColor.value,
            borderColor: '#d9d9d9'
          }}
          aria-label="打开颜色选择器"
          aria-expanded={showPicker.value}
        >
          <span
            class="color-value"
            style={{ color: isLightColor(currentColor.value) ? '#000' : '#fff' }}
          >
            {currentColor.value.toUpperCase()}
          </span>
        </Button>
      </Popover>
    )
  }
})

// 判断颜色是否为浅色
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}

export default CustomColorPicker