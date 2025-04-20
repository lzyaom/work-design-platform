import { defineStore } from 'pinia'
import type { Component } from '@/types/component'
import { computed, reactive, ref } from 'vue'

export const cacheComponents = new WeakMap<object, Component>()

export const useDesignStore = defineStore('design', () => {
  const components = ref<Component[]>([])
  const selectedId = ref<string | null>(null)
  const selectedIds = ref<string[]>([])
  const clipboard = ref<Component | null>(null)
  const history = reactive({
    past: [] as Component[],
    future: [] as Component[],
  })

  const selectedComponent = computed((): Component | undefined => {
    return components.value.find((component) => component.id === selectedId.value)
  })
  const canUndo = computed((): boolean => history.past.length > 0)
  const canRedo = computed((): boolean => history.future.length > 0)

  // 添加组件
  const addComponent = (component: Component) => {
    saveState()
    components.value.push(component)
    cacheComponents.set(component, component)
  }

  // 更新组件
  const updateComponent = (component: Component) => {
    saveState()
    const index = components.value.findIndex((c) => c.id === component.id)
    if (index !== -1) {
      components.value[index] = component
      cacheComponents.set(component, component)
    }
  }

  // 删除组件
  const deleteComponent = (id: string) => {
    saveState()
    const index = components.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      components.value.splice(index, 1)
      cacheComponents.delete(components.value[index])
    }
    if (selectedId.value === id) {
      selectedId.value = null
      selectedIds.value = []
    }

    clipboard.value = null
  }

  // 选择组件
  const selectComponent = (id: string | null) => {
    selectedId.value = id
    if (id) {
      if (!selectedIds.value.includes(id)) {
        selectedIds.value.push(id)
      }
    } else {
      selectedIds.value = []
    }
  }

  // 多选组件
  const toggleSelection = (id: string) => {
    const index = selectedIds.value.indexOf(id)
    if (index === -1) {
      selectedIds.value.push(id)
    } else {
      selectedIds.value.splice(index, 1)
    }
    selectedId.value = selectedIds.value[selectedIds.value.length - 1] || null
  }

  // 清除选择
  const clearSelection = () => {
    selectedId.value = null
    selectedIds.value = []
  }

  // 复制组件
  const copyComponent = (id: string) => {
    const index = components.value.findIndex((c) => c.id === id)
    if (index === -1) return
    const component = components.value[index]
    clipboard.value = { ...component }
  }

  // 粘贴组件
  const pasteComponent = () => {
    if (clipboard.value) {
      const newComponent = {
        ...clipboard.value,
        id: `${clipboard.value.type}_${Date.now()}`,
        style: {
          ...clipboard.value.style,
          left: clipboard.value.style?.left
            ? `${parseInt(clipboard.value.style.left as string) + 20}px`
            : '20px',
          top: clipboard.value.style?.top
            ? `${parseInt(clipboard.value.style.top as string) + 20}px`
            : '20px',
        },
      }
      addComponent(newComponent)
      selectComponent(newComponent.id)
    }
  }

  // 移动组件层级
  const moveComponent = (id: string, direction: 'up' | 'down') => {
    saveState()
    const index = components.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      if (direction === 'up' && index < components.value.length - 1) {
        const temp = components.value[index]
        components.value[index] = components.value[index + 1]
        components.value[index + 1] = temp
      } else if (direction === 'down' && index > 0) {
        const temp = components.value[index]
        components.value[index] = components.value[index - 1]
        components.value[index - 1] = temp
      }
    }
  }

  // 保存状态用于撤销/重做
  const saveState = () => {
    const list = Array.from(components.value.values())
    history.past.push(...list)
    history.future = []
  }

  // 撤销
  const undo = () => {
    if (history.past.length > 0) {
      const list = components.value.slice() 
      const previous = history.past.pop()!
      history.future.push(...list)
      components.value.push(previous)
    }
  }

  // 重做
  const redo = () => {
    if (history.future.length > 0) {
      const list = components.value.slice() 
      const next = history.future.pop()!
      history.past.push(...list)
      components.value.push(next)
    }
  }

  // 获取数据
  const getData = (source: string, path: string): unknown => {
    return components.value.find((c) => c.id === source)?.props?.[path] || null
  }

  // 保存设计
  const saveDesign = async function () {
    try {
      // TODO: 实现保存逻辑
      const designData = {
        components: components.value.slice,
        // 其他需要保存的数据
      }

      // 这里可以调用API保存数据
      console.log('保存设计:', designData)
      return true
    } catch (error) {
      console.error('保存设计失败:', error)
      return false
    }
  }

  // 导出设计
  const exportDesign = async function () {
    try {
      // TODO: 实现导出逻辑
      const exportData = {
        components: {},
        // 其他需要导出的数据
      }

      // 这里可以生成导出文件
      console.log('导出设计:', exportData)
      return true
    } catch (error) {
      console.error('导出设计失败:', error)
      return false
    }
  }
  return {
    components,
    selectedId,
    selectedIds,
    clipboard,
    selectedComponent,
    canUndo,
    canRedo,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    toggleSelection,
    clearSelection,
    copyComponent,
    pasteComponent,
    moveComponent,
    saveState,
    undo,
    redo,
    getData,
    saveDesign,
    exportDesign,
  }
})
