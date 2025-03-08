import { Plugin, PluginContext } from '../../src/sdk/Plugin'

interface ChartData {
  labels: string[]
  values: number[]
}

class EnhancedPlugin extends Plugin {
  private data: ChartData
  private updateInterval: number | null = null
  private dependencies = {
    chart: { name: 'chart.js', version: '4.4.1' },
    moment: { name: 'moment', version: '2.30.1' }
  }

  constructor(context: PluginContext) {
    super(context)
    this.data = {
      labels: [],
      values: []
    }
  }

  protected async onLoad(): Promise<void> {
    try {
      // 加载依赖
      await this.loadDependencies()

      // 注册API
      this.registerAPI('getData', this.getData.bind(this))
      this.registerAPI('setData', this.setData.bind(this))
      this.registerAPI('startUpdates', this.startUpdates.bind(this))
      this.registerAPI('stopUpdates', this.stopUpdates.bind(this))

      // 注册UI组件
      this.registerComponent('live-chart', class extends HTMLElement {
        private chart: any
        private container: HTMLCanvasElement

        constructor() {
          super()
          
          const shadow = this.attachShadow({ mode: 'open' })
          
          this.container = document.createElement('canvas')
          shadow.appendChild(this.container)
        }

        async connectedCallback() {
          // 创建图表
          this.chart = new (window as any).Chart(this.container, {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                label: 'Live Data',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }]
            },
            options: {
              responsive: true,
              animation: false
            }
          })

          // 监听数据更新
          this.addEventListener('data-update', ((event: CustomEvent<ChartData>) => {
            this.updateChart(event.detail)
          }) as EventListener)
        }

        disconnectedCallback() {
          this.chart?.destroy()
        }

        private updateChart(data: ChartData) {
          if (!this.chart) return

          this.chart.data.labels = data.labels
          this.chart.data.datasets[0].data = data.values
          this.chart.update('none') // 禁用动画以提高性能
        }
      })

      // 开始定时更新
      this.startUpdates()

      console.log('Enhanced plugin loaded')
    } catch (error) {
      console.error('Failed to load enhanced plugin:', error)
      throw error
    }
  }

  protected async onUnload(): Promise<void> {
    // 停止更新
    this.stopUpdates()

    // 保存状态
    await this.state.set('data', this.data)
    console.log('Enhanced plugin unloaded')
  }

  private async loadDependencies(): Promise<void> {
    try {
      for (const [key, dep] of Object.entries(this.dependencies)) {
        await this.callHostAPI('loadDependency', {
          name: dep.name,
          version: dep.version,
          type: 'npm'
        })
      }
    } catch (error) {
      console.error('Failed to load dependencies:', error)
      throw error
    }
  }

  private async getData(): Promise<ChartData> {
    return this.data
  }

  private async setData(data: ChartData): Promise<void> {
    this.data = data
    this.emitDataUpdate()
  }

  private startUpdates(interval: number = 1000): void {
    if (this.updateInterval !== null) return

    this.updateInterval = window.setInterval(() => {
      const now = new Date()
      const moment = (window as any).moment

      // 更新数据
      this.data.labels.push(moment(now).format('HH:mm:ss'))
      this.data.values.push(Math.random() * 100)

      // 保持最近100个数据点
      if (this.data.labels.length > 100) {
        this.data.labels.shift()
        this.data.values.shift()
      }

      this.emitDataUpdate()
    }, interval)
  }

  private stopUpdates(): void {
    if (this.updateInterval === null) return

    window.clearInterval(this.updateInterval)
    this.updateInterval = null
  }

  private emitDataUpdate(): void {
    // 触发组件更新
    const event = new CustomEvent('data-update', {
      detail: this.data
    })
    document.querySelector('live-chart')?.dispatchEvent(event)

    // 发送事件到宿主应用
    this.emit('dataUpdate', this.data)
  }
}

// 创建插件实例
const context: PluginContext = {
  id: 'enhanced-plugin',
  version: '1.0.0',
  env: {
    mode: window.location.hostname === 'localhost' ? 'development' : 'production',
    debug: window.localStorage.getItem('debug') === 'true'
  }
}

export default new EnhancedPlugin(context)