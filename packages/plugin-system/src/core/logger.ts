export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: number
  level: LogLevel
  pluginId?: string
  message: string
  data?: any
  error?: Error
}

export interface LoggerOptions {
  minLevel?: LogLevel
  maxEntries?: number
  persistLogs?: boolean
  storageKey?: string
}

export class Logger {
  private logs: LogEntry[] = []
  private options: Required<LoggerOptions>
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  constructor(options: LoggerOptions = {}) {
    this.options = {
      minLevel: 'debug',
      maxEntries: 1000,
      persistLogs: true,
      storageKey: 'plugin_system_logs',
      ...options
    }

    // 从存储中恢复日志
    if (this.options.persistLogs) {
      this.loadLogs()
    }

    // 定期清理过期日志
    setInterval(() => this.cleanup(), 60000)
  }

  debug(message: string, pluginId?: string, data?: any): void {
    this.log('debug', message, pluginId, data)
  }

  info(message: string, pluginId?: string, data?: any): void {
    this.log('info', message, pluginId, data)
  }

  warn(message: string, pluginId?: string, data?: any): void {
    this.log('warn', message, pluginId, data)
  }

  error(message: string, pluginId?: string, error?: Error, data?: any): void {
    this.log('error', message, pluginId, data, error)
  }

  /**
   * 获取所有日志
   */
  getLogs(options?: {
    level?: LogLevel
    pluginId?: string
    startTime?: number
    endTime?: number
  }): LogEntry[] {
    let filtered = this.logs

    if (options?.level) {
      const minPriority = this.levelPriority[options.level]
      filtered = filtered.filter(log => 
        this.levelPriority[log.level] >= minPriority
      )
    }

    if (options?.pluginId) {
      filtered = filtered.filter(log => 
        log.pluginId === options.pluginId
      )
    }

    if (options?.startTime) {
      filtered = filtered.filter(log => 
        log.timestamp >= options.startTime!
      )
    }

    if (options?.endTime) {
      filtered = filtered.filter(log => 
        log.timestamp <= options.endTime!
      )
    }

    return filtered
  }

  /**
   * 清除日志
   */
  clearLogs(): void {
    this.logs = []
    if (this.options.persistLogs) {
      this.saveLogs()
    }
  }

  /**
   * 导出日志
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportCSV()
    }
    return JSON.stringify(this.logs, null, 2)
  }

  private log(
    level: LogLevel,
    message: string,
    pluginId?: string,
    data?: any,
    error?: Error
  ): void {
    if (this.levelPriority[level] < this.levelPriority[this.options.minLevel]) {
      return
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      pluginId,
      message,
      data,
      error
    }

    this.logs.push(entry)

    // 触发日志事件
    window.dispatchEvent(new CustomEvent('plugin-log', { 
      detail: entry 
    }))

    // 持久化日志
    if (this.options.persistLogs) {
      this.saveLogs()
    }

    // 控制台输出
    const console_method = level === 'debug' ? 'log' : level
    console[console_method](
      `[${new Date(entry.timestamp).toISOString()}]`,
      `[${level.toUpperCase()}]`,
      pluginId ? `[${pluginId}]` : '',
      message,
      data || '',
      error || ''
    )
  }

  private cleanup(): void {
    // 移除超出最大条数的日志
    if (this.logs.length > this.options.maxEntries) {
      this.logs = this.logs.slice(-this.options.maxEntries)
      if (this.options.persistLogs) {
        this.saveLogs()
      }
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(
        this.options.storageKey,
        JSON.stringify(this.logs)
      )
    } catch (error) {
      console.error('Failed to save logs:', error)
    }
  }

  private loadLogs(): void {
    try {
      const saved = localStorage.getItem(this.options.storageKey)
      if (saved) {
        this.logs = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    }
  }

  private exportCSV(): string {
    const headers = ['Timestamp', 'Level', 'Plugin ID', 'Message', 'Data', 'Error']
    const rows = this.logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.level,
      log.pluginId || '',
      log.message,
      log.data ? JSON.stringify(log.data) : '',
      log.error ? log.error.message : ''
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        `"${String(cell).replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n')
  }
}