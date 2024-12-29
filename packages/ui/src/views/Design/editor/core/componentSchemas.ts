import type { JSONSchema7 } from 'json-schema'
import Ajv from 'ajv'
import type { Component } from '@/types/component'

// 基础样式 Schema
const baseStyleSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    position: { type: 'string', enum: ['absolute', 'relative', 'fixed'] },
    width: { type: 'string', pattern: '^\\d+px|\\d+%|auto$' },
    height: { type: 'string', pattern: '^\\d+px|\\d+%|auto$' },
    top: { type: 'string', pattern: '^\\d+px|\\d+%|auto$' },
    left: { type: 'string', pattern: '^\\d+px|\\d+%|auto$' },
    margin: { type: 'string' },
    padding: { type: 'string' },
    backgroundColor: { type: 'string' },
    backgroundImage: { type: 'string' },
    backgroundSize: { type: 'string' },
    backgroundPosition: { type: 'string' },
    borderWidth: { type: 'string', pattern: '^\\d+px$' },
    borderStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted', 'none'] },
    borderColor: { type: 'string' },
    borderRadius: { type: 'string', pattern: '^\\d+px|\\d+%$' },
    fontSize: { type: 'string', pattern: '^\\d+px|\\d+em|\\d+rem$' },
    fontWeight: { type: 'string', enum: ['normal', 'bold', 'lighter'] },
    color: { type: 'string' },
    textAlign: { type: 'string', enum: ['left', 'center', 'right', 'justify'] },
    lineHeight: { type: 'string' },
    opacity: { type: 'number', minimum: 0, maximum: 1 },
    transform: { type: 'string' },
    transition: { type: 'string' },
    zIndex: { type: 'number' },
    display: { type: 'string', enum: ['block', 'flex', 'grid', 'none'] },
    flexDirection: { type: 'string', enum: ['row', 'column', 'row-reverse', 'column-reverse'] },
    justifyContent: {
      type: 'string',
      enum: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'],
    },
    alignItems: {
      type: 'string',
      enum: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    },
  },
  additionalProperties: false,
}

// 基础事件 Schema
const baseEventSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['click', 'change', 'focus', 'blur', 'input', 'submit'] },
    handler: { type: 'string' },
  },
  required: ['type', 'handler'],
}

// 基础动画 Schema
const baseAnimationSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['fade', 'slide', 'zoom', 'rotate'] },
    duration: { type: 'number', minimum: 0 },
    delay: { type: 'number', minimum: 0 },
    easing: {
      type: 'string',
      enum: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'],
    },
  },
  required: ['type', 'duration'],
}

// API 配置 Schema
const apiConfigSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
    url: { type: 'string', format: 'uri' },
    params: { type: 'object' },
    headers: { type: 'object' },
    body: { type: 'object' },
  },
  required: ['method', 'url'],
}

// 数据绑定 Schema
const dataBindingSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    path: { type: 'string' },
    defaultValue: { type: 'string' },
    transform: { type: 'string' },
  },
  required: ['source', 'path'],
}

// 组件基础 Schema
const baseComponentSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: { type: 'string' },
    title: { type: 'string' },
    icon: { type: 'string' },
    style: baseStyleSchema,
    events: {
      type: 'array',
      items: baseEventSchema,
    },
    animations: {
      type: 'array',
      items: baseAnimationSchema,
    },
    dataBindings: {
      type: 'array',
      items: dataBindingSchema,
    },
    apis: {
      type: 'array',
      items: apiConfigSchema,
    },
  },
  required: ['id', 'type'],
}

// 按钮组件 Schema
const buttonSchema: JSONSchema7 = {
  type: 'object',
  allOf: [
    { $ref: '#/definitions/baseComponent' },
    {
      properties: {
        props: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            type: { type: 'string', enum: ['primary', 'default', 'dashed', 'link', 'text'] },
            size: { type: 'string', enum: ['large', 'middle', 'small'] },
            disabled: { type: 'boolean' },
            loading: { type: 'boolean' },
            icon: { type: 'string' },
          },
        },
      },
    },
  ],
}

