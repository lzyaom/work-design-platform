import type { Component } from '@/types/component'
import type { JSONSchema7 } from 'json-schema'

export interface PageSchema {
  version: string
  components: ComponentSchema[]
  dataSchema: JSONSchema7
}
export type SchemeType = 'object' | 'array' | 'string' | 'number' | 'boolean'
export type PropSchema = {
  type: SchemeType
  title?: string
  description?: string
  enum?: string[]
  minimum?: number
  maximum?: number
  format?: string
  items?: PropSchema | PropSchema[]
  properties?: Record<string, PropSchema>
  required?: string[]
}

export type EventType =
  | 'click'
  | 'change'
  | 'input'
  | 'submit'
  | 'reset'
  | 'mouseover'
  | 'mouseout'
  | 'mousedown'
  | 'mouseup'
  | 'mousemove'
  | 'keydown'
  | 'keyup'
  | 'keypress'
  | 'focus'
  | 'blur'
  | 'select'
  | 'dblclick'
  | 'contextmenu'
  | 'touchstart'
  | 'touchend'
  | 'touchmove'
  | 'touchcancel'
  | 'wheel'
  | 'dragstart'
  | 'drag'
  | 'dragend'
  | 'drop'
  | 'dragenter'
  | 'dragover'
  | 'dragleave'
  | 'paste'
  | 'copy'
  | 'cut'
  | 'resize'
  | 'scroll'

export type ComponentType =
  | 'button'
  | 'input'
  | 'select'
  | 'card'
  | 'table'
  | 'form'
  | 'datePicker'
  | 'timePicker'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'slider'
  | 'rate'
  | 'upload'
  | 'progress'
  | 'avatar'
  | 'badge'
  | 'tag'
  | 'divider'
  | 'space'

export interface ComponentSchema {
  type: ComponentType
  title: string
  icon?: string
  category?: string
  layoutOptions?: {
    resizable?: boolean
    draggable?: boolean
    minimumWidth?: number
    minimumHeight?: number
  }
  description?: string
  properties: {
    props?: PropSchema
    style?: PropSchema
    events?: {
      type: 'array'
      items: {
        type: 'object'
        properties: {
          type: { type: 'string'; enum: EventType[] }
          handler: { type: 'string' }
          description: { type: 'string' }
        }
      }
    }
    dataBindings?: {
      type: 'array'
      items: {
        type: 'object'
        properties: {
          target: { type: 'string' }
          source: { type: 'string' }
          transform: { type: 'string'; format: 'javascript' }
        }
      }
    }
  }
}

// 基础组件 schema
const baseComponentSchema: Partial<ComponentSchema['properties']> = {
  style: {
    type: 'object',
    properties: {
      width: { type: 'string' },
      height: { type: 'string' },
      margin: { type: 'string' },
      padding: { type: 'string' },
      backgroundColor: { type: 'string' },
      borderWidth: { type: 'string' },
      borderStyle: { type: 'string', enum: ['none', 'solid', 'dashed', 'dotted'] },
      borderColor: { type: 'string' },
      borderRadius: { type: 'string' },
      fontSize: { type: 'string' },
      fontWeight: { type: 'string', enum: ['normal', 'bold', 'lighter'] },
      color: { type: 'string' },
      textAlign: { type: 'string', enum: ['left', 'center', 'right', 'justify'] },
      lineHeight: { type: 'string' },
      opacity: { type: 'number', minimum: 0, maximum: 1 },
      zIndex: { type: 'number' },
    },
  },
  events: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['click', 'change', 'input'] },
        handler: { type: 'string' },
        description: { type: 'string' },
      },
    },
  },
  dataBindings: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        target: { type: 'string' },
        source: { type: 'string' },
        transform: { type: 'string', format: 'javascript' },
      },
    },
  },
}

