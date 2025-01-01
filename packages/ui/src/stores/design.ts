import { defineStore } from 'pinia'
import type { Component } from '@/types/component'
import type { Store } from 'pinia'

interface DesignState {
  components: Component[]
  selectedId: string | null
  selectedIds: string[]
  clipboard: Component | null
  history: {
    past: Component[][]
    future: Component[][]
  }
}

// 保存设计
const saveDesign = async function () {
  try {
    // TODO: 实现保存逻辑
    const designData = {
      components: {},
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

export const useDesignStore: () => Store<
  'design',
  DesignState,
  {
    selectedComponent: (state: DesignState) => Component | undefined
    canUndo: (state: DesignState) => boolean
    canRedo: (state: DesignState) => boolean
  },
  {
    addComponent(component: Component): void
    updateComponent(component: Component): void
    deleteComponent(id: string): void
    selectComponent(id: string | null): void
    toggleSelection(id: string): void
    clearSelection(): void
    copyComponent(id: string): void
    pasteComponent(): void
    moveComponent(id: string, direction: 'up' | 'down'): void
    saveState(): void
    undo(): void
    redo(): void
    saveDesign(): Promise<boolean>
    exportDesign(): Promise<boolean>
    getData(source: string, path: string): unknown
  }
> = defineStore('design', {
  state: (): DesignState => ({
    components: [],
    selectedId: null,
    selectedIds: [],
    clipboard: null,
    history: {
      past: [],
      future: [],
    },
  }),

  getters: {
    selectedComponent: (state): Component | undefined => {
      return state.components.find((c) => c.id === state.selectedId)
    },
    canUndo: (state): boolean => state.history.past.length > 0,
    canRedo: (state): boolean => state.history.future.length > 0,
  },

  actions: {
    // 添加组件
    addComponent(component: Component) {
      this.saveState()
      this.components.push(component)
    },

    // 更新组件
    updateComponent(component: Component) {
      this.saveState()
      const index = this.components.findIndex((c) => c.id === component.id)
      if (index !== -1) {
        this.components[index] = component
      }
    },

    // 删除组件
    deleteComponent(id: string) {
      this.saveState()
      const index = this.components.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.components.splice(index, 1)
        if (this.selectedId === id) {
          this.selectedId = null
        }
        this.selectedIds = this.selectedIds.filter((sid) => sid !== id)
      }
    },

    // 选择组件
    selectComponent(id: string | null) {
      this.selectedId = id
      if (id) {
        if (!this.selectedIds.includes(id)) {
          this.selectedIds.push(id)
        }
      } else {
        this.selectedIds = []
      }
    },

    // 多选组件
    toggleSelection(id: string) {
      const index = this.selectedIds.indexOf(id)
      if (index === -1) {
        this.selectedIds.push(id)
      } else {
        this.selectedIds.splice(index, 1)
      }
      this.selectedId = this.selectedIds[this.selectedIds.length - 1] || null
    },

    // 清除选择
    clearSelection() {
      this.selectedId = null
      this.selectedIds = []
    },

    // 复制组件
    copyComponent(id: string) {
      const component = this.components.find((c) => c.id === id)
      if (component) {
        this.clipboard = { ...component }
      }
    },

    // 粘贴组件
    pasteComponent() {
      if (this.clipboard) {
        const newComponent = {
          ...this.clipboard,
          id: `${this.clipboard.type}_${Date.now()}`,
          style: {
            ...this.clipboard.style,
            left: this.clipboard.style.left
              ? `${parseInt(this.clipboard.style.left as string) + 20}px`
              : '20px',
            top: this.clipboard.style.top
              ? `${parseInt(this.clipboard.style.top as string) + 20}px`
              : '20px',
          },
        }
        this.addComponent(newComponent)
        this.selectComponent(newComponent.id)
      }
    },

    // 移动组件层级
    moveComponent(id: string, direction: 'up' | 'down') {
      this.saveState()
      const index = this.components.findIndex((c) => c.id === id)
      if (index !== -1) {
        if (direction === 'up' && index < this.components.length - 1) {
          const temp = this.components[index]
          this.components[index] = this.components[index + 1]
          this.components[index + 1] = temp
        } else if (direction === 'down' && index > 0) {
          const temp = this.components[index]
          this.components[index] = this.components[index - 1]
          this.components[index - 1] = temp
        }
      }
    },

    // 保存状态用于撤销/重做
    saveState() {
      this.history.past.push([...this.components])
      this.history.future = []
    },

    // 撤销
    undo() {
      if (this.history.past.length > 0) {
        const current = [...this.components]
        const previous = this.history.past.pop()!
        this.history.future.push(current)
        this.components = previous
      }
    },

    // 重做
    redo() {
      if (this.history.future.length > 0) {
        const current = [...this.components]
        const next = this.history.future.pop()!
        this.history.past.push(current)
        this.components = next
      }
    },

    // 获取数据
    getData(source: string, path: string): unknown {
      // TODO: 实现数据获取逻辑
      return this.components.find((c) => c.id === source)?.props?.[path]
    },

    saveDesign,
    exportDesign,
  },
})
