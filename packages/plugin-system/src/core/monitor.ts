import { EventEmitter } from 'share'
import { Logger } from './logger'

export interface MetricsData {
  cpu: {
    usage: number
    peak: number
    average: number
  }
  memory: {
    used: number
    peak: number
    allocated: number
  }
  network: {
    requests: number
    errors: number
    bandwidth: number
  }
  dom: {
    nodes: number
    listeners: number
    updates: number
  }
  events: {
    emitted: number
    handled: number
  }
  timing: {
    startup: number
    interactive: number
    operations: Record<string, number>
  }
}

export interface PluginMetrics extends MetricsData {
  pluginId: string
  timestamp: number
  status: 'healthy' | 'warning' | 'critical'
}

interface MonitorEvents {
  'metrics:update': (metrics: PluginMetrics) => void
  'metrics:alert': (alert: MetricsAlert) => void
  'health:change': (status: HealthStatus) => void
  [key: string]: (...args: any[]) => void
}

export interface MetricsAlert {
  pluginId: string
  type: string
  message: string
  value: number
  threshold: number
  timestamp: number
}

export interface HealthStatus {
  pluginId: string
  status: 'healthy' | 'warning' | 'critical'
  checks: HealthCheck[]
  timestamp: number
}

interface HealthCheck {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message?: string
  timestamp: number
}

export class Monitor extends EventEmitter<MonitorEvents> {
  private metrics: Map<string, PluginMetrics>
  private logger: Logger
  private checkInterval: number

  constructor(logger: Logger, checkInterval = 5000) {
    super()
    this.logger = logger
    this.checkInterval = checkInterval
    this.metrics = new Map()

    // Start periodic health checks
    setInterval(() => this.checkHealth(), this.checkInterval)
  }

  /**
   * 获取插件指标
   */
  getMetrics(pluginId: string): PluginMetrics | undefined {
    return this.metrics.get(pluginId)
  }

  /**
   * 获取所有活跃插件ID
   */
  getActivePlugins(): Set<string> {
    return new Set(this.metrics.keys())
  }

  /**
   * 更新插件指标
   */
  updateMetrics(pluginId: string, data: Partial<MetricsData>): void {
    const current =
      this.metrics.get(pluginId) || this.createEmptyMetrics(pluginId)
    const updated = this.mergeMetrics(current, data)
    this.metrics.set(pluginId, updated)
    this.emit('metrics:update', updated)
  }

  /**
   * 移除插件指标
   */
  removeMetrics(pluginId: string): void {
    this.metrics.delete(pluginId)
  }

  private createEmptyMetrics(pluginId: string): PluginMetrics {
    return {
      pluginId,
      timestamp: Date.now(),
      status: 'healthy',
      cpu: { usage: 0, peak: 0, average: 0 },
      memory: { used: 0, peak: 0, allocated: 0 },
      network: { requests: 0, errors: 0, bandwidth: 0 },
      dom: { nodes: 0, listeners: 0, updates: 0 },
      events: { emitted: 0, handled: 0 },
      timing: {
        startup: 0,
        interactive: 0,
        operations: {},
      },
    }
  }

  private mergeMetrics(
    current: PluginMetrics,
    update: Partial<MetricsData>
  ): PluginMetrics {
    return {
      ...current,
      timestamp: Date.now(),
      cpu: update.cpu
        ? {
            ...current.cpu,
            ...update.cpu,
            peak: Math.max(current.cpu.peak, update.cpu.usage),
          }
        : current.cpu,
      memory: update.memory
        ? {
            ...current.memory,
            ...update.memory,
            peak: Math.max(current.memory.peak, update.memory.used),
          }
        : current.memory,
      network: update.network
        ? {
            ...current.network,
            ...update.network,
          }
        : current.network,
      dom: update.dom
        ? {
            ...current.dom,
            ...update.dom,
          }
        : current.dom,
      events: update.events
        ? {
            ...current.events,
            ...update.events,
          }
        : current.events,
      timing: update.timing
        ? {
            ...current.timing,
            ...update.timing,
            operations: {
              ...current.timing.operations,
              ...update.timing.operations,
            },
          }
        : current.timing,
    }
  }

  private checkHealth(): void {
    for (const [pluginId, metrics] of this.metrics) {
      const status = this.calculateHealthStatus(metrics)
      if (status.status !== metrics.status) {
        metrics.status = status.status
        this.emit('health:change', status)
        this.logger.info(
          `Plugin health status changed to ${status.status}`,
          pluginId,
          status
        )
      }
    }
  }

  private calculateHealthStatus(metrics: PluginMetrics): HealthStatus {
    const checks: HealthCheck[] = [
      this.checkCPU(metrics),
      this.checkMemory(metrics),
      this.checkErrors(metrics),
    ]

    const status = checks.some((c) => c.status === 'fail')
      ? 'critical'
      : checks.some((c) => c.status === 'warn')
        ? 'warning'
        : 'healthy'

    return {
      pluginId: metrics.pluginId,
      status,
      checks,
      timestamp: Date.now(),
    }
  }

  private checkCPU(metrics: PluginMetrics): HealthCheck {
    const { usage } = metrics.cpu
    if (usage > 90) {
      return {
        name: 'cpu',
        status: 'fail',
        message: `CPU usage too high: ${usage}%`,
        timestamp: Date.now(),
      }
    }
    if (usage > 70) {
      return {
        name: 'cpu',
        status: 'warn',
        message: `CPU usage high: ${usage}%`,
        timestamp: Date.now(),
      }
    }
    return {
      name: 'cpu',
      status: 'pass',
      timestamp: Date.now(),
    }
  }

  private checkMemory(metrics: PluginMetrics): HealthCheck {
    const usage = (metrics.memory.used / metrics.memory.allocated) * 100
    if (usage > 90) {
      return {
        name: 'memory',
        status: 'fail',
        message: `Memory usage too high: ${usage}%`,
        timestamp: Date.now(),
      }
    }
    if (usage > 70) {
      return {
        name: 'memory',
        status: 'warn',
        message: `Memory usage high: ${usage}%`,
        timestamp: Date.now(),
      }
    }
    return {
      name: 'memory',
      status: 'pass',
      timestamp: Date.now(),
    }
  }

  private checkErrors(metrics: PluginMetrics): HealthCheck {
    const { errors } = metrics.network
    if (errors > 10) {
      return {
        name: 'errors',
        status: 'fail',
        message: `Too many errors: ${errors}`,
        timestamp: Date.now(),
      }
    }
    if (errors > 5) {
      return {
        name: 'errors',
        status: 'warn',
        message: `High error count: ${errors}`,
        timestamp: Date.now(),
      }
    }
    return {
      name: 'errors',
      status: 'pass',
      timestamp: Date.now(),
    }
  }
}
