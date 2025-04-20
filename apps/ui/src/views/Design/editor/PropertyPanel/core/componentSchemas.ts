import type { PropSchema } from '../types'

export type ComponentType = 
  | 'Button' 
  | 'Input' 
  | 'Select' 
  | 'Table' 
  | 'Form' 
  | 'Layout' 
  | 'Chart'
  | 'Custom'

export interface ComponentSchema {
  type: ComponentType
  title: string
  properties: {
    props: {
      type: 'object'
      properties: Record<string, PropSchema>
    }
    style?: {
      type: 'object'
      properties: Record<string, PropSchema>
    }
  }
}

// 组件属性schema定义
export const componentSchemas: Record<ComponentType, ComponentSchema> = {
  Button: {
    type: 'Button',
    title: '按钮',
    properties: {
      props: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            title: '类型',
            enum: ['primary', 'default', 'dashed', 'text', 'link'],
            defaultValue: 'default'
          },
          size: {
            type: 'string',
            title: '大小',
            enum: ['large', 'middle', 'small'],
            defaultValue: 'middle'
          },
          disabled: {
            type: 'boolean',
            title: '禁用',
            defaultValue: false
          },
          loading: {
            type: 'boolean',
            title: '加载中',
            defaultValue: false
          },
          text: {
            type: 'string',
            title: '文本',
            defaultValue: '按钮'
          }
        }
      }
    }
  },
  Input: {
    type: 'Input',
    title: '输入框',
    properties: {
      props: {
        type: 'object',
        properties: {
          placeholder: {
            type: 'string',
            title: '占位提示'
          },
          disabled: {
            type: 'boolean',
            title: '禁用'
          },
          allowClear: {
            type: 'boolean',
            title: '允许清除'
          },
          size: {
            type: 'string',
            title: '大小',
            enum: ['large', 'middle', 'small']
          }
        }
      }
    }
  },
  Select: {
    type: 'Select',
    title: '选择器',
    properties: {
      props: {
        type: 'object',
        properties: {
          placeholder: {
            type: 'string',
            title: '占位提示'
          },
          mode: {
            type: 'string',
            title: '模式',
            enum: ['default', 'multiple', 'tags']
          },
          disabled: {
            type: 'boolean',
            title: '禁用'
          },
          allowClear: {
            type: 'boolean',
            title: '允许清除'
          }
        }
      }
    }
  },
  Table: {
    type: 'Table',
    title: '表格',
    properties: {
      props: {
        type: 'object',
        properties: {
          bordered: {
            type: 'boolean',
            title: '显示边框'
          },
          loading: {
            type: 'boolean',
            title: '加载状态'
          },
          size: {
            type: 'string',
            title: '大小',
            enum: ['large', 'middle', 'small']
          }
        }
      }
    }
  },
  Form: {
    type: 'Form',
    title: '表单',
    properties: {
      props: {
        type: 'object',
        properties: {
          layout: {
            type: 'string',
            title: '布局',
            enum: ['horizontal', 'vertical', 'inline']
          },
          labelCol: {
            type: 'object',
            title: '标签列属性',
            properties: {
              span: {
                type: 'number',
                title: '跨度'
              }
            }
          }
        }
      }
    }
  },
  Layout: {
    type: 'Layout',
    title: '布局',
    properties: {
      props: {
        type: 'object',
        properties: {
          direction: {
            type: 'string',
            title: '方向',
            enum: ['horizontal', 'vertical']
          },
          gap: {
            type: 'number',
            title: '间距'
          }
        }
      }
    }
  },
  Chart: {
    type: 'Chart',
    title: '图表',
    properties: {
      props: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            title: '类型',
            enum: ['line', 'bar', 'pie', 'scatter']
          },
          showLegend: {
            type: 'boolean',
            title: '显示图例'
          },
          showTooltip: {
            type: 'boolean',
            title: '显示提示'
          }
        }
      }
    }
  },
  Custom: {
    type: 'Custom',
    title: '自定义组件',
    properties: {
      props: {
        type: 'object',
        properties: {}
      }
    }
  }
}