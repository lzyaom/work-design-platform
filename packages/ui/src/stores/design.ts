import { defineStore } from 'pinia'
import type { Component } from '@/types/component'

interface DesignState {
  components: Component[]
  history: Component[][]
  currentIndex: number
}

export const useDesignStore = defineStore('design', {
  state: (): DesignState => ({
    components: [],
    history: [],
    currentIndex: -1,
  }),

  actions: {
    initDesign() {
      this.components = []
      this.history = [[]]
      this.currentIndex = 0
    },

    updateComponent(component: Component) {
      const index = this.components.findIndex((c) => c.id === component.id)
      if (index > -1) {
        this.components[index] = component
      } else {
        this.components.push(component)
      }
      this.addHistory()
    },

    addHistory() {
      this.currentIndex++
      this.history = this.history.slice(0, this.currentIndex)
      this.history.push([...this.components])
    },

    undo() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.components = [...this.history[this.currentIndex]]
      }
    },

    redo() {
      if (this.currentIndex < this.history.length - 1) {
        this.currentIndex++
        this.components = [...this.history[this.currentIndex]]
      }
    },

    async saveDesign() {
      // TODO: 实现保存逻辑
      return Promise.resolve()
    },

    async exportDesign() {
      // TODO: 实现导出逻辑
      return Promise.resolve()
    },
  },
})
