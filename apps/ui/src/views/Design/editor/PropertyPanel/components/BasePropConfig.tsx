import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { Form, Input, InputNumber, Select, Switch } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import type { DefaultOptionType } from 'ant-design-vue/es/select'
import type { PropConfigProps } from '../types'
import type { PropSchema } from '../types'
import type { ComponentType } from '../core/componentSchemas'
import { componentSchemas } from '../core/componentSchemas'
import './style.css'

const { Item: FormItem } = Form

export const BasePropConfig = defineComponent({
  name: 'BasePropConfig',
  
  props: {
    component: {
      type: Object as PropType<PropConfigProps['component']>,
      required: true
    },
    onChange: {
      type: Function as PropType<PropConfigProps['onChange']>,
      required: true
    }
  },

  setup(props) {
    const renderPropField = (key: string, schema: PropSchema) => {
      const value = props.component.props[key]
      
      // 根据schema类型渲染对应的表单控件
      switch (schema.type) {
        case 'string':
          if (schema.enum) {
            return (
              <Select
                value={String(value)}
                onChange={(value: SelectProps['value']) => {
                  if (value !== undefined) {
                    props.onChange(key, String(value))
                  }
                }}
              >
                {schema.enum.map((option, index) => (
                  <Select.Option 
                    key={String(option)} 
                    value={String(option)}
                  >
                    {schema.enumNames?.[index] || option}
                  </Select.Option>
                ))}
              </Select>
            )
          }
          return (
            <Input
              value={String(value)}
              onChange={(e: Event) => {
                props.onChange(key, (e.target as HTMLInputElement).value)
              }}
            />
          )

        case 'number':
          return (
            <InputNumber
              value={Number(value)}
              onChange={(value) => {
                if (typeof value === 'number' && !isNaN(value)) {
                  props.onChange(key, value)
                }
              }}
            />
          )

        case 'boolean':
          const boolValue = Boolean(value)
          return (
            <Switch
              checked={boolValue}
              checkedValue={true}
              unCheckedValue={false}
              onChange={() => {
                props.onChange(key, !boolValue)
              }}
            />
          )

        case 'object':
          if (schema.properties) {
            return (
              <div class="nested-props">
                {Object.entries(schema.properties).map(([subKey, subSchema]) => (
                  <FormItem key={subKey} label={subSchema.title || subKey}>
                    {renderPropField(`${key}.${subKey}`, subSchema as PropSchema)}
                  </FormItem>
                ))}
              </div>
            )
          }
          return null

        default:
          return null
      }
    }

    return () => {
      const componentType = props.component.type as ComponentType
      const schema = componentSchemas[componentType]?.properties.props

      if (!schema?.properties) {
        return (
          <div class="base-prop-config base-prop-config--empty">
            <p>该组件没有可配置的属性</p>
          </div>
        )
      }

      return (
        <div class="base-prop-config">
          <Form layout="vertical">
            {Object.entries(schema.properties).map(([key, propSchema]) => {
              const typedSchema = propSchema as PropSchema
              return (
                <FormItem 
                  key={key} 
                  label={typedSchema.title || key}
                  required={typedSchema.required}
                >
                  {renderPropField(key, typedSchema)}
                  {typedSchema.description && (
                    <div class="prop-description">{typedSchema.description}</div>
                  )}
                </FormItem>
              )
            })}
          </Form>
        </div>
      )
    }
  }
})

export default BasePropConfig