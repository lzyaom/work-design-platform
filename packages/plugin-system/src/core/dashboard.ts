import { EventEmitter } from 'share'
import { Logger, LogLevel } from './logger'
import { Monitor, PluginMetrics } from './monitor'
import { Debugger, NetworkRequest } from './debugger'
import { HotReload } from './hotReload'

export interface DashboardOptions {
  refreshInterval?: number
  maxLogEntries?: number
  maxMetricsHistory?: number
}

interface DashboardEvents {
  refresh: () => void
  'state:change': (state: DashboardState) => void
  'view:change': (view: DashboardView) => void
  [key: string]: (...args: any[]) => void
}

export interface DashboardState {
  activePlugins: number
  errorCount: number
  warningCount: number
  cpuUsage: number
  memoryUsage: number
  networkRequests: number
  pendingUpdates: number
}

export type DashboardView =
  | 'overview'
  | 'logs'
  | 'metrics'
  | 'network'
  | 'updates'
  | 'debug'

export class Dashboard extends EventEmitter<DashboardEvents> {
  private logger: Logger
  private monitor: Monitor
  private debugger: Debugger
  private hotReload: HotReload
  private options: Required<DashboardOptions>
  private state: DashboardState
  private currentView: DashboardView = 'overview'
  private refreshTimer: number | null = null

  constructor(
    logger: Logger,
    monitor: Monitor,
    debugger_: Debugger,
    hotReload: HotReload,
    options: DashboardOptions = {}
  ) {
    super()
    this.logger = logger
    this.monitor = monitor
    this.debugger = debugger_
    this.hotReload = hotReload

    this.options = {
      refreshInterval: 5000,
      maxLogEntries: 1000,
      maxMetricsHistory: 100,
      ...options,
    }

    this.state = this.getInitialState()
    this.setupEventListeners()
    this.startRefreshTimer()
  }

  /**
   * 获取仪表盘状态
   */
  getState(): DashboardState {
    return { ...this.state }
  }

  /**
   * 切换视图
   */
  setView(view: DashboardView): void {
    this.currentView = view
    this.emit('view:change', view)
  }

  /**
   * 获取当前视图
   */
  getView(): DashboardView {
    return this.currentView
  }

  /**
   * 获取最近的日志
   */
  getLogs(options?: {
    level?: LogLevel
    pluginId?: string
    startTime?: number
    endTime?: number
  }): any[] {
    return this.logger.getLogs(options)
  }

  /**
   * 获取性能指标
   */
  getMetrics(pluginId?: string): PluginMetrics[] {
    if (pluginId) {
      const metrics = this.monitor.getMetrics(pluginId)
      return metrics ? [metrics] : []
    }
    return this.getActivePluginMetrics()
  }

  /**
   * 获取网络请求
   */
  getNetworkRequests(pluginId?: string): NetworkRequest[] {
    return this.debugger.getNetworkRequests(pluginId || '')
  }

  /**
   * 获取可用更新
   */
  getPendingUpdates(): { pluginId: string; version: string }[] {
    return this.hotReload.getAvailableUpdates()
  }

  /**
   * 启动调试会话
   */
  async startDebugging(pluginId: string): Promise<void> {
    await this.debugger.startDebugSession(pluginId)
    this.setView('debug')
  }

  /**
   * 停止调试会话
   */
  async stopDebugging(pluginId: string): Promise<void> {
    await this.debugger.stopDebugSession(pluginId)
    this.setView('overview')
  }

  /**
   * 应用更新
   */
  async applyUpdate(pluginId: string): Promise<void> {
    await this.hotReload.applyUpdate(pluginId)
    await this.refreshState()
  }

  /**
   * 导出性能报告
   */
  async exportReport(options?: {
    format?: 'json' | 'csv'
    includeMetrics?: boolean
    includeLogs?: boolean
    includeNetwork?: boolean
  }): Promise<Blob> {
    const data: Record<string, any> = {
      timestamp: new Date().toISOString(),
      state: this.state,
    }

    if (options?.includeMetrics) {
      data.metrics = this.getActivePluginMetrics()
    }

    if (options?.includeLogs) {
      data.logs = this.logger.getLogs()
    }

    if (options?.includeNetwork) {
      data.network = this.debugger.getNetworkRequests('')
    }

    if (options?.format === 'csv') {
      return new Blob([this.convertToCSV(data)], {
        type: 'text/csv;charset=utf-8;',
      })
    }

    return new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
  }

  /**
   * 销毁仪表盘
   */
  destroy(): void {
    this.stopRefreshTimer()
    this.removeAllListeners()
  }

  private setupEventListeners(): void {
    // 监听器将通过各组件的事件通知机制触发状态更新
    window.addEventListener('plugin-log', () => this.refreshState())
    window.addEventListener('metrics-update', () => this.refreshState())
    window.addEventListener('network-request', () => this.refreshState())
    window.addEventListener('plugin-update', () => this.refreshState())
  }

  private startRefreshTimer(): void {
    if (this.refreshTimer !== null) return

    this.refreshTimer = window.setInterval(
      () => this.refreshState(),
      this.options.refreshInterval
    )
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer === null) return

    window.clearInterval(this.refreshTimer)
    this.refreshTimer = null
  }

  private async refreshState(): Promise<void> {
    const metrics = this.getActivePluginMetrics()

    const newState: DashboardState = {
      activePlugins: metrics.length,
      errorCount: this.countLogsByLevel('error'),
      warningCount: this.countLogsByLevel('warn'),
      cpuUsage: this.calculateAverageCPU(metrics),
      memoryUsage: this.calculateTotalMemory(metrics),
      networkRequests: this.debugger.getNetworkRequests('').length,
      pendingUpdates: this.hotReload.getPendingUpdateCount(),
    }

    this.state = newState
    this.emit('state:change', newState)
    this.emit('refresh')
  }

  private getInitialState(): DashboardState {
    return {
      activePlugins: 0,
      errorCount: 0,
      warningCount: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      networkRequests: 0,
      pendingUpdates: 0,
    }
  }

  private countLogsByLevel(level: LogLevel): number {
    return this.logger.getLogs({ level }).length
  }

  private calculateAverageCPU(metrics: PluginMetrics[]): number {
    if (metrics.length === 0) return 0
    const total = metrics.reduce((sum, m) => sum + m.cpu.usage, 0)
    return total / metrics.length
  }

  private calculateTotalMemory(metrics: PluginMetrics[]): number {
    return metrics.reduce((sum, m) => sum + m.memory.used, 0)
  }

  private getActivePluginMetrics(): PluginMetrics[] {
    // 获取所有活跃插件的指标
    const pluginIds = Array.from(this.monitor.getActivePlugins())
    return pluginIds
      .map((id) => this.monitor.getMetrics(id))
      .filter((metrics): metrics is PluginMetrics => metrics !== undefined)
  }

  private convertToCSV(data: Record<string, any>): string {
    const replacer = (_key: string, value: any) => value ?? ''
    const header = Object.keys(data)
    const csv = [
      header.join(','),
      Object.values(data)
        .map((value) => JSON.stringify(value, replacer))
        .join(','),
    ]
    return csv.join('\n')
  }
}
