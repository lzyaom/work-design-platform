import { EventEmitter } from 'share'
import { Logger } from './logger'

export interface HotReloadOptions {
  /**
   * 更新检查间隔（毫秒）
   */
  checkInterval?: number

  /**
   * 是否自动应用更新
   */
  autoApply?: boolean

  /**
   * 是否保留插件状态
   */
  preserveState?: boolean
}

export interface UpdateInfo {
  version: string
  url: string
  checksum: string
  changelog?: string
}

interface HotReloadEvents {
  'update:available': (pluginId: string, version: string) => void
  'update:downloaded': (pluginId: string, version: string) => void
  'update:applied': (pluginId: string, version: string) => void
  'update:error': (pluginId: string, error: Error) => void
  [key: string]: (...args: any[]) => void
}

export class HotReload extends EventEmitter<HotReloadEvents> {
  private options: Required<HotReloadOptions>
  private logger: Logger
  private checkTimer: number | null = null
  private pendingUpdates: Map<string, UpdateInfo> = new Map()
  private downloading: Set<string> = new Set()

  constructor(options: HotReloadOptions = {}, logger: Logger) {
    super()
    this.logger = logger
    this.options = {
      checkInterval: 60000, // 1分钟
      autoApply: false,
      preserveState: true,
      ...options,
    }

    // 如果开启了自动检查，启动定时器
    if (this.options.checkInterval > 0) {
      this.startUpdateChecker()
    }
  }

  /**
   * 开始检查更新
   */
  startUpdateChecker(): void {
    if (this.checkTimer !== null) return

    this.checkTimer = window.setInterval(
      () => this.checkForUpdates(),
      this.options.checkInterval
    )
  }

  /**
   * 停止检查更新
   */
  stopUpdateChecker(): void {
    if (this.checkTimer === null) return

    window.clearInterval(this.checkTimer)
    this.checkTimer = null
  }

  /**
   * 检查插件更新
   */
  async checkForUpdates(
    pluginIds?: string[]
  ): Promise<Map<string, UpdateInfo>> {
    const updates = new Map<string, UpdateInfo>()

    try {
      // 获取更新信息
      const response = await fetch('/api/plugins/updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pluginIds }),
      })

      if (!response.ok) {
        throw new Error(`Failed to check updates: ${response.statusText}`)
      }

      const data = (await response.json()) as Record<string, UpdateInfo>

      // 处理每个插件的更新
      for (const [pluginId, updateInfo] of Object.entries(data)) {
        this.pendingUpdates.set(pluginId, updateInfo)
        updates.set(pluginId, updateInfo)

        this.emit('update:available', pluginId, updateInfo.version)
        this.logger.info(
          `Update available for plugin ${pluginId}: ${updateInfo.version}`,
          pluginId,
          updateInfo
        )

        // 如果设置了自动应用，直接下载并应用更新
        if (this.options.autoApply) {
          this.applyUpdate(pluginId).catch((error) => {
            this.logger.error(
              `Failed to auto-apply update for plugin ${pluginId}`,
              pluginId,
              error as Error
            )
          })
        }
      }

      return updates
    } catch (error) {
      this.logger.error(
        'Failed to check for updates',
        undefined,
        error as Error
      )
      throw error
    }
  }

  /**
   * 获取可用的更新列表
   */
  getAvailableUpdates(): { pluginId: string; version: string }[] {
    return Array.from(this.pendingUpdates.entries()).map(
      ([pluginId, info]) => ({
        pluginId,
        version: info.version,
      })
    )
  }

  /**
   * 获取待更新数量
   */
  getPendingUpdateCount(): number {
    return this.pendingUpdates.size
  }

  /**
   * 应用更新
   */
  async applyUpdate(pluginId: string): Promise<void> {
    const updateInfo = this.pendingUpdates.get(pluginId)
    if (!updateInfo) {
      throw new Error(`No pending update for plugin ${pluginId}`)
    }

    try {
      // 下载更新包
      const blob = await this.downloadUpdate(pluginId, updateInfo)

      // 验证校验和
      await this.verifyChecksum(blob, updateInfo.checksum)

      // 触发更新事件
      this.emit('update:applied', pluginId, updateInfo.version)
      this.logger.info(`Update applied for plugin ${pluginId}`, pluginId, {
        version: updateInfo.version,
      })

      // 清理更新信息
      this.pendingUpdates.delete(pluginId)
    } catch (error) {
      this.emit('update:error', pluginId, error as Error)
      this.logger.error(
        `Failed to apply update for plugin ${pluginId}`,
        pluginId,
        error as Error
      )
      throw error
    }
  }

  private async downloadUpdate(
    pluginId: string,
    updateInfo: UpdateInfo
  ): Promise<Blob> {
    if (this.downloading.has(pluginId)) {
      throw new Error(`Update for plugin ${pluginId} is already downloading`)
    }

    try {
      this.downloading.add(pluginId)

      const response = await fetch(updateInfo.url)
      if (!response.ok) {
        throw new Error(`Failed to download update: ${response.statusText}`)
      }

      const blob = await response.blob()

      this.emit('update:downloaded', pluginId, updateInfo.version)
      this.logger.info(`Update downloaded for plugin ${pluginId}`, pluginId, {
        version: updateInfo.version,
      })

      return blob
    } finally {
      this.downloading.delete(pluginId)
    }
  }

  private async verifyChecksum(
    blob: Blob,
    expectedChecksum: string
  ): Promise<void> {
    const buffer = await blob.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const actualChecksum = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    if (actualChecksum !== expectedChecksum) {
      throw new Error('Update package checksum verification failed')
    }
  }
}
