import { defineComponent, ref, computed } from 'vue'
import type { PropType } from 'vue'
import { Form, Input, InputNumber, Select, Tabs } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import type { StyleConfigProps } from '../types'
import type { Component, StyleValue } from '@/types/component'
import CustomColorPicker from './ColorPicker'
import './StyleConfig.css'
import type { ValueType } from 'ant-design-vue/es/input-number/src/utils/MiniDecimal'

const { Item: FormItem } = Form
const { TabPane } = Tabs

interface StyleProperty {
  key: keyof CSSStyleDeclaration
  label: string
  type: 'select' | 'size' | 'color' | 'spacing' | 'shadow' | 'text'
  options?: string[]
}

interface StyleCategory {
  title: string
  properties: StyleProperty[]
}

interface ShadowValue {
  x: number
  y: number
  blur: number
  color: string
}

type StyleCategories = Record<string, StyleCategory>

// 样式分类
const STYLE_CATEGORIES: StyleCategories = {
  layout: {
    title: '布局',
    properties: [
      { key: 'display', label: '显示模式', type: 'select', options: ['block', 'inline', 'flex', 'grid', 'none'] },
      { key: 'position', label: '定位', type: 'select', options: ['static', 'relative', 'absolute', 'fixed'] },
      { key: 'width', label: '宽度', type: 'size' },
      { key: 'height', label: '高度', type: 'size' },
      { key: 'margin', label: '外边距', type: 'spacing' },
      { key: 'padding', label: '内边距', type: 'spacing' }
    ]
  },
  typography: {
    title: '字体',
    properties: [
      { key: 'fontSize', label: '字号', type: 'size' },
      { key: 'fontWeight', label: '字重', type: 'select', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
      { key: 'lineHeight', label: '行高', type: 'size' },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'textAlign', label: '对齐', type: 'select', options: ['left', 'center', 'right', 'justify'] }
    ]
  },
  decoration: {
    title: '装饰',
    properties: [
      { key: 'backgroundColor', label: '背景色', type: 'color' },
      { key: 'borderWidth', label: '边框宽度', type: 'size' },
      { key: 'borderStyle', label: '边框样式', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
      { key: 'borderColor', label: '边框颜色', type: 'color' },
      { key: 'borderRadius', label: '圆角', type: 'size' },
      { key: 'boxShadow', label: '阴影', type: 'shadow' }
    ]
  }
}

export const StyleConfig = defineComponent({
  name: 'StyleConfig',
  
  components: {
    CustomColorPicker
  },

  props: {
    component: {
      type: Object as PropType<StyleConfigProps['component']>,
      required: true
    },
    onChange: {
      type: Function as PropType<(component: Component) => void>,
      required: true
    }
  },

  setup(props) {
    const activeCategory = ref('layout')

    // 组件样式
    const style = computed<Partial<CSSStyleDeclaration>>(() => props.component.style || {})

    // 更新样式
    const updateStyle = (key: keyof CSSStyleDeclaration, value: string | undefined) => {
      if (value === undefined) return
      
      props.onChange({
        ...props.component,
        style: {
          ...style.value,
          [key]: value
        }
      })
    }

    // 渲染样式控件
    const renderStyleControl = (property: StyleProperty) => {
      const value = style.value[property.key] as string | undefined

      switch (property.type) {
        case 'select':
          return (
            <Select
              value={value}
              onChange={(val: SelectProps['value']) => {
                if (typeof val === 'string') {
                  updateStyle(property.key, val)
                }
              }}
            >
              {property.options?.map(option => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          )

        case 'size':
          return (
            <div class="size-input">
              <InputNumber
                value={parseFloat(value || '0')}
                onChange={(val: ValueType) => {
                  if (val !== null) {
                    updateStyle(property.key, `${val}px`)
                  }
                }}
                min={0}
                step={1}
              />
              <Select
                class="unit-select"
                value="px"
                onChange={(val: SelectProps['value']) => {
                  const num = parseFloat(value || '0')
                  if (!isNaN(num) && typeof val === 'string') {
                    updateStyle(property.key, `${num}${val}`)
                  }
                }}
              >
                <Select.Option value="px">px</Select.Option>
                <Select.Option value="%">%</Select.Option>
                <Select.Option value="rem">rem</Select.Option>
                <Select.Option value="em">em</Select.Option>
              </Select>
            </div>
          )

        case 'color':
          return (
            <CustomColorPicker
              value={value || '#000000'}
              onChange={val => updateStyle(property.key, val)}
            />
          )

        // case 'spacing':
        //   return (
        //     <div class="spacing-input">
        //       {['top', 'right', 'bottom', 'left'].map(direction => (
        //         <InputNumber
        //           key={direction}
        //           class={`spacing-${direction}`}
        //           value={parseFloat(value?.[direction] || '0')}
        //           onChange={(val: ValueType) => {
        //             if (val !== null) {
        //               const spacing = { ...value } as Record<string, string>
        //               spacing[direction] = `${val}px`
        //               updateStyle(property.key, spacing as any)
        //             }
        //           }}
        //           min={0}
        //           step={1}
        //         />
        //       ))}
        //     </div>
        //   )

        case 'shadow':
          const shadowValue = parseShadow(value)
          return (
            <div class="shadow-input">
              <InputNumber
                class="shadow-x"
                value={shadowValue.x}
                onChange={(val: ValueType) => updateShadowValue('x', val)}
              />
              <InputNumber
                class="shadow-y"
                value={shadowValue.y}
                onChange={(val: ValueType) => updateShadowValue('y', val)}
              />
              <InputNumber
                class="shadow-blur"
                value={shadowValue.blur}
                onChange={(val: ValueType) => updateShadowValue('blur', val)}
              />
              <CustomColorPicker
                class="shadow-color"
                value={shadowValue.color}
                onChange={val => updateShadowValue('color', val)}
              />
            </div>
          )

        default:
          return (
            <Input
              value={value}
              onChange={e => updateStyle(property.key, e.target.value)}
            />
          )
      }
    }

    // 解析阴影值
    const parseShadow = (shadow?: string): ShadowValue => {
      if (!shadow) {
        return { x: 0, y: 0, blur: 0, color: '#000000' }
      }

      const parts = shadow.match(/(-?\d+)px\s+(-?\d+)px\s+(-?\d+)px\s+(.+)/)
      if (!parts) {
        return { x: 0, y: 0, blur: 0, color: '#000000' }
      }

      return {
        x: parseInt(parts[1]) || 0,
        y: parseInt(parts[2]) || 0,
        blur: parseInt(parts[3]) || 0,
        color: parts[4] || '#000000'
      }
    }

    // 更新阴影值
    const updateShadowValue = (key: keyof ShadowValue, value: string | number | null) => {
      if (value === null) return
      
      const shadow = parseShadow(style.value.boxShadow as string) 
      shadow[key] = value as never
      updateStyle(
        'boxShadow',
        `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`
      )
    }

    return () => (
      <div class="style-config">
        <Tabs
          v-model:activeKey={activeCategory.value}
          class="style-tabs"
        >
          {Object.entries(STYLE_CATEGORIES).map(([key, category]) => (
            <TabPane key={key} tab={category.title}>
              <Form layout="vertical">
                {category.properties.map(property => (
                  <FormItem
                    key={property.key}
                    label={property.label}
                    class="style-form-item"
                  >
                    {renderStyleControl(property)}
                  </FormItem>
                ))}
              </Form>
            </TabPane>
          ))}
        </Tabs>
      </div>
    )
  }
})

export default StyleConfig