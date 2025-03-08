import { EventEmitter } from 'share'
import { Logger } from './logger'

export interface Breakpoint {
  id: string
  pluginId: string
  fileName: string
  line: number
  column?: number
  condition?: string
  enabled: boolean
}

export interface CallFrame {
  functionName: string
  fileName: string
  line: number
  column: number
  scopeChain: ScopeChain[]
}

export interface ScopeChain {
  type: 'global' | 'local' | 'closure'
  name: string
  variables: Variable[]
}

export interface Variable {
  name: string
  value: any
  type: string
}

export interface NetworkRequest {
  id: string
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  timestamp: number
  duration?: number
  status?: number
  response?: string
  error?: Error
}

interface DebuggerEvents {
  'breakpoint:hit': (breakpoint: Breakpoint, callFrame: CallFrame) => void
  'breakpoint:add': (breakpoint: Breakpoint) => void
  'breakpoint:remove': (breakpointId: string) => void
  'network:request': (request: NetworkRequest) => void
  'debug:start': (pluginId: string) => void
  'debug:stop': (pluginId: string) => void
  'debug:pause': (pluginId: string, callFrame: CallFrame) => void
  'debug:resume': (pluginId: string) => void
  'debug:error': (pluginId: string, error: Error) => void
  [key: string]: (...args: any[]) => void
}