// 组件 schema 定义
export const componentSchemas: Record<ComponentType, ComponentSchema> = {
  button: {
    type: 'button',
    title: '按钮',
    properties: {
      props: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          type: { type: 'string', enum: ['primary', 'default', 'dashed', 'text', 'link'] },
          size: { type: 'string', enum: ['large', 'middle', 'small'] },
          disabled: { type: 'boolean' },
          loading: { type: 'boolean' },
          danger: { type: 'boolean' },
          ghost: { type: 'boolean' },
          block: { type: 'boolean' },
          icon: { type: 'string' },
          shape: { type: 'string', enum: ['default', 'circle', 'round'] },
        },
      },
      ...baseComponentSchema,
    },
  },
  input: {
    type: 'input',
    title: '输入框',
    properties: {
      props: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          placeholder: { type: 'string' },
          type: { type: 'string', enum: ['text', 'password', 'number', 'textarea'] },
          size: { type: 'string', enum: ['large', 'middle', 'small'] },
          disabled: { type: 'boolean' },
          maxLength: { type: 'number' },
          showCount: { type: 'boolean' },
          allowClear: { type: 'boolean' },
          bordered: { type: 'boolean' },
          addonBefore: { type: 'string' },
          addonAfter: { type: 'string' },
          prefix: { type: 'string' },
          suffix: { type: 'string' },
        },
      },
      ...baseComponentSchema,
    },
  },
  select: {
    type: 'select',
    title: '下拉选择',
    properties: {
      props: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              required: ['label', 'value'],
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
                disabled: { type: 'boolean' },
              },
            },
          },
          mode: { type: 'string', enum: ['default', 'multiple', 'tags'] },
          placeholder: { type: 'string' },
          size: { type: 'string', enum: ['large', 'middle', 'small'] },
          disabled: { type: 'boolean' },
          loading: { type: 'boolean' },
          showSearch: { type: 'boolean' },
          allowClear: { type: 'boolean' },
        },
      },
      ...baseComponentSchema,
    },
  },
  card: {
    type: 'card',
    title: '卡片',
    properties: {
      props: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          extra: { type: 'string' },
          bordered: { type: 'boolean' },
          hoverable: { type: 'boolean' },
          loading: { type: 'boolean' },
          size: { type: 'string', enum: ['default', 'small'] },
        },
      },
      ...baseComponentSchema,
    },
  },
  table: {
    type: 'table',
    title: '表格',
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
                width: { type: 'number' },
                fixed: { type: 'string', enum: ['left', 'right'] },
                align: { type: 'string', enum: ['left', 'center', 'right'] },
                sorter: { type: 'boolean' },
                filters: { type: 'array' },
              },
            },
          },
          dataSource: { type: 'array' },
          bordered: { type: 'boolean' },
          loading: { type: 'boolean' },
          size: { type: 'string', enum: ['default', 'middle', 'small'] },
          scroll: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
          },
        },
      },
      ...baseComponentSchema,
    },
  },
  form: {
    type: 'form',
    title: '表单',
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
          colon: { type: 'boolean' },
          labelAlign: { type: 'string', enum: ['left', 'right'] },
          validateOnRuleChange: { type: 'boolean' },
          scrollToFirstError: { type: 'boolean' },
          size: { type: 'string', enum: ['default', 'small', 'large'] },
        },
      },
      ...baseComponentSchema,
    },
  },
  datePicker: {
    type: 'datePicker',
    title: '日期选择',
    properties: {
      props: {
        type: 'object',
        properties: {
          allowClear: { type: 'boolean' },
          autoFocus: { type: 'boolean' },
          disabled: { type: 'boolean' },
          format: { type: 'string' },
          placeholder: { type: 'string' },
          size: { type: 'string', enum: ['large', 'middle', 'small'] },
          bordered: { type: 'boolean' },
          showTime: { type: 'boolean' },
          showToday: { type: 'boolean' },
        },
      },
      ...baseComponentSchema,
    },
  },
  timePicker: {
    type: 'timePicker',
    title: '时间选择',
    properties: {
      props: {
        type: 'object',
        properties: {
          allowClear: { type: 'boolean' },
          autoFocus: { type: 'boolean' },
          disabled: { type: 'boolean' },
          format: { type: 'string' },
          placeholder: { type: 'string' },
          size: { type: 'string', enum: ['large', 'middle', 'small'] },
          bordered: { type: 'boolean' },
          use12Hours: { type: 'boolean' },
          hourStep: { type: 'number' },
          minuteStep: { type: 'number' },
          secondStep: { type: 'number' },
        },
      },
      ...baseComponentSchema,
    },
  },
  switch: {
    type: 'switch',
    title: '开关',
    properties: {
      props: {
        type: 'object',
        properties: {
          checked: { type: 'boolean' },
          disabled: { type: 'boolean' },
          loading: { type: 'boolean' },
          size: { type: 'string', enum: ['default', 'small'] },
          checkedChildren: { type: 'string' },
          unCheckedChildren: { type: 'string' },
        },
      },
      ...baseComponentSchema,
    },
  },
  radio: {
    type: 'radio',
    title: '单选框',
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
                value: { type: 'string' },
                disabled: { type: 'boolean' },
              },
            },
          },
          disabled: { type: 'boolean' },
          buttonStyle: { type: 'string', enum: ['outline', 'solid'] },
          size: { type: 'string', enum: ['large', 'middle', 'small'] },
        },
      },
      ...baseComponentSchema,
    },
  },
  checkbox: {
    type: 'checkbox',
    title: '复选框',
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
                value: { type: 'string' },
                disabled: { type: 'boolean' },
              },
            },
          },
          disabled: { type: 'boolean' },
          indeterminate: { type: 'boolean' },
        },
      },
      ...baseComponentSchema,
    },
  },
  slider: {
    type: 'slider',
    title: '滑动输入条',
    properties: {
      props: {
        type: 'object',
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
          step: { type: 'number' },
          disabled: { type: 'boolean' },
          range: { type: 'boolean' },
          vertical: { type: 'boolean' },
          reverse: { type: 'boolean' },
          marks: { type: 'object' },
        },
      },
      ...baseComponentSchema,
    },
  },
  rate: {
    type: 'rate',
    title: '评分',
    properties: {
      props: {
        type: 'object',
        properties: {
          allowClear: { type: 'boolean' },
          allowHalf: { type: 'boolean' },
          count: { type: 'number' },
          disabled: { type: 'boolean' },
          tooltips: { type: 'array', items: { type: 'string' } },
        },
      },
      ...baseComponentSchema,
    },
  },
  upload: {
    type: 'upload',
    title: '上传',
    properties: {
      props: {
        type: 'object',
        properties: {
          accept: { type: 'string' },
          action: { type: 'string' },
          directory: { type: 'boolean' },
          disabled: { type: 'boolean' },
          listType: { type: 'string', enum: ['text', 'picture', 'picture-card'] },
          multiple: { type: 'boolean' },
          name: { type: 'string' },
          showUploadList: { type: 'boolean' },
        },
      },
      ...baseComponentSchema,
    },
  },
  progress: {
    type: 'progress',
    title: '进度条',
    properties: {
      props: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['line', 'circle', 'dashboard'] },
          percent: { type: 'number' },
          showInfo: { type: 'boolean' },
          status: { type: 'string', enum: ['success', 'exception', 'normal', 'active'] },
          strokeLinecap: { type: 'string', enum: ['round', 'square'] },
          strokeColor: { type: 'string' },
          trailColor: { type: 'string' },
          size: { type: 'string', enum: ['default', 'small'] },
        },
      },
      ...baseComponentSchema,
    },
  },
  avatar: {
    type: 'avatar',
    title: '头像',
    properties: {
      props: {
        type: 'object',
        properties: {
          icon: { type: 'string' },
          shape: { type: 'string', enum: ['circle', 'square'] },
          size: { type: 'string', enum: ['large', 'small', 'default'] },
          src: { type: 'string' },
          srcSet: { type: 'string' },
          alt: { type: 'string' },
        },
      },
      ...baseComponentSchema,
    },
  },
  badge: {
    type: 'badge',
    title: '徽标数',
    properties: {
      props: {
        type: 'object',
        properties: {
          color: { type: 'string' },
          count: { type: 'number' },
          dot: { type: 'boolean' },
          offset: {
            type: 'array',
            items: { type: 'number' },
            minimum: 2,
            maximum: 2,
          },
          overflowCount: { type: 'number' },
          showZero: { type: 'boolean' },
          status: {
            type: 'string',
            enum: ['success', 'processing', 'default', 'error', 'warning'],
          },
          text: { type: 'string' },
          title: { type: 'string' },
        },
      },
      ...baseComponentSchema,
    },
  },
  tag: {
    type: 'tag',
    title: '标签',
    properties: {
      props: {
        type: 'object',
        properties: {
          closable: { type: 'boolean' },
          color: { type: 'string' },
          icon: { type: 'string' },
          visible: { type: 'boolean' },
        },
      },
      ...baseComponentSchema,
    },
  },
  divider: {
    type: 'divider',
    title: '分割线',
    properties: {
      props: {
        type: 'object',
        properties: {
          dashed: { type: 'boolean' },
          orientation: { type: 'string', enum: ['left', 'right', 'center'] },
          plain: { type: 'boolean' },
          type: { type: 'string', enum: ['horizontal', 'vertical'] },
        },
      },
      ...baseComponentSchema,
    },
  },
  space: {
    type: 'space',
    title: '间距',
    properties: {
      props: {
        type: 'object',
        properties: {
          align: { type: 'string', enum: ['start', 'end', 'center', 'baseline'] },
          direction: { type: 'string', enum: ['vertical', 'horizontal'] },
          size: { type: 'string', enum: ['small', 'middle', 'large'] },
          wrap: { type: 'boolean' },
        },
      },
      ...baseComponentSchema,
    },
  },
}

// 验证组件配置
export function validateComponent(component: Component, type: ComponentType): boolean {
  // const schema = componentSchemas[type]
  // if (!schema) return false

  // // 验证必需属性
  // if (!component.id || !component.type || !component.title) {
  //   return false
  // }

  // // 验证属性类型
  // if (component.props && schema.properties.props) {
  //   // TODO: 实现属性验证逻辑
  // }

  // // 验证样式
  // if (component.style && schema.properties.style) {
  //   // TODO: 实现样式验证逻辑
  // }

  // // 验证事件
  // if (component.events && schema.properties.events) {
  //   // TODO: 实现事件验证逻辑
  // }

  return true
}
