import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useDesignStore } from '@/stores/design'
import type { TabKey, PropertyPanelState } from '../types'
import type { Component, PropValue, DataSource, EventHandler, StyleValue } from '@/types/component'
import { componentSchemas, type ComponentType } from '../core/componentSchemas'

export function usePropertyPanel() {
  const designStore = useDesignStore()
  const activeTab = ref<TabKey>('props')
  const error = ref<Error | null>(null)

  // 当前选中的组件
  const selectedComponent = computed<Component | null>(() => 
    designStore.selectedComponent || null
  )

  // 组件的schema
  const componentSchema = computed(() => {
    if (!selectedComponent.value) return null
    const type = selectedComponent.value.type as ComponentType
    return componentSchemas[type] || null
  })

  // Tab切换处理
  const handleTabChange = (key: TabKey) => {
    activeTab.value = key
  }

  // 属性更新处理
  const handlePropChange = (key: string, value: PropValue) => {
    if (!selectedComponent.value) return

    try {
      designStore.updateComponent({
        ...selectedComponent.value,
        props: {
          ...selectedComponent.value.props,
          [key]: value
        }
      })
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('更新属性失败')
    }
  }

  // 数据配置更新处理
  const handleDataChange = (dataSource: DataSource) => {
    if (!selectedComponent.value) return

    try {
      designStore.updateComponent({
        ...selectedComponent.value,
        dataSource
      })
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('更新数据配置失败')
    }
  }

  // 事件配置更新处理
  const handleEventChange = (event: EventHandler) => {
    if (!selectedComponent.value) return

    try {
      const events = [...(selectedComponent.value.events || [])]
      const index = events.findIndex(e => e.type === event.type && e.name === event.name)
      
      if (index > -1) {
        events[index] = event
      } else {
        events.push(event)
      }

      designStore.updateComponent({
        ...selectedComponent.value,
        events
      })
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('更新事件配置失败')
    }
  }

  // 样式更新处理
  const handleStyleChange = (style: StyleValue) => {
    if (!selectedComponent.value) return

    try {
      designStore.updateComponent({
        ...selectedComponent.value,
        style: {
          ...selectedComponent.value.style,
          ...style
        }
      })
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('更新样式失败')
    }
  }

  // 导出属性面板状态
  const state = computed<PropertyPanelState>(() => ({
    activeTab: activeTab.value,
    selectedComponent: selectedComponent.value,
    componentSchema: componentSchema.value,
    error: error.value
  }))

  return {
    // 状态
    activeTab,
    selectedComponent,
    componentSchema,
    error,
    state,

    // 事件处理方法
    handleTabChange,
    handlePropChange,
    handleDataChange,
    handleEventChange,
    handleStyleChange
  } as const
}