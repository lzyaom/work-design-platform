import { EventEmitter } from 'share'
import { SandboxManager, SandboxOptions, ResourceLimits } from './core'

export interface PluginManifest {
  id: string
  name: string
  version: string
  description?: string
  entry: {
    main: string
    worker?: string
    styles?: string[]
  }
  permissions?: string[]
  dependencies?: Record<string, string>
  resources?: ResourceLimits
  api?: {
    exports?: string[]
    imports?: string[]
  }
}

export interface PluginState {
  status: 'installing' | 'running' | 'stopped' | 'error'
  error?: Error
  timestamp: number
}

export interface PluginInfo extends PluginManifest {
  state: PluginState
  sandboxOptions?: SandboxOptions
}

type PluginEventMap = {
  'plugin:install': (pluginId: string) => void
  'plugin:uninstall': (pluginId: string) => void
  'plugin:start': (pluginId: string) => void
  'plugin:stop': (pluginId: string) => void
  'plugin:error': (pluginId: string, error: Error) => void
  'plugin:update': (
    pluginId: string,
    oldVersion: string,
    newVersion: string
  ) => void
  [key: string]: (...args: any[]) => void
}

export interface PluginManagerOptions {
  /**
   * 插件商店URL
   */
  storeUrl?: string

  /**
   * 默认沙箱选项
   */
  sandboxOptions?: SandboxOptions

  /**
   * RPC选项
   */
  rpc?: {
    origin: string
    timeout?: number
    retries?: number
  }

  /**
   * 存储键前缀
   */
  storagePrefix?: string
}

export class PluginManager extends EventEmitter<PluginEventMap> {
  private plugins: Map<string, PluginInfo>
  protected sandboxManager: SandboxManager
  private options: Required<PluginManagerOptions>
  private storage: Storage

  constructor(options: PluginManagerOptions = {}) {
    super()
    this.plugins = new Map()

    this.options = {
      storeUrl: 'https://plugins.example.com',
      sandboxOptions: {},
      rpc: {
        origin: 'http://localhost:3000',
        timeout: 5000,
        retries: 3,
      },
      storagePrefix: 'plugin_',
      ...options,
    }

    this.sandboxManager = new SandboxManager({
      defaultSandboxOptions: this.options.sandboxOptions,
      rpc: this.options.rpc,
    })

    this.storage = window.localStorage
    this.loadPersistedPlugins()
  }

