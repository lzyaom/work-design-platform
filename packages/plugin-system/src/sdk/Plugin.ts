import { IPCBus } from '../core/ipc'
import { RPCManager } from '../core/rpc'

export interface PluginContext {
  id: string
  version: string
  env: {
    mode: 'development' | 'production'
    debug: boolean
  }
}

export interface StateManager {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

export class Plugin {
  protected context: PluginContext
  protected ipc: IPCBus
  protected rpc: RPCManager
  protected state: StateManager
  private registeredComponents: Set<string> = new Set()

  constructor(context: PluginContext) {
    this.context = context
    
    // 初始化IPC
    this.ipc = new IPCBus({
      origin: window.location.origin
    })

    // 初始化RPC
    this.rpc = new RPCManager({
      origin: window.location.origin
    })

    // 初始化状态管理器
    this.state = this.createStateManager()

    // 监听生命周期事件
    window.addEventListener('load', this.handleLoad.bind(this))
    window.addEventListener('unload', this.handleUnload.bind(this))
  }

  /**
   * 注册API方法
   */
  protected registerAPI(name: string, implementation: (...args: any[]) => Promise<any>): void {
    this.rpc.registerMethod(name, implementation)
  }

  /**
   * 调用宿主应用API
   */
  protected async callHostAPI<T>(method: string, ...args: any[]): Promise<T> {
    return this.rpc.callMethod({
      method,
      args
    })
  }

  /**
   * 注册UI组件
   */
  protected registerComponent(
    tagName: string,
    component: CustomElementConstructor
  ): void {
    if (this.registeredComponents.has(tagName)) {
      console.warn(`Component ${tagName} already registered`)
      return
    }

    // 添加插件ID前缀，避免命名冲突
    const fullTagName = `${this.context.id}-${tagName}`
    customElements.define(fullTagName, component)
    this.registeredComponents.add(tagName)
  }

  /**
   * 发送事件到宿主应用
   */
  protected emit(event: string, data: any): void {
    this.ipc.send('plugin:event', {
      pluginId: this.context.id,
      event,
      data
    })
  }

  /**
   * 监听宿主应用事件
   */
  protected on(event: string, handler: (data: any) => void): () => void {
    return this.ipc.on(`host:${event}`, (payload) => handler(payload))
  }

  /**
   * 创建状态管理器
   */
  private createStateManager(): StateManager {
    const storageKey = `plugin_${this.context.id}_state`

    return {
      async get<T>(key: string): Promise<T | undefined> {
        const state = JSON.parse(localStorage.getItem(storageKey) || '{}')
        return state[key]
      },

      async set<T>(key: string, value: T): Promise<void> {
        const state = JSON.parse(localStorage.getItem(storageKey) || '{}')
        state[key] = value
        localStorage.setItem(storageKey, JSON.stringify(state))
      },

      async remove(key: string): Promise<void> {
        const state = JSON.parse(localStorage.getItem(storageKey) || '{}')
        delete state[key]
        localStorage.setItem(storageKey, JSON.stringify(state))
      },

      async clear(): Promise<void> {
        localStorage.removeItem(storageKey)
      }
    }
  }

  /**
   * 插件加载完成时调用
   */
  protected async onLoad(): Promise<void> {
    // 插件初始化逻辑
  }

  /**
   * 插件卸载前调用
   */
  protected async onUnload(): Promise<void> {
    // 插件清理逻辑
  }

  /**
   * 处理加载事件
   */
  private async handleLoad(): Promise<void> {
    try {
      await this.onLoad()
      this.emit('loaded', { success: true })
    } catch (error) {
      console.error('Plugin load failed:', error)
      this.emit('loaded', { success: false, error })
    }
  }

  /**
   * 处理卸载事件
   */
  private async handleUnload(): Promise<void> {
    try {
      await this.onUnload()
      
      // 清理注册的组件
      this.registeredComponents.clear()
      
      // 清理事件监听
      this.ipc.off('*', () => {})
      this.emit('unloaded', { success: true })
    } catch (error) {
      console.error('Plugin unload failed:', error)
      this.emit('unloaded', { success: false, error })
    }
  }
}