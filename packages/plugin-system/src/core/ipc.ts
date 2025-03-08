export interface IPCMessage {
  channel: string
  type: string
  payload: any
  metadata: {
    id: string
    timestamp: number
    source: string
    target?: string
    signature?: string
  }
}

export interface IPCOptions {
  origin: string
  encryption?: {
    enabled: boolean
    algorithm?: string
    key?: CryptoKey
  }
  authentication?: {
    enabled: boolean
    token?: string
  }
}

export interface IPCMessageHandler {
  (payload: any, source: Window, metadata: IPCMessage['metadata']): void
}

export class IPCBus {
  private channels: Map<string, Set<IPCMessageHandler>>
  private options: IPCOptions
  private messageQueue: Map<string, {
    resolve: Function
    reject: Function
    timer: number
  }>

  constructor(options: IPCOptions) {
    this.channels = new Map()
    this.options = options
    this.messageQueue = new Map()

    // 监听消息
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  /**
   * 生成加密密钥
   */
  static async generateEncryptionKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * 发送消息并等待响应
   */
  async request(channel: string, payload: any, timeout = 5000): Promise<any> {
    const id = this.generateMessageId()
    
    return new Promise((resolve, reject) => {
      // 设置超时
      const timer = window.setTimeout(() => {
        this.messageQueue.delete(id)
        reject(new Error(`Request timeout: ${channel}`))
      }, timeout)

      // 储存回调
      this.messageQueue.set(id, { resolve, reject, timer })

      // 发送请求
      this.send(channel, payload, { id })
    })
  }

  /**
   * 发送消息到目标窗口
   */
  async send(
    channel: string,
    payload: any,
    metadata?: Partial<IPCMessage['metadata']>,
    targetWindow: Window = window.parent
  ) {
    const message: IPCMessage = {
      channel,
      type: 'ipc',
      payload: this.options.encryption?.enabled
        ? await this.encrypt(payload)
        : payload,
      metadata: {
        id: metadata?.id || this.generateMessageId(),
        timestamp: Date.now(),
        source: window.location.origin,
        target: metadata?.target,
        signature: this.options.authentication?.enabled
          ? await this.sign(payload)
          : undefined
      }
    }

    targetWindow.postMessage(message, this.options.origin)
  }

  /**
   * 监听消息
   */
  on(channel: string, handler: IPCMessageHandler) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set())
    }
    this.channels.get(channel)?.add(handler)
    return () => this.off(channel, handler)
  }

  /**
   * 取消监听
   */
  off(channel: string, handler: IPCMessageHandler) {
    this.channels.get(channel)?.delete(handler)
  }

  /**
   * 处理接收到的消息
   */
  private async handleMessage(event: MessageEvent) {
    // 验证消息来源
    if (event.origin !== this.options.origin) {
      console.warn(`Invalid message origin: ${event.origin}`)
      return
    }

    const { data: message, source } = event
    if (!this.validateMessage(message)) {
      console.warn('Invalid message format')
      return
    }

    const { channel, payload, metadata } = message

    // 验证签名
    if (
      this.options.authentication?.enabled &&
      !await this.verifySignature(payload, metadata.signature)
    ) {
      console.error('Invalid message signature')
      return
    }

    // 解密数据
    const decryptedPayload = this.options.encryption?.enabled
      ? await this.decrypt(payload)
      : payload

    // 处理响应消息
    if (metadata.target === window.location.origin) {
      const resolver = this.messageQueue.get(metadata.id)
      if (resolver) {
        window.clearTimeout(resolver.timer)
        this.messageQueue.delete(metadata.id)
        resolver.resolve(decryptedPayload)
        return
      }
    }

    // 处理普通消息
    if (this.channels.has(channel)) {
      const handlers = this.channels.get(channel)
      handlers?.forEach(handler => {
        try {
          handler(decryptedPayload, source as Window, metadata)
        } catch (error) {
          console.error(`Error handling message on channel ${channel}:`, error)
        }
      })
    }
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 验证消息格式
   */
  private validateMessage(message: any): message is IPCMessage {
    return (
      message &&
      typeof message === 'object' &&
      typeof message.channel === 'string' &&
      typeof message.type === 'string' &&
      message.type === 'ipc' &&
      message.payload !== undefined &&
      message.metadata &&
      typeof message.metadata === 'object' &&
      typeof message.metadata.id === 'string' &&
      typeof message.metadata.timestamp === 'number' &&
      typeof message.metadata.source === 'string'
    )
  }

  /**
   * 加密数据
   */
  private async encrypt(data: any): Promise<string> {
    if (!this.options.encryption?.key) {
      throw new Error('Encryption key not set')
    }

    // 生成初始化向量
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    // 加密数据
    const plaintext = new TextEncoder().encode(JSON.stringify(data))
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      this.options.encryption.key,
      plaintext
    )

    // 组合 IV 和密文
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)

    // 转换为 base64
    return btoa(String.fromCharCode(...combined))
  }

  /**
   * 解密数据
   */
  private async decrypt(data: string): Promise<any> {
    if (!this.options.encryption?.key) {
      throw new Error('Encryption key not set')
    }

    // 解码 base64
    const combined = new Uint8Array(
      atob(data).split('').map(char => char.charCodeAt(0))
    )

    // 提取 IV 和密文
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    // 解密数据
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      this.options.encryption.key,
      ciphertext
    )

    // 解析JSON
    return JSON.parse(new TextDecoder().decode(plaintext))
  }

  /**
   * 签名数据
   */
  private async sign(data: any): Promise<string> {
    if (!this.options.authentication?.token) {
      throw new Error('Authentication token not set')
    }
    
    const text = JSON.stringify(data)
    const msgBuffer = new TextEncoder().encode(text + this.options.authentication.token)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 验证签名
   */
  private async verifySignature(data: any, signature?: string): Promise<boolean> {
    if (!signature || !this.options.authentication?.token) {
      return false
    }
    const expectedSignature = await this.sign(data)
    return signature === expectedSignature
  }
}
