import { PluginSandbox, SandboxOptions, SandboxMetrics } from './pluginSandbox'
import { RPCManager } from './rpc'
import { EventEmitter } from 'share'

export interface SandboxManagerOptions {
  /**
   * 默认沙箱配置
   */
  defaultSandboxOptions?: SandboxOptions

  /**
   * RPC管理器配置
   */
  rpc?: {
    origin: string
    timeout?: number
    retries?: number
  }
}

export type SandboxEvent =
  | 'create'
  | 'destroy'
  | 'reload'
  | 'error'
  | 'resource-violation'

type SandboxEventMap = {
  [K in SandboxEvent]: K extends 'create' | 'reload'
    ? (pluginId: string, sandbox: PluginSandbox) => void
    : K extends 'destroy'
      ? (pluginId: string) => void
      : K extends 'error'
        ? (pluginId: string, error: Error) => void
        : K extends 'resource-violation'
          ? (
              pluginId: string,
              details: {
                resource: string
                metrics: SandboxMetrics
              }
            ) => void
          : never
} & Record<string, (...args: any[]) => void>

export class SandboxManager extends EventEmitter<SandboxEventMap> {
  private sandboxes: Map<string, PluginSandbox>
  private options: Required<SandboxManagerOptions>
  private rpcManager: RPCManager

  constructor(options: SandboxManagerOptions = {}) {
    super()
    this.sandboxes = new Map()

    // 设置默认选项
    this.options = {
      defaultSandboxOptions: {
        csp: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
        },
        resources: {
          maxMemory: 128,
          maxCPU: 80,
          maxNetworkRequests: 100,
          maxDOMNodes: 1000,
        },
        permissions: {
          clipboard: false,
          notifications: false,
          geolocation: false,
          camera: false,
          microphone: false,
        },
        ...options.defaultSandboxOptions,
      },
      rpc: {
        origin: 'http://localhost:3000',
        timeout: 5000,
        retries: 3,
        ...options.rpc,
      },
    }

    // 初始化RPC管理器
    this.rpcManager = new RPCManager({
      origin: this.options.rpc.origin,
      timeout: this.options.rpc.timeout,
      retries: this.options.rpc.retries,
      errorHandler: this.handleRPCError.bind(this),
    })

    // 监听资源违规事件
    window.addEventListener('resource-violation', this.handleResourceViolation)
  }

  /**
   * 创建新的沙箱实例
   */
  async createSandbox(
    pluginId: string,
    options: SandboxOptions = {}
  ): Promise<PluginSandbox> {
    if (this.sandboxes.has(pluginId)) {
      throw new Error(`Sandbox for plugin ${pluginId} already exists`)
    }

    const sandbox = new PluginSandbox(pluginId, {
      ...this.options.defaultSandboxOptions,
      ...options,
    })

    try {
      await sandbox.createContainer()
      this.sandboxes.set(pluginId, sandbox)
      this.emit('create', pluginId, sandbox)
      return sandbox
    } catch (error) {
      this.emit('error', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 销毁沙箱实例
   */
  async destroySandbox(pluginId: string): Promise<void> {
    const sandbox = this.sandboxes.get(pluginId)
    if (!sandbox) return

    try {
      sandbox.destroy()
      this.sandboxes.delete(pluginId)
      this.emit('destroy', pluginId)
    } catch (error) {
      this.emit('error', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 重新加载沙箱
   */
  async reloadSandbox(
    pluginId: string,
    content: string | Blob,
    options?: SandboxOptions
  ): Promise<void> {
    const existingSandbox = this.sandboxes.get(pluginId)
    if (!existingSandbox) {
      throw new Error(`Sandbox for plugin ${pluginId} not found`)
    }

    try {
      // 创建新的沙箱
      const newSandbox = await this.createSandbox(pluginId, {
        ...existingSandbox.getOptions(),
        ...options,
      })

      // 注入新内容
      await newSandbox.injectContent(content)

      // 销毁旧沙箱
      existingSandbox.destroy()
      this.sandboxes.set(pluginId, newSandbox)

      this.emit('reload', pluginId, newSandbox)
    } catch (error) {
      this.emit('error', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 获取沙箱实例
   */
  getSandbox(pluginId: string): PluginSandbox | undefined {
    return this.sandboxes.get(pluginId)
  }

  /**
   * 获取所有沙箱实例
   */
  getAllSandboxes(): Map<string, PluginSandbox> {
    return new Map(this.sandboxes)
  }

  /**
   * 获取沙箱性能指标
   */
  getSandboxMetrics(pluginId: string): SandboxMetrics | undefined {
    return this.sandboxes.get(pluginId)?.getMetrics()
  }

  /**
   * 注册RPC方法
   */
  registerRPCMethod(
    name: string,
    method: (...args: any[]) => Promise<any>
  ): void {
    this.rpcManager.registerMethod(name, method)
  }

  /**
   * 调用RPC方法
   */
  async callRPCMethod(
    method: string,
    args: any[] = [],
    timeout?: number
  ): Promise<any> {
    return this.rpcManager.callMethod({
      method,
      args,
      timeout,
    })
  }

  /**
   * 处理RPC错误
   */
  private handleRPCError(error: Error): void {
    console.error('RPC Error:', error)
    // 可以在这里实现更复杂的错误处理逻辑
  }

  /**
   * 处理资源违规事件
   */
  private handleResourceViolation = ((event: CustomEvent) => {
    const { pluginId, resource, metrics } = event.detail
    this.emit('resource-violation', pluginId, { resource, metrics })
  }) as EventListener

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    // 销毁所有沙箱
    const destroyPromises = Array.from(this.sandboxes.keys()).map((pluginId) =>
      this.destroySandbox(pluginId)
    )
    await Promise.all(destroyPromises)

    // 移除事件监听
    this.removeAllListeners()
    window.removeEventListener(
      'resource-violation',
      this.handleResourceViolation
    )

    // 清理资源
    this.sandboxes.clear()
  }
}
