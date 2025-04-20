// 基础值类型
export type BasicValue = string | number | boolean | null | undefined
export type PropValue = BasicValue | Record<string, BasicValue> | BasicValue[]

// 组件样式类型
export type StyleValue = Partial<CSSStyleDeclaration>

// 数据源类型
export interface DataSource {
  id: string
  type: 'api' | 'static' | 'component'
  config: {
    // API数据源配置
    api?: {
      url: string
      method: string
      params: Record<string, unknown>
    }
    // 静态数据配置
    static?: {
      data: unknown
    }
    // 组件数据源配置
    component?: {
      id: string
      property: string
    }
  }
}

// 数据绑定类型
export interface DataBinding {
  targetProperty: string
  sourceId: string
  sourcePath: string
  transform?: string
}

// 事件类型
export type EventType =
  | 'click'
  | 'change'
  | 'input'
  | 'focus'
  | 'blur'
  | 'mounted'
  | 'updated'
  | 'custom'

// 事件处理器
export interface EventHandler {
  type: EventType
  name: string
  description?: string
  handler: string
  dependencies?: string[]
}

// 组件定义
export interface Component {
  id: string
  type: string
  title?: string
  props: Record<string, PropValue>
  style?: StyleValue
  dataSource?: DataSource
  dataBindings?: DataBinding[]
  events?: EventHandler[]
  animations?: Animation[]
  children?: Component[]
}

// 组件状态
export interface ComponentState {
  id: string
  data: unknown
  error: Error | null
  loading: boolean
}

// 组件事件
export interface ComponentEvent {
  componentId: string
  type: EventType
  data: unknown
}

// 组件上下文
export interface ComponentContext {
  id: string
  refs: Record<string, Component>
  state: Record<string, ComponentState>
  emit: (event: ComponentEvent) => void
  dispatch: (action: unknown) => void
}