// 输入框组件 Schema
const inputSchema: JSONSchema7 = {
  type: 'object',
  allOf: [
    { $ref: '#/definitions/baseComponent' },
    {
      properties: {
        props: {
          type: 'object',
          properties: {
            placeholder: { type: 'string' },
            type: {
              type: 'string',
              enum: ['text', 'password', 'number', 'email', 'tel', 'url'],
            },
            maxLength: { type: 'number' },
            disabled: { type: 'boolean' },
            readonly: { type: 'boolean' },
            allowClear: { type: 'boolean' },
            prefix: { type: 'string' },
            suffix: { type: 'string' },
          },
        },
      },
    },
  ],
}

// 选择器组件 Schema
const selectSchema: JSONSchema7 = {
  type: 'object',
  allOf: [
    { $ref: '#/definitions/baseComponent' },
    {
      properties: {
        props: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  value: { type: ['string', 'number'] },
                  disabled: { type: 'boolean' },
                },
                required: ['label', 'value'],
              },
            },
            placeholder: { type: 'string' },
            mode: { type: 'string', enum: ['default', 'multiple', 'tags'] },
            disabled: { type: 'boolean' },
            allowClear: { type: 'boolean' },
            showSearch: { type: 'boolean' },
          },
          required: ['options'],
        },
      },
    },
  ],
}

// 表格组件 Schema
const tableSchema: JSONSchema7 = {
  type: 'object',
  allOf: [
    { $ref: '#/definitions/baseComponent' },
    {
      properties: {
        props: {
          type: 'object',
          properties: {
            columns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  dataIndex: { type: 'string' },
                  key: { type: 'string' },
                  width: { type: ['string', 'number'] },
                  fixed: { type: 'string', enum: ['left', 'right'] },
                  sorter: { type: 'boolean' },
                  filters: { type: 'array' },
                },
                required: ['title', 'dataIndex'],
              },
            },
            dataSource: { type: 'array' },
            loading: { type: 'boolean' },
            pagination: {
              type: ['boolean', 'object'],
              properties: {
                current: { type: 'number' },
                pageSize: { type: 'number' },
                total: { type: 'number' },
              },
            },
            scroll: {
              type: 'object',
              properties: {
                x: { type: ['string', 'number'] },
                y: { type: ['string', 'number'] },
              },
            },
          },
          required: ['columns'],
        },
      },
    },
  ],
}

// 表单组件 Schema
const formSchema: JSONSchema7 = {
  type: 'object',
  allOf: [
    { $ref: '#/definitions/baseComponent' },
    {
      properties: {
        props: {
          type: 'object',
          properties: {
            layout: { type: 'string', enum: ['horizontal', 'vertical', 'inline'] },
            labelCol: {
              type: 'object',
              properties: {
                span: { type: 'number' },
                offset: { type: 'number' },
              },
            },
            wrapperCol: {
              type: 'object',
              properties: {
                span: { type: 'number' },
                offset: { type: 'number' },
              },
            },
            name: { type: 'string' },
            initialValues: { type: 'object' },
            scrollToFirstError: { type: 'boolean' },
          },
        },
      },
    },
  ],
}

// 图表组件 Schema
const chartSchema: JSONSchema7 = {
  type: 'object',
  allOf: [
    { $ref: '#/definitions/baseComponent' },
    {
      properties: {
        props: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['line', 'bar', 'pie', 'scatter', 'radar', 'heatmap'],
            },
            data: { type: 'array' },
            xField: { type: 'string' },
            yField: { type: 'string' },
            seriesField: { type: 'string' },
            color: {
              type: ['string', 'array'],
              items: { type: 'string' },
            },
            animation: {
              type: 'object',
              properties: {
                appear: { type: 'object' },
                enter: { type: 'object' },
                leave: { type: 'object' },
              },
            },
          },
          required: ['type', 'data'],
        },
      },
    },
  ],
}

