import type { CSSProperties } from 'vue'

export interface BaseEvent {
  type: 'click' | 'change' | 'focus' | 'blur' | 'input' | 'submit'
  handler: string
}

export interface Animation {
  type:
    | 'fade'
    | 'slide'
    | 'zoom'
    | 'rotate'
    | 'bounce'
    | 'flip'
    | 'shake'
    | 'swing'
    | 'rubberBand'
    | 'jello'
    | 'tada'
    | 'wobble'
  duration: number
  delay?: number
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  iterationCount?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

export interface ApiConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  params?: Record<string, string | number | boolean>
  headers?: Record<string, string>
  body?: Record<string, unknown>
}

export interface DataBinding {
  source: string
  path: string
  defaultValue?: string | number | boolean
  transform?: string
}

export interface ComponentStyle extends CSSProperties {
  position?: 'absolute' | 'relative' | 'fixed'
  width?: string
  height?: string
  top?: string
  left?: string
  margin?: string
  padding?: string
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string
  borderWidth?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderColor?: string
  borderRadius?: string
  fontSize?: string
  fontWeight?: 'normal' | 'bold' | 'lighter'
  color?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: string
  opacity?: number
  transform?: string
  transition?: string
  zIndex?: number
  display?: 'block' | 'flex' | 'grid' | 'none'
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
}

export interface ComponentProps {
  [key: string]: unknown
  text?: string
  type?: string
  size?: 'large' | 'middle' | 'small'
  disabled?: boolean
  loading?: boolean
  icon?: string
  placeholder?: string
  maxLength?: number
  readonly?: boolean
  allowClear?: boolean
  prefix?: string
  suffix?: string
  options?: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>
  mode?: 'default' | 'multiple' | 'tags'
  showSearch?: boolean
}

// 组件类型
export interface Component {
  id: string
  type: string
  title: string
  icon: string
  style?: ComponentStyle
  props?: ComponentProps
  events?: BaseEvent[]
  animations?: Animation[]
  dataBindings?: DataBinding[]
  apis?: ApiConfig[]
}

export type ComponentType = 'button' | 'input' | 'select' | 'table' | 'form' | 'chart'

export interface DesignState {
  components: Component[]
  selectedId: string | null
  clipboard: Component | null
  history: Component[][]
  currentIndex: number
  undoStack: Component[][]
  redoStack: Component[][]
  dataStore: Record<string, unknown>
  currentDesign: {
    id: string
    name: string
    description: string
    thumbnail: string
    version: string
    author: string
    createTime: string
    updateTime: string
  }
}