  /**
   * 安装插件
   */
  async install(manifest: PluginManifest): Promise<void> {
    try {
      // 验证manifest
      this.validateManifest(manifest)

      // 检查依赖
      await this.checkDependencies(manifest)

      // 创建插件信息
      const pluginInfo: PluginInfo = {
        ...manifest,
        state: {
          status: 'installing',
          timestamp: Date.now(),
        },
      }

      // 保存插件信息
      this.plugins.set(manifest.id, pluginInfo)
      this.persistPlugin(manifest.id)

      // 创建沙箱
      const sandbox = await this.sandboxManager.createSandbox(manifest.id, {
        ...this.options.sandboxOptions,
        resources: manifest.resources,
      })

      // 加载插件代码
      const content = await this.fetchPluginContent(manifest.entry.main)
      await sandbox.injectContent(content)

      // 更新状态
      pluginInfo.state = {
        status: 'running',
        timestamp: Date.now(),
      }
      this.persistPlugin(manifest.id)

      this.emit('plugin:install', manifest.id)
    } catch (error) {
      // 清理失败的安装
      this.plugins.delete(manifest.id)
      this.removePersistedPlugin(manifest.id)

      this.emit('plugin:error', manifest.id, error as Error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    try {
      // 停止插件
      await this.stop(pluginId)

      // 销毁沙箱
      await this.sandboxManager.destroySandbox(pluginId)

      // 移除插件
      this.plugins.delete(pluginId)
      this.removePersistedPlugin(pluginId)

      this.emit('plugin:uninstall', pluginId)
    } catch (error) {
      this.emit('plugin:error', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 启动插件
   */
  async start(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    try {
      const sandbox = this.sandboxManager.getSandbox(pluginId)
      if (!sandbox) {
        throw new Error(`Sandbox for plugin ${pluginId} not found`)
      }

      // 更新状态
      plugin.state = {
        status: 'running',
        timestamp: Date.now(),
      }
      this.persistPlugin(pluginId)

      this.emit('plugin:start', pluginId)
    } catch (error) {
      plugin.state = {
        status: 'error',
        error: error as Error,
        timestamp: Date.now(),
      }
      this.persistPlugin(pluginId)

      this.emit('plugin:error', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 停止插件
   */
  async stop(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    try {
      const sandbox = this.sandboxManager.getSandbox(pluginId)
      if (sandbox) {
        sandbox.destroy()
      }

      plugin.state = {
        status: 'stopped',
        timestamp: Date.now(),
      }
      this.persistPlugin(pluginId)

      this.emit('plugin:stop', pluginId)
    } catch (error) {
      plugin.state = {
        status: 'error',
        error: error as Error,
        timestamp: Date.now(),
      }
      this.persistPlugin(pluginId)

      this.emit('plugin:error', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 更新插件
   */
  async update(pluginId: string, manifest: PluginManifest): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    const oldVersion = plugin.version
    try {
      // 停止当前版本
      await this.stop(pluginId)

      // 安装新版本
      await this.install(manifest)

      this.emit('plugin:update', pluginId, oldVersion, manifest.version)
    } catch (error) {
      // 回滚到旧版本
      await this.install(plugin)

      this.emit('plugin:error', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 获取插件信息
   */
  getPlugin(pluginId: string): PluginInfo | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Map<string, PluginInfo> {
    return new Map(this.plugins)
  }

  /**
   * 验证插件配置
   */
  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id) {
      throw new Error('Plugin ID is required')
    }
    if (!manifest.name) {
      throw new Error('Plugin name is required')
    }
    if (!manifest.version) {
      throw new Error('Plugin version is required')
    }
    if (!manifest.entry?.main) {
      throw new Error('Plugin entry point is required')
    }
  }

  /**
   * 检查插件依赖
   */
  private async checkDependencies(manifest: PluginManifest): Promise<void> {
    if (!manifest.dependencies) return

    for (const [depId, version] of Object.entries(manifest.dependencies)) {
      const dep = this.plugins.get(depId)
      if (!dep) {
        throw new Error(`Dependency ${depId} not found`)
      }
      if (dep.version !== version) {
        throw new Error(
          `Dependency ${depId} version mismatch: expected ${version}, got ${dep.version}`
        )
      }
    }
  }

  /**
   * 获取插件内容
   */
  private async fetchPluginContent(url: string): Promise<string> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch plugin content: ${response.statusText}`)
    }
    return response.text()
  }

  /**
   * 持久化插件信息
   */
  private persistPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      this.storage.setItem(this.getStorageKey(pluginId), JSON.stringify(plugin))
    }
  }

  /**
   * 移除持久化的插件信息
   */
  private removePersistedPlugin(pluginId: string): void {
    this.storage.removeItem(this.getStorageKey(pluginId))
  }

  /**
   * 加载持久化的插件信息
   */
  private loadPersistedPlugins(): void {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.options.storagePrefix)) {
        const pluginId = key.slice(this.options.storagePrefix.length)
        const data = this.storage.getItem(key)
        if (data) {
          try {
            const plugin = JSON.parse(data) as PluginInfo
            this.plugins.set(pluginId, plugin)
          } catch (error) {
            console.error(`Failed to load plugin ${pluginId}:`, error)
          }
        }
      }
    }
  }

  /**
   * 获取存储键
   */
  private getStorageKey(pluginId: string): string {
    return `${this.options.storagePrefix}${pluginId}`
  }

  /**
   * 调用插件方法
   */
  async callPluginMethod(
    pluginId: string,
    method: string,
    args: any[] = []
  ): Promise<any> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    const sandbox = this.sandboxManager.getSandbox(pluginId)
    if (!sandbox) {
      throw new Error(`Sandbox for plugin ${pluginId} not found`)
    }

    return this.sandboxManager.callRPCMethod(`${pluginId}.${method}`, args)
  }

  /**
   * 销毁插件管理器
   */
  async destroy(): Promise<void> {
    // 停止所有插件
    const stopPromises = Array.from(this.plugins.keys()).map((pluginId) =>
      this.stop(pluginId)
    )
    await Promise.all(stopPromises)

    // 销毁沙箱管理器
    await this.sandboxManager.destroy()

    // 清理事件监听
    this.removeAllListeners()

    // 清理插件数据
    this.plugins.clear()
  }
}
