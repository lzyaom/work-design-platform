import { Plugin, PluginContext } from '../../src/sdk/Plugin'

class CounterPlugin extends Plugin {
  private count = 0

  constructor(context: PluginContext) {
    super(context)
    this.registerComponents()
    this.registerAPIs()
  }

  private registerComponents() {
    // 注册计数器组件
    this.registerComponent('counter-widget', class extends HTMLElement {
      private count = 0
      private button: HTMLButtonElement
      private display: HTMLDivElement

      constructor() {
        super()
        
        // 创建Shadow DOM
        const shadow = this.attachShadow({ mode: 'open' })
        
        // 添加样式
        const style = document.createElement('style')
        style.textContent = `
          .container {
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 4px;
            display: inline-block;
          }
          .display {
            font-size: 24px;
            margin-bottom: 10px;
            text-align: center;
          }
          button {
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #0056b3;
          }
        `
        
        // 创建DOM结构
        const container = document.createElement('div')
        container.className = 'container'
        
        this.display = document.createElement('div')
        this.display.className = 'display'
        this.display.textContent = '0'
        
        this.button = document.createElement('button')
        this.button.textContent = 'Increment'
        this.button.onclick = this.handleClick.bind(this)
        
        container.appendChild(this.display)
        container.appendChild(this.button)
        
        shadow.appendChild(style)
        shadow.appendChild(container)
      }

      private async handleClick() {
        this.count++
        this.display.textContent = this.count.toString()
        
        // 通知插件状态变化
        await this.dispatchEvent(new CustomEvent('change', { 
          detail: { count: this.count }
        }))
      }

      // 获取当前计数
      get value(): number {
        return this.count
      }

      // 设置计数值
      set value(newValue: number) {
        this.count = newValue
        this.display.textContent = this.count.toString()
      }
    })
  }

  private registerAPIs() {
    // 注册RPC方法
    this.registerAPI('getCount', async () => this.count)
    this.registerAPI('setCount', async (value: number) => {
      this.count = value
      this.emit('countChanged', { count: this.count })
      return this.count
    })
    this.registerAPI('increment', async () => {
      this.count++
      this.emit('countChanged', { count: this.count })
      return this.count
    })
  }

  protected async onLoad(): Promise<void> {
    // 从存储中恢复计数
    const savedCount = await this.state.get<number>('count')
    if (savedCount !== undefined) {
      this.count = savedCount
    }

    // 监听计数变化事件
    this.on('countChanged', async ({ count }) => {
      // 保存到存储
      await this.state.set('count', count)
    })

    console.log('Counter plugin loaded')
  }

  protected async onUnload(): Promise<void> {
    // 保存当前计数
    await this.state.set('count', this.count)
    console.log('Counter plugin unloaded')
  }
}

// 创建插件实例
const context: PluginContext = {
  id: 'counter-plugin',
  version: '1.0.0',
  env: {
    mode: window.location.hostname === 'localhost' ? 'development' : 'production',
    debug: window.localStorage.getItem('debug') === 'true'
  }
}

export default new CounterPlugin(context)