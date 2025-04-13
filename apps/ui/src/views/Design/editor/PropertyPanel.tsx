import { defineComponent, ref, computed, watch } from 'vue'
import { Form, Input, InputNumber, Select, Tabs, Switch } from 'ant-design-vue'
import type { SelectProps, InputNumberProps, CheckboxProps } from 'ant-design-vue'
import type { CSSProperties } from 'vue'
import { useDesignStore } from '@/stores/design'
// import type { Component } from '@/types/component'
import { componentSchemas } from './core/componentSchemas'
import type { ComponentType } from './core/componentSchemas'

const { TabPane } = Tabs
const { Item: FormItem } = Form

interface PropSchema {
  type: string
  title?: string
  enum?: string[]
}

type StyleConfig = Required<{
  [K in keyof CSSProperties]: NonNullable<CSSProperties[K]>
}>

export default defineComponent({
  name: 'PropertyPanel',
  setup() {
    const designStore = useDesignStore()
    const activeTab = ref('style')
    // const formRef = ref<FormInstance>()

    // 计算当前选中的组件
    const selectedComponent = computed(() => designStore.selectedComponent)

    // 计算当前组件的schema
    const componentSchema = computed(() => {
      if (!selectedComponent.value) return null
      return componentSchemas[selectedComponent.value.type as ComponentType]
    })

    // 样式配置
    const styleConfig = ref<StyleConfig>({
      // 字体样式
      fontSize: '14px',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
      lineHeight: '1.5',
      letterSpacing: '0',

      // 背景样式
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',

      // 边框样式
      borderWidth: '0',
      borderStyle: 'solid',
      borderColor: '#000000',
      borderRadius: '0',

      // 布局样式
      width: 'auto',
      height: 'auto',
      margin: '0',
      padding: '0',
      position: 'relative',
      display: 'block',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    } as StyleConfig)

    // 监听选中组件变化
    watch(
      () => selectedComponent.value,
      (newComponent) => {
        if (newComponent) {
          // 更新样式配置
          styleConfig.value = {
            ...styleConfig.value,
            ...newComponent.style,
          } as StyleConfig
        }
      },
      { immediate: true },
    )

    // 处理样式更新 - 使用防抖优化
    const handleStyleChange = (key: keyof CSSProperties, value: string | number) => {
      if (!selectedComponent.value) return

      const newStyle = {
        ...selectedComponent.value.style,
        [key]: value,
      }

      designStore.updateComponent({
        ...selectedComponent.value,
        style: newStyle,
      })
    }

    // 处理属性更新
    const handlePropChange = (key: string, value: unknown) => {
      if (!selectedComponent.value) return

      const newProps = {
        ...selectedComponent.value.props,
        [key]: value,
      }

      designStore.updateComponent({
        ...selectedComponent.value,
        props: newProps,
      })
    }

    // 处理选择框变更
    const handleSelectChange = (value: SelectProps['value']) => {
      return String(value)
    }

    // 处理数字输入框变更
    const handleNumberChange = (value: InputNumberProps['value']) => {
      return typeof value === 'number' ? value : undefined
    }

    // 处理开关变更
    const handleSwitchChange = (checked: CheckboxProps['checked']) => {
      return Boolean(checked)
    }

    return () => (
      <div class="property-panel h-full overflow-y-auto">
        {selectedComponent.value && (
          <Tabs v-model:activeKey={activeTab.value}>
            {/* 组件属性配置 */}
            <TabPane key="props" tab="组件属性">
              <Form layout="horizontal">
                {componentSchema.value?.properties.props?.properties &&
                  Object.entries(componentSchema.value.properties.props.properties).map(
                    ([key, prop]) => {
                      const typedProp = prop as PropSchema
                      return (
                        <FormItem key={key} label={typedProp.title || key}>
                          {typedProp.type === 'string' && typedProp.enum ? (
                            <Select
                              value={selectedComponent.value?.props?.[key] as string}
                              onChange={(value) => handlePropChange(key, handleSelectChange(value))}
                            >
                              {typedProp.enum.map((option) => (
                                <Select.Option key={option} value={option}>
                                  {option}
                                </Select.Option>
                              ))}
                            </Select>
                          ) : typedProp.type === 'boolean' ? (
                            <Switch
                              checked={selectedComponent.value?.props?.[key] as boolean}
                              onChange={(checked) =>
                                handlePropChange(key, handleSwitchChange(checked as boolean))
                              }
                            />
                          ) : typedProp.type === 'number' ? (
                            <InputNumber
                              value={selectedComponent.value?.props?.[key] as number}
                              onChange={(value) => {
                                const num = handleNumberChange(value)
                                if (num !== undefined) handlePropChange(key, num)
                              }}
                            />
                          ) : (
                            <Input
                              value={selectedComponent.value?.props?.[key] as string}
                              onChange={(e: Event) =>
                                handlePropChange(key, (e.target as HTMLInputElement).value)
                              }
                            />
                          )}
                        </FormItem>
                      )
                    },
                  )}
              </Form>
            </TabPane>

            {/* 样式配置 */}
            <TabPane key="style" tab="样式配置">
              <Form layout="horizontal">
                {/* 字体样式配置 */}
                <FormItem label="字体大小">
                  <InputNumber
                    value={parseInt(String(selectedComponent.value?.style?.fontSize))}
                    addon-after="px"
                    onChange={(value) => {
                      const num = handleNumberChange(value)
                      if (num !== undefined) handleStyleChange('fontSize', `${num}px`)
                    }}
                  />
                </FormItem>
                <FormItem label="字体粗细">
                  <Select
                    value={selectedComponent.value?.style?.fontWeight}
                    onChange={(value) => handleStyleChange('fontWeight', handleSelectChange(value))}
                  >
                    <Select.Option value="normal">正常</Select.Option>
                    <Select.Option value="bold">粗体</Select.Option>
                    <Select.Option value="lighter">细体</Select.Option>
                  </Select>
                </FormItem>
                <FormItem label="字体颜色">
                  <Input
                    type="color"
                    value={selectedComponent.value?.style?.color}
                    onChange={(e: Event) =>
                      handleStyleChange('color', (e.target as HTMLInputElement).value)
                    }
                  />
                </FormItem>
                <FormItem label="对齐方式">
                  <Select
                    value={selectedComponent.value?.style?.textAlign}
                    onChange={(value) => handleStyleChange('textAlign', handleSelectChange(value))}
                  >
                    <Select.Option value="left">左对齐</Select.Option>
                    <Select.Option value="center">居中</Select.Option>
                    <Select.Option value="right">右对齐</Select.Option>
                    <Select.Option value="justify">两端对齐</Select.Option>
                  </Select>
                </FormItem>

                {/* 背景样式配置 */}
                <FormItem label="背景颜色">
                  <Input
                    type="color"
                    value={selectedComponent.value?.style?.backgroundColor}
                    onChange={(e: Event) =>
                      handleStyleChange('backgroundColor', (e.target as HTMLInputElement).value)
                    }
                  />
                </FormItem>

                {/* 边框样式配置 */}
                <FormItem label="边框宽度">
                  <InputNumber
                    value={parseInt(String(selectedComponent.value?.style?.borderWidth))}
                    addon-after="px"
                    onChange={(value) => {
                      const num = handleNumberChange(value)
                      if (num !== undefined) handleStyleChange('borderWidth', `${num}px`)
                    }}
                  />
                </FormItem>
                <FormItem label="边框样式">
                  <Select
                    value={selectedComponent.value?.style?.borderStyle}
                    onChange={(value) =>
                      handleStyleChange('borderStyle', handleSelectChange(value))
                    }
                  >
                    <Select.Option value="none">无</Select.Option>
                    <Select.Option value="solid">实线</Select.Option>
                    <Select.Option value="dashed">虚线</Select.Option>
                    <Select.Option value="dotted">点线</Select.Option>
                  </Select>
                </FormItem>
                <FormItem label="边框颜色">
                  <Input
                    type="color"
                    value={selectedComponent.value?.style?.borderColor}
                    onChange={(e: Event) =>
                      handleStyleChange('borderColor', (e.target as HTMLInputElement).value)
                    }
                  />
                </FormItem>
                <FormItem label="圆角">
                  <InputNumber
                    value={parseInt(String(selectedComponent.value?.style?.borderRadius))}
                    addon-after="px"
                    onChange={(value) => {
                      const num = handleNumberChange(value)
                      if (num !== undefined) handleStyleChange('borderRadius', `${num}px`)
                    }}
                  />
                </FormItem>

                {/* 布局样式配置 */}
                <FormItem label="宽度">
                  <InputNumber
                    value={
                      selectedComponent.value?.style?.width === 'auto'
                        ? undefined
                        : parseInt(String(selectedComponent.value?.style?.width))
                    }
                    addon-after="px"
                    onChange={(value) => {
                      const num = handleNumberChange(value)
                      handleStyleChange('width', num !== undefined ? `${num}px` : 'auto')
                    }}
                  />
                </FormItem>
                <FormItem label="高度">
                  <InputNumber
                    value={
                      selectedComponent.value?.style?.height === 'auto'
                        ? undefined
                        : parseInt(String(selectedComponent.value?.style?.height))
                    }
                    addon-after="px"
                    onChange={(value) => {
                      const num = handleNumberChange(value)
                      handleStyleChange('height', num !== undefined ? `${num}px` : 'auto')
                    }}
                  />
                </FormItem>
                <FormItem label="外边距">
                  <Input
                    value={selectedComponent.value?.style?.margin}
                    onChange={(e: Event) =>
                      handleStyleChange('margin', (e.target as HTMLInputElement).value)
                    }
                    placeholder="例如: 10px 20px"
                  />
                </FormItem>
                <FormItem label="内边距">
                  <Input
                    value={selectedComponent.value?.style?.padding}
                    onChange={(e: Event) =>
                      handleStyleChange('padding', (e.target as HTMLInputElement).value)
                    }
                    placeholder="例如: 10px 20px"
                  />
                </FormItem>
              </Form>
            </TabPane>
          </Tabs>
        )}
      </div>
    )
  },
})