export class Debugger extends EventEmitter<DebuggerEvents> {
  private breakpoints: Map<string, Breakpoint> = new Map()
  private networkRequests: Map<string, NetworkRequest> = new Map()
  private debugSessions: Map<string, boolean> = new Map()
  private logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
    this.setupNetworkInterceptor()
  }

  /**
   * 开始调试会话
   */
  async startDebugSession(pluginId: string): Promise<void> {
    if (this.debugSessions.has(pluginId)) {
      throw new Error(`Debug session already exists for plugin ${pluginId}`)
    }

    try {
      // 注入调试脚本
      await this.injectDebuggerScript(pluginId)

      this.debugSessions.set(pluginId, true)
      this.emit('debug:start', pluginId)

      this.logger.info('Debug session started', pluginId)
    } catch (error) {
      this.logger.error(
        'Failed to start debug session',
        pluginId,
        error as Error
      )
      throw error
    }
  }

  /**
   * 停止调试会话
   */
  async stopDebugSession(pluginId: string): Promise<void> {
    if (!this.debugSessions.has(pluginId)) {
      return
    }

    try {
      // 移除所有断点
      const pluginBreakpoints = Array.from(this.breakpoints.values()).filter(
        (bp) => bp.pluginId === pluginId
      )

      for (const bp of pluginBreakpoints) {
        await this.removeBreakpoint(bp.id)
      }

      this.debugSessions.delete(pluginId)
      this.emit('debug:stop', pluginId)

      this.logger.info('Debug session stopped', pluginId)
    } catch (error) {
      this.logger.error(
        'Failed to stop debug session',
        pluginId,
        error as Error
      )
      throw error
    }
  }

  /**
   * 设置断点
   */
  async setBreakpoint(breakpoint: Omit<Breakpoint, 'id'>): Promise<Breakpoint> {
    const id = this.generateBreakpointId()
    const bp: Breakpoint = { ...breakpoint, id, enabled: true }

    try {
      await this.sendDebugCommand(bp.pluginId, 'setBreakpoint', bp)

      this.breakpoints.set(id, bp)
      this.emit('breakpoint:add', bp)

      this.logger.debug('Breakpoint set', bp.pluginId, bp)
      return bp
    } catch (error) {
      this.logger.error('Failed to set breakpoint', bp.pluginId, error as Error)
      throw error
    }
  }

  /**
   * 移除断点
   */
  async removeBreakpoint(breakpointId: string): Promise<void> {
    const bp = this.breakpoints.get(breakpointId)
    if (!bp) return

    try {
      await this.sendDebugCommand(bp.pluginId, 'removeBreakpoint', {
        id: breakpointId,
      })

      this.breakpoints.delete(breakpointId)
      this.emit('breakpoint:remove', breakpointId)

      this.logger.debug('Breakpoint removed', bp.pluginId, { breakpointId })
    } catch (error) {
      this.logger.error(
        'Failed to remove breakpoint',
        bp.pluginId,
        error as Error
      )
      throw error
    }
  }

  /**
   * 继续执行
   */
  async resume(pluginId: string): Promise<void> {
    try {
      await this.sendDebugCommand(pluginId, 'resume')
      this.emit('debug:resume', pluginId)
    } catch (error) {
      this.logger.error('Failed to resume execution', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 单步执行
   */
  async stepOver(pluginId: string): Promise<void> {
    try {
      await this.sendDebugCommand(pluginId, 'stepOver')
    } catch (error) {
      this.logger.error('Failed to step over', pluginId, error as Error)
      throw error
    }
  }

  /**
   * 获取变量值
   */
  async evaluateExpression(
    pluginId: string,
    expression: string,
    frameId?: string
  ): Promise<any> {
    try {
      return await this.sendDebugCommand(pluginId, 'evaluate', {
        expression,
        frameId,
      })
    } catch (error) {
      this.logger.error(
        'Failed to evaluate expression',
        pluginId,
        error as Error
      )
      throw error
    }
  }

  /**
   * 获取网络请求记录
   */
  getNetworkRequests(pluginId: string): NetworkRequest[] {
    return Array.from(this.networkRequests.values()).filter((req) =>
      req.url.includes(pluginId)
    )
  }

  /**
   * 清除网络请求记录
   */
  clearNetworkRequests(pluginId: string): void {
    const requests = this.getNetworkRequests(pluginId)
    for (const req of requests) {
      this.networkRequests.delete(req.id)
    }
  }

  private setupNetworkInterceptor(): void {
    // 拦截fetch请求
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = this.createNetworkRequest(input.toString(), init)
      this.networkRequests.set(request.id, request)
      this.emit('network:request', request)

      try {
        const startTime = Date.now()
        const response = await originalFetch(input, init)

        // 更新请求信息
        request.duration = Date.now() - startTime
        request.status = response.status

        if (
          response.headers.get('content-type')?.includes('application/json')
        ) {
          const clone = response.clone()
          request.response = await clone.text()
        }

        this.networkRequests.set(request.id, request)
        return response
      } catch (error) {
        request.error = error as Error
        this.networkRequests.set(request.id, request)
        throw error
      }
    }

    // 拦截XHR请求
    const self = this
    const XHR = window.XMLHttpRequest
    window.XMLHttpRequest = function () {
      const xhr = new XHR()
      const requestData: NetworkRequest = {
        id: Math.random().toString(36).substr(2, 9),
        url: '',
        method: 'GET',
        headers: {},
        timestamp: Date.now(),
      }

      // 保存原始方法
      const originalOpen = xhr.open
      const originalSend = xhr.send
      const originalSetRequestHeader = xhr.setRequestHeader

      // 重写open方法
      xhr.open = function (method: string, url: string) {
        requestData.method = method
        requestData.url = url
        return originalOpen.apply(xhr, arguments as any)
      }

      // 重写send方法
      xhr.send = function (body?: string | Document | XMLHttpRequestBodyInit) {
        requestData.body = body?.toString()
        self.networkRequests.set(requestData.id, requestData)
        self.emit('network:request', requestData)

        const startTime = Date.now()

        xhr.addEventListener('load', () => {
          requestData.duration = Date.now() - startTime
          requestData.status = xhr.status
          requestData.response = xhr.responseText
          self.networkRequests.set(requestData.id, requestData)
        })

        xhr.addEventListener('error', () => {
          requestData.error = new Error('Network request failed')
          self.networkRequests.set(requestData.id, requestData)
        })

        return originalSend.apply(xhr, arguments as any)
      }

      // 重写setRequestHeader方法
      xhr.setRequestHeader = function (name: string, value: string) {
        requestData.headers[name] = value
        return originalSetRequestHeader.apply(xhr, arguments as any)
      }

      return xhr
    } as any as typeof XMLHttpRequest
  }

  private createNetworkRequest(
    input: RequestInfo,
    init?: RequestInit
  ): NetworkRequest {
    const url = typeof input === 'string' ? input : input.url
    return {
      id: Math.random().toString(36).substr(2, 9),
      url,
      method: init?.method || 'GET',
      headers: (init?.headers as Record<string, string>) || {},
      body: init?.body?.toString(),
      timestamp: Date.now(),
    }
  }

  private async injectDebuggerScript(pluginId: string): Promise<void> {
    const script = `
      (function() {
        const debugger = {
          breakpoints: new Map(),
          
          async setBreakpoint(bp) {
            this.breakpoints.set(bp.id, bp)
            // 实现断点注入逻辑
          },
          
          async removeBreakpoint(id) {
            this.breakpoints.delete(id)
            // 实现断点移除逻辑
          },
          
          async evaluate(expression, frameId) {
            // 实现表达式求值逻辑
            return eval(expression)
          }
        }

        window.__pluginDebugger = debugger
      })()
    `

    // TODO: 通过插件沙箱注入脚本
    await this.sendDebugCommand(pluginId, 'injectScript', { script })
  }

  private async sendDebugCommand(
    pluginId: string,
    command: string,
    params?: any
  ): Promise<any> {
    // TODO: 实现与插件沙箱的调试通信
    return Promise.resolve()
  }

  private generateBreakpointId(): string {
    return Math.random().toString(36).substring(2, 10)
  }
}
