import { defineStore } from 'pinia'
import type { Component, DesignState } from '@/types/component'

export const useDesignStore = defineStore<
  'design',
  DesignState,
  {
    selectedComponent: (state: DesignState) => Component | undefined
    canUndo: (state: DesignState) => boolean
    canRedo: (state: DesignState) => boolean
  },
  {
    initDesign(): void
    addComponent(component: Component): void
    updateComponent(component: Component): void
    deleteComponent(id: string): void
    selectComponent(id: string | null): void
    clearSelection(): void
    copyComponent(id: string): void
    pasteComponent(): void
    moveComponent(id: string, direction: 'up' | 'down'): void
    saveState(): void
    undo(): void
    redo(): void
    updateDesign(): void
    saveDesign(): Promise<void>
    exportDesign(): DesignState
    importDesign(design: Partial<DesignState>): void
    setData(source: string, data: unknown): void
    getData(source: string, path: string): unknown
    reset(): void
  }
>('design', {
  state: (): DesignState => ({
    components: [],
    selectedId: null,
    clipboard: null,
    history: [],
    currentIndex: -1,
    undoStack: [],
    redoStack: [],
    dataStore: {},
    currentDesign: {
      id: '',
      name: '未命名设计',
      description: '',
      thumbnail: '',
      version: '1.0.0',
      author: '',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    },
  }),

  getters: {
    selectedComponent: (state): Component | undefined =>
      state.components.find((component) => component.id === state.selectedId),

    canUndo: (state): boolean => state.undoStack.length > 0,
    canRedo: (state): boolean => state.redoStack.length > 0,
  },

  actions: {
    // 初始化设计
    initDesign() {
      this.reset()
    },

    // 添加组件
    addComponent(component: Component) {
      this.saveState()
      this.components.push(component)
      this.selectedId = component.id
      this.updateDesign()
    },

    // 更新组件
    updateComponent(component: Component) {
      this.saveState()
      const index = this.components.findIndex((c) => c.id === component.id)
      if (index !== -1) {
        this.components[index] = component
        this.updateDesign()
      }
    },

    // 删除组件
    deleteComponent(id: string) {
      this.saveState()
      const index = this.components.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.components.splice(index, 1)
        this.selectedId = null
        this.updateDesign()
      }
    },

    // 选择组件
    selectComponent(id: string | null) {
      this.selectedId = id
    },

    // 清除选择
    clearSelection() {
      this.selectedId = null
    },

    // 复制组件
    copyComponent(id: string) {
      const component = this.components.find((c) => c.id === id)
      if (component) {
        this.clipboard = JSON.parse(JSON.stringify(component))
      }
    },

    // 粘贴组件
    pasteComponent() {
      if (this.clipboard) {
        this.saveState()
        const newComponent = {
          ...JSON.parse(JSON.stringify(this.clipboard)),
          id: `${this.clipboard.type}_${Date.now()}`,
          style: {
            ...this.clipboard.style,
            left: `${parseInt((this.clipboard.style?.left as string) || '0') + 20}px`,
            top: `${parseInt((this.clipboard.style?.top as string) || '0') + 20}px`,
          },
        }
        this.components.push(newComponent)
        this.selectedId = newComponent.id
        this.updateDesign()
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
        this.updateDesign()
      }
    },

    // 保存状态
    saveState() {
      this.undoStack.push(JSON.parse(JSON.stringify(this.components)))
      this.redoStack = []
    },

    // 撤销
    undo() {
      if (this.canUndo) {
        this.redoStack.push(JSON.parse(JSON.stringify(this.components)))
        this.components = this.undoStack.pop()!
        this.updateDesign()
      }
    },

    // 重做
    redo() {
      if (this.canRedo) {
        this.undoStack.push(JSON.parse(JSON.stringify(this.components)))
        this.components = this.redoStack.pop()!
        this.updateDesign()
      }
    },

    // 更新设计信息
    updateDesign() {
      this.currentDesign.updateTime = new Date().toISOString()
    },

    // 保存设计
    async saveDesign() {
      // TODO: 实现设计保存到服务器
      this.updateDesign()
    },

    // 导出设计
    exportDesign(): DesignState {
      return {
        ...this.$state,
      }
    },

    // 导入设计
    importDesign(design: Partial<DesignState>) {
      this.currentDesign = {
        ...this.currentDesign,
        ...design.currentDesign,
      }
      if (design.components) {
        this.components = design.components
      }
      this.updateDesign()
    },

    // 设置数据
    setData(source: string, data: unknown) {
      this.dataStore[source] = data
    },

    // 获取数据
    getData(source: string, path: string): unknown {
      const data = this.dataStore[source]
      if (!data) return undefined

      return path.split('.').reduce<unknown>((obj, key) => {
        if (obj && typeof obj === 'object') {
          return (obj as Record<string, unknown>)[key]
        }
        return undefined
      }, data)
    },

    // 重置状态
    reset() {
      this.components = []
      this.selectedId = null
      this.clipboard = null
      this.history = []
      this.currentIndex = -1
      this.undoStack = []
      this.redoStack = []
      this.dataStore = {}
      this.currentDesign = {
        id: '',
        name: '未命名设计',
        description: '',
        thumbnail: '',
        version: '1.0.0',
        author: '',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      }
    },
  },
})
