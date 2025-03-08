export interface SandboxOptions {
  csp?: CSPOptions
  resources?: ResourceLimits
  permissions?: PermissionOptions
}

export interface CSPOptions {
  defaultSrc?: string[]
  scriptSrc?: string[]
  styleSrc?: string[]
  imgSrc?: string[]
  connectSrc?: string[]
  fontSrc?: string[]
  objectSrc?: string[]
  mediaSrc?: string[]
  frameSrc?: string[]
  reportUri?: string
}

export interface ResourceLimits {
  maxMemory?: number // MB
  maxCPU?: number // percentage
  maxNetworkRequests?: number
  maxDOMNodes?: number
}

export interface PermissionOptions {
  clipboard?: boolean
  notifications?: boolean
  geolocation?: boolean
  camera?: boolean
  microphone?: boolean
}

export interface SandboxMetrics {
  memory: {
    used: number
    limit: number
  }
  cpu: {
    usage: number
    limit: number
  }
  network: {
    requests: number
    limit: number
  }
  dom: {
    nodes: number
    limit: number
  }
}

export class PluginSandbox {
  private pluginId: string
  private iframe: HTMLIFrameElement | null = null
  private shadowRoot: ShadowRoot | null = null
  private options: SandboxOptions
  private metrics: SandboxMetrics
  private resourceChecker: number | null = null
  private networkRequestCount = 0

  constructor(pluginId: string, options: SandboxOptions = {}) {
    this.pluginId = pluginId
    this.options = this.normalizeOptions(options)
    this.metrics = this.initializeMetrics()
  }

  /**
   * 创建沙箱容器
   */
  async createContainer(): Promise<void> {
    // 创建容器元素
    const container = document.createElement('div')
    container.id = `plugin-${this.pluginId}`

    // 创建隔离的iframe
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'border: none; width: 100%; height: 100%;'

    // 设置sandbox属性
    iframe.sandbox.add(
      'allow-scripts',
      'allow-same-origin',
      'allow-forms',
      'allow-popups',
      'allow-modals',
      'allow-downloads'
    )

    // 监听iframe加载完成
    await new Promise<void>((resolve) => {
      iframe.addEventListener('load', () => {
        // 创建Shadow DOM
        if (iframe.contentDocument) {
          this.shadowRoot = iframe.contentDocument.body.attachShadow({
            mode: 'closed', // 使用closed模式增强安全性
          })

          // 注入CSP
          this.injectCSP()

          // 注入资源监控脚本
          this.injectResourceMonitor()

          // 开始资源监控
          this.startResourceMonitoring()
        }
        resolve()
      })
    })

    this.iframe = iframe
    container.appendChild(iframe)

    // 添加到插件容器
    let pluginContainer = document.getElementById('plugin-container')
    if (!pluginContainer) {
      pluginContainer = document.createElement('div')
      pluginContainer.id = 'plugin-container'
      document.body.appendChild(pluginContainer)
    }
    pluginContainer.appendChild(container)
  }

  /**
   * 销毁沙箱
   */
  destroy(): void {
    // 停止资源监控
    if (this.resourceChecker !== null) {
      window.clearInterval(this.resourceChecker)
      this.resourceChecker = null
    }

    // 移除iframe
    if (this.iframe) {
      this.iframe.remove()
      this.iframe = null
      this.shadowRoot = null
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): SandboxMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取沙箱配置
   */
  getOptions(): SandboxOptions {
    return { ...this.options }
  }

  /**
   * 注入内容到沙箱
   */
  async injectContent(content: string | Blob): Promise<void> {
    if (!this.iframe?.contentDocument) {
      throw new Error('Sandbox not initialized')
    }

    if (content instanceof Blob) {
      const url = URL.createObjectURL(content)
      try {
        await this.loadURL(url)
      } finally {
        URL.revokeObjectURL(url)
      }
    } else {
      const doc = this.iframe.contentDocument
      doc.open()
      doc.write(content)
      doc.close()
    }
  }

  private normalizeOptions(options: SandboxOptions): SandboxOptions {
    return {
      csp: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        ...options.csp,
      },
      resources: {
        maxMemory: 128, // 128MB
        maxCPU: 80, // 80%
        maxNetworkRequests: 100,
        maxDOMNodes: 1000,
        ...options.resources,
      },
      permissions: {
        clipboard: false,
        notifications: false,
        geolocation: false,
        camera: false,
        microphone: false,
        ...options.permissions,
      },
    }
  }

  private initializeMetrics(): SandboxMetrics {
    return {
      memory: {
        used: 0,
        limit: this.options.resources?.maxMemory || 128,
      },
      cpu: {
        usage: 0,
        limit: this.options.resources?.maxCPU || 80,
      },
      network: {
        requests: 0,
        limit: this.options.resources?.maxNetworkRequests || 100,
      },
      dom: {
        nodes: 0,
        limit: this.options.resources?.maxDOMNodes || 1000,
      },
    }
  }

  private injectCSP(): void {
    if (!this.iframe?.contentDocument) return

    const csp = this.options.csp
    if (!csp) return

    const cspValue = Object.entries(csp)
      .filter(([, value]) => value && value.length > 0)
      .map(([key, value]) => {
        const directive = key.replace(/[A-Z]/g, '-$&').toLowerCase()
        return `${directive} ${value!.join(' ')}`
      })
      .join('; ')

    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = cspValue
    this.iframe.contentDocument.head.appendChild(meta)
  }

