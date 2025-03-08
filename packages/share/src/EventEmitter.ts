type EventHandler = (...args: any[]) => void

export class EventEmitter<Events extends Record<string, EventHandler>> {
  private handlers: Map<keyof Events, Set<Events[keyof Events]>> = new Map()

  /**
   * 监听事件
   */
  on<E extends keyof Events>(event: E, handler: Events[E]): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  /**
   * 监听一次性事件
   */
  once<E extends keyof Events>(event: E, handler: Events[E]): void {
    const onceHandler = ((...args: Parameters<Events[E]>) => {
      handler(...args)
      this.off(event, onceHandler as Events[E])
    }) as Events[E]
    
    this.on(event, onceHandler)
  }

  /**
   * 移除事件监听
   */
  off<E extends keyof Events>(event: E, handler: Events[E]): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  /**
   * 触发事件
   */
  emit<E extends keyof Events>(
    event: E,
    ...args: Parameters<Events[E]>
  ): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for ${String(event)}:`, error)
        }
      })
    }
  }

  /**
   * 移除所有事件监听
   */
  removeAllListeners(): void {
    this.handlers.clear()
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: keyof Events): number {
    return this.handlers.get(event)?.size ?? 0
  }

  /**
   * 获取所有已注册的事件
   */
  eventNames(): Array<keyof Events> {
    return Array.from(this.handlers.keys())
  }
}
