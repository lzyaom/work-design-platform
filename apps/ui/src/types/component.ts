import type { CSSProperties } from 'vue'

export interface BaseEvent {
  type: string
  handler: string
}

export interface Animation {
  type: string
  duration: number
  delay?: number
  easing?: string
}

export interface DataBinding {
  source: string
  path: string
  transform?: string
  defaultValue?: unknown
}

export interface BaseComponent {
  id: string
  type: string
  title: string
  icon: string
  props: Record<string, unknown>
  style: CSSProperties
  events?: BaseEvent[]
  animations?: Animation[]
  dataBindings?: DataBinding[]
}

export interface Component extends BaseComponent {
  type: Exclude<string, 'group'>
}

export interface ComponentGroup extends BaseComponent {
  type: 'group'
  children: Component[]
}

export type ComponentType = Component | ComponentGroup

export interface DesignState {
  components: ComponentType[]
  selectedId: string | null
  selectedIds: string[]
  clipboard: ComponentType | null
  history: {
    past: ComponentType[][]
    future: ComponentType[][]
  }
}
