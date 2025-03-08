import { IPCBus, IPCOptions } from './ipc'

// 定义RPC特有的选项，不包括继承的IPCOptions
interface RPCSpecificOptions {
  timeout?: number
  retries?: number
  errorHandler?: (error: RPCError) => void
}

// 完整的RPC选项接口
export interface RPCOptions extends IPCOptions, RPCSpecificOptions {}

// 内部使用的配置接口，包含默认值
interface RPCInternalOptions extends IPCOptions {
  timeout: number
  retries: number
  errorHandler: (error: RPCError) => void
}

export interface MethodOptions {
  method: string
  args: any[]
  timeout?: number
  retries?: number
}

export interface RPCRequest {
  id: string
  method: string
  args: any[]
}

export interface RPCResponse {
  id: string
  result?: any
  error?: RPCError
  status: 'success' | 'error'
}

export class RPCError extends Error {
  constructor(
    message: string,
    public code: string,
    public data?: any
  ) {
    super(message)
    this.name = 'RPCError'
  }
}

export type RPCMethod = (...args: any[]) => Promise<any>

export class RPCManager {
  private methods: Map<string, RPCMethod>
  private pending: Map<
    string,
    {
      resolve: (value: any) => void
      reject: (reason: any) => void
      timer: number
      retries: number
    }
  >
  private ipc: IPCBus
  private options: RPCInternalOptions

  constructor(options: RPCOptions) {
    this.methods = new Map()
    this.pending = new Map()

    // 设置默认值
    this.options = {
      ...options,
      timeout: options.timeout ?? 5000,
      retries: options.retries ?? 3,
      errorHandler: options.errorHandler ?? console.error,
    }

    this.ipc = new IPCBus(options)
    this.ipc.on('rpc-request', this.handleRequest.bind(this))
    this.ipc.on('rpc-response', this.handleResponse.bind(this))
  }

  /**
   * 注册RPC方法
   */
  registerMethod(name: string, method: RPCMethod): void {
    if (this.methods.has(name)) {
      throw new RPCError(
        `Method ${name} already registered`,
        'METHOD_ALREADY_EXISTS'
      )
    }
    this.methods.set(name, method)
  }

  /**
   * 注销RPC方法
   */
  unregisterMethod(name: string): void {
    this.methods.delete(name)
  }

  /**
   * 调用远程方法
   */
  async callMethod(options: MethodOptions): Promise<any> {
    const timeout = options.timeout ?? this.options.timeout
    const retries = options.retries ?? this.options.retries
    const { method, args } = options

    if (!method) {
      throw new RPCError('Method name is required', 'INVALID_METHOD')
    }

    return this.executeWithRetry(async () => {
      const id = this.generateRequestId()

      try {
        return await Promise.race([
          this.createTimeoutPromise(id, timeout),
          this.createRequestPromise(id, method, args),
        ])
      } catch (error) {
        if (error instanceof RPCError) {
          throw error
        }
        throw new RPCError(error.message || 'RPC call failed', 'CALL_FAILED', {
          method,
          args,
        })
      }
    }, retries)
  }

  /**
   * 处理RPC请求
   */
  private async handleRequest(
    request: RPCRequest,
    source: Window
  ): Promise<void> {
    try {
      this.validateRequest(request)

      const method = this.methods.get(request.method)
      if (!method) {
        throw new RPCError(
          `Method ${request.method} not found`,
          'METHOD_NOT_FOUND'
        )
      }

      try {
        const result = await method(...request.args)
        this.sendResponse(request.id, result, 'success', source)
      } catch (error) {
        throw new RPCError(
          error.message || 'Method execution failed',
          'EXECUTION_FAILED',
          { method: request.method, args: request.args }
        )
      }
    } catch (error) {
      if (error instanceof RPCError) {
        this.sendResponse(request.id, null, 'error', source, error)
      } else {
        const rpcError = new RPCError('Internal RPC error', 'INTERNAL_ERROR', {
          originalError: error.message,
        })
        this.sendResponse(request.id, null, 'error', source, rpcError)
      }

      this.options.errorHandler(error)
    }
  }

  /**
   * 处理RPC响应
   */
  private handleResponse(response: RPCResponse): void {
    const resolver = this.pending.get(response.id)
    if (!resolver) return

    clearTimeout(resolver.timer)
    this.pending.delete(response.id)

    if (response.status === 'error') {
      const error = new RPCError(
        response.error?.message || 'Unknown error',
        response.error?.code || 'UNKNOWN_ERROR',
        response.error?.data
      )
      resolver.reject(error)
    } else {
      resolver.resolve(response.result)
    }
  }

  /**
   * 创建超时Promise
   */
  private createTimeoutPromise(id: string, timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(id)
        reject(new RPCError('Request timeout', 'TIMEOUT'))
      }, timeout)

      this.pending.get(id)!.timer = timer
    })
  }

  /**
   * 创建请求Promise
   */
  private createRequestPromise(
    id: string,
    method: string,
    args: any[]
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pending.set(id, {
        resolve,
        reject,
        timer: 0,
        retries: 0,
      })

      this.ipc.send('rpc-request', {
        id,
        method,
        args,
      })
    })
  }

  /**
   * 发送RPC响应
   */
  private sendResponse(
    id: string,
    result: any,
    status: RPCResponse['status'],
    target: Window,
    error?: RPCError
  ): void {
    this.ipc.send(
      'rpc-response',
      {
        id,
        result,
        status,
        error: error
          ? {
              message: error.message,
              code: error.code,
              data: error.data,
            }
          : undefined,
      },
      undefined,
      target
    )
  }

  /**
   * 验证RPC请求
   */
  private validateRequest(request: RPCRequest): void {
    if (!request.method || typeof request.method !== 'string') {
      throw new RPCError('Invalid method name', 'INVALID_REQUEST')
    }

    if (!Array.isArray(request.args)) {
      throw new RPCError('Invalid arguments', 'INVALID_REQUEST')
    }

    if (!request.id || typeof request.id !== 'string') {
      throw new RPCError('Invalid request ID', 'INVALID_REQUEST')
    }
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
  }

  /**
   * 带重试的执行
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number
  ): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i <= retries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        if (i === retries) break

        // 指数退避重试
        const delay = Math.min(1000 * Math.pow(2, i), 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }
}
