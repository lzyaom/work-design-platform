import type { Component, PropValue, DataSource, EventHandler, StyleValue } from '@/types/component'
import type { ComponentSchema } from './core/componentSchemas'

// 属性面板的Tab类型
export type TabKey = 'props' | 'data' | 'event' | 'style'

// 属性面板的基础Props
export interface BasePanelProps {
  component: Component
}

// 各个配置面板的Props
export interface PropConfigProps extends BasePanelProps {
  onChange: (key: string, value: PropValue) => void
}

export interface DataConfigProps extends BasePanelProps {
  onChange: (dataSource: DataSource) => void
}

export interface EventConfigProps extends BasePanelProps {
  onChange: (event: EventHandler) => void
}

export interface StyleConfigProps extends BasePanelProps {
  onChange: (style: StyleValue) => void
}

// 组件Schema
// @ts-ignore
export interface PropSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  title?: string
  description?: string
  defaultValue?: any
  required?: boolean
  enum?: any[]
  enumNames?: string[]
  items?: PropSchema
  properties?: Record<string, PropSchema>
}

// 属性面板状态
export interface PropertyPanelState {
  activeTab: TabKey
  selectedComponent: Component | null
  componentSchema: ComponentSchema | null
  error: Error | null
}

// 属性面板操作
export type PropertyPanelAction =
  | { type: 'SET_ACTIVE_TAB'; payload: TabKey }
  | { type: 'SET_SELECTED_COMPONENT'; payload: Component | null }
  | { type: 'UPDATE_COMPONENT_PROPS'; payload: { key: string; value: PropValue } }
  | { type: 'UPDATE_COMPONENT_DATA'; payload: DataSource }
  | { type: 'UPDATE_COMPONENT_EVENT'; payload: EventHandler }
  | { type: 'UPDATE_COMPONENT_STYLE'; payload: StyleValue }
  | { type: 'SET_ERROR'; payload: Error | null }