// 更多动画类型
const extendedAnimationSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [
        'fade',
        'slide',
        'zoom',
        'rotate',
        'bounce',
        'flip',
        'shake',
        'swing',
        'rubberBand',
        'jello',
        'tada',
        'wobble',
        'slideInUp',
        'slideInDown',
        'slideInLeft',
        'slideInRight',
        'zoomIn',
        'zoomInUp',
        'zoomInDown',
        'zoomInLeft',
        'zoomInRight',
        'rotateIn',
        'rotateInUpLeft',
        'rotateInUpRight',
        'rotateInDownLeft',
        'rotateInDownRight',
      ],
    },
    duration: { type: 'number', minimum: 0 },
    delay: { type: 'number', minimum: 0 },
    easing: {
      type: 'string',
      enum: [
        'linear',
        'ease',
        'ease-in',
        'ease-out',
        'ease-in-out',
        'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // bouncing
        'cubic-bezier(0.215, 0.61, 0.355, 1)', // easeOutCubic
        'cubic-bezier(0.645, 0.045, 0.355, 1)', // easeInOutCubic
        'cubic-bezier(0.95, 0.05, 0.795, 0.035)', // easeInExpo
        'cubic-bezier(0.19, 1, 0.22, 1)', // easeOutExpo
      ],
    },
    iterationCount: { type: ['number', 'string'], enum: ['infinite'] },
    direction: {
      type: 'string',
      enum: ['normal', 'reverse', 'alternate', 'alternate-reverse'],
    },
    fillMode: {
      type: 'string',
      enum: ['none', 'forwards', 'backwards', 'both'],
    },
  },
  required: ['type', 'duration'],
}

// 导出所有 Schema
export const componentSchemas = {
  definitions: {
    baseComponent: baseComponentSchema,
    baseStyle: baseStyleSchema,
    baseEvent: baseEventSchema,
    baseAnimation: extendedAnimationSchema, // 使用扩展的动画 Schema
    apiConfig: apiConfigSchema,
    dataBinding: dataBindingSchema,
  },
  components: {
    button: buttonSchema,
    input: inputSchema,
    select: selectSchema,
    table: tableSchema,
    form: formSchema,
    chart: chartSchema,
  } as const,
} as const

// 组件类型
export type ComponentType = keyof typeof componentSchemas.components

// Schema 验证函数
export function validateComponent(component: Component, type: ComponentType): boolean {
  const schema = componentSchemas.components[type]
  if (!schema) {
    console.error(`未找到组件类型 "${type}" 的 Schema`)
    return false
  }

  // 使用 ajv 进行验证
  const ajv = new Ajv({ allErrors: true })
  ajv.addSchema(componentSchemas.definitions.baseComponent, '#/definitions/baseComponent')

  const validate = ajv.compile(schema)
  const valid = validate(component)

  if (!valid) {
    console.error('组件验证失败:', validate.errors)
  }

  return valid
}

// 组件默认值生成函数
export function generateDefaultProps(type: ComponentType): Record<string, unknown> {
  const schema = componentSchemas.components[type]
  if (!schema) {
    console.error(`未找到组件类型 "${type}" 的 Schema`)
    return {}
  }

  // 递归生成默认值
  function generateDefaults(schema: JSONSchema7): Record<string, unknown> {
    if (!schema.properties) return {}

    const defaults: Record<string, unknown> = {}
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (prop && typeof prop === 'object' && !Array.isArray(prop)) {
        const schemaProp = prop as JSONSchema7
        if ('default' in schemaProp) {
          defaults[key] = schemaProp.default
        } else if (schemaProp.type === 'object') {
          defaults[key] = generateDefaults(schemaProp)
        } else if (schemaProp.type === 'array') {
          defaults[key] = []
        } else if (schemaProp.type === 'string') {
          defaults[key] = ''
        } else if (schemaProp.type === 'number') {
          defaults[key] = 0
        } else if (schemaProp.type === 'boolean') {
          defaults[key] = false
        }
      }
    }
    return defaults
  }

  return generateDefaults(schema)
}