  private injectResourceMonitor(): void {
    if (!this.iframe?.contentWindow) return

    const script = `
      // 性能监控
      let lastCPUTime = performance.now()
      let lastCPUUsage = 0

      // 监控CPU使用
      function measureCPU() {
        const now = performance.now()
        const usage = (performance.now() - lastCPUTime) / (now - lastCPUTime) * 100
        lastCPUTime = now
        lastCPUUsage = usage
        return usage
      }

      // 监控内存使用
      function measureMemory() {
        return performance.memory?.usedJSHeapSize || 0
      }

      // 监控DOM节点数
      function countDOMNodes() {
        return document.getElementsByTagName('*').length
      }

      // 拦截网络请求
      const originalFetch = window.fetch
      window.fetch = function(...args) {
        window.parent.postMessage({ 
          type: 'network-request',
          pluginId: '${this.pluginId}'
        }, '*')
        return originalFetch.apply(this, args)
      }

      // 拦截XHR
      const originalXHR = window.XMLHttpRequest
      window.XMLHttpRequest = function(...args) {
        const xhr = new originalXHR(...args)
        const originalOpen = xhr.open
        xhr.open = function(...openArgs) {
          window.parent.postMessage({
            type: 'network-request',
            pluginId: '${this.pluginId}'
          }, '*')
          return originalOpen.apply(xhr, openArgs)
        }
        return xhr
      }

      // 定期报告指标
      setInterval(() => {
        window.parent.postMessage({
          type: 'resource-metrics',
          pluginId: '${this.pluginId}',
          metrics: {
            cpu: lastCPUUsage,
            memory: measureMemory(),
            domNodes: countDOMNodes()
          }
        }, '*')
      }, 1000)
    `

    const scriptElement = document.createElement('script')
    scriptElement.textContent = script
    this.iframe.contentDocument?.head.appendChild(scriptElement)
  }

  private startResourceMonitoring(): void {
    // 监听资源指标消息
    window.addEventListener('message', (event) => {
      if (
        event.data?.type === 'resource-metrics' &&
        event.data?.pluginId === this.pluginId
      ) {
        this.updateMetrics(event.data.metrics)
      } else if (
        event.data?.type === 'network-request' &&
        event.data?.pluginId === this.pluginId
      ) {
        this.handleNetworkRequest()
      }
    })

    // 定期检查资源使用是否超限
    this.resourceChecker = window.setInterval(() => {
      this.checkResourceLimits()
    }, 1000)
  }

  private updateMetrics(metrics: Partial<SandboxMetrics>): void {
    if ('cpu' in metrics && metrics.cpu) {
      this.metrics.cpu.usage = metrics.cpu.usage
    }
    if ('memory' in metrics && metrics.memory) {
      this.metrics.memory.used = metrics.memory.used
    }
    if ('dom' in metrics && metrics.dom) {
      this.metrics.dom.nodes = metrics.dom.nodes
    }
  }

  private handleNetworkRequest(): void {
    this.networkRequestCount++
    this.metrics.network.requests = this.networkRequestCount
  }

  private checkResourceLimits(): void {
    const { resources } = this.options
    const { metrics } = this

    // 检查内存使用
    if (
      resources?.maxMemory &&
      metrics.memory.used > resources.maxMemory * 1024 * 1024
    ) {
      this.handleResourceViolation('memory')
    }

    // 检查CPU使用
    if (resources?.maxCPU && metrics.cpu.usage > resources.maxCPU) {
      this.handleResourceViolation('cpu')
    }

    // 检查网络请求数
    if (
      resources?.maxNetworkRequests &&
      metrics.network.requests > resources.maxNetworkRequests
    ) {
      this.handleResourceViolation('network')
    }

    // 检查DOM节点数
    if (resources?.maxDOMNodes && metrics.dom.nodes > resources.maxDOMNodes) {
      this.handleResourceViolation('dom')
    }
  }

  private handleResourceViolation(resource: string): void {
    // 触发资源超限事件
    const event = new CustomEvent('resource-violation', {
      detail: {
        pluginId: this.pluginId,
        resource,
        metrics: this.metrics,
      },
    })
    window.dispatchEvent(event)

    // 可以在这里实现自动限制或警告逻辑
    console.warn(`Plugin ${this.pluginId} exceeded ${resource} limit`)
  }

  private async loadURL(url: string): Promise<void> {
    if (!this.iframe) {
      throw new Error('Sandbox iframe not initialized')
    }

    const iframe = this.iframe
    return new Promise<void>((resolve, reject) => {
      const handleLoad = () => {
        iframe.removeEventListener('load', handleLoad)
        iframe.removeEventListener('error', handleError)
        resolve()
      }

      const handleError = (error: ErrorEvent) => {
        iframe.removeEventListener('load', handleLoad)
        iframe.removeEventListener('error', handleError)
        reject(new Error(`Failed to load content: ${error.message}`))
      }

      iframe.addEventListener('load', handleLoad)
      iframe.addEventListener('error', handleError)
      iframe.src = url
    })
  }
}
