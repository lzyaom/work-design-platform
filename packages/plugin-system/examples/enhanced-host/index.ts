import { PluginManager } from '../../src/pluginManager'
import { Dashboard } from '../../src/core/dashboard'
import { Logger } from '../../src/core/logger'
import { Monitor } from '../../src/core/monitor'
import { Debugger } from '../../src/core/debugger'
import { HotReload } from '../../src/core/hotReload'
import { DependencyLoader } from '../../src/core/dependencyLoader'

async function main() {
  // 创建核心组件
  const logger = new Logger({
    minLevel: 'debug',
    persistLogs: true
  })

  const monitor = new Monitor(logger)
  const debugger_ = new Debugger(logger)
  const hotReload = new HotReload({ autoApply: false }, logger)
  const dependencyLoader = new DependencyLoader(logger)

  // 创建仪表盘
  const dashboard = new Dashboard(
    logger,
    monitor,
    debugger_,
    hotReload,
    {
      refreshInterval: 1000,
      maxLogEntries: 1000,
      maxMetricsHistory: 100
    }
  )

  // 创建插件管理器
  const pluginManager = new PluginManager({
    sandboxOptions: {
      csp: {
        defaultSrc: ["'self'", 'cdn.jsdelivr.net'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'registry.npmjs.org', 'cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
      resources: {
        maxMemory: 128,
        maxCPU: 80,
        maxNetworkRequests: 100,
        maxDOMNodes: 1000
      }
    }
  })

  try {
    // 设置UI
    setupUI()

    // 安装增强插件
    await pluginManager.install({
      id: 'enhanced-plugin',
      name: 'Enhanced Plugin',
      version: '1.0.0',
      description: 'A plugin with enhanced features demo',
      entry: {
        main: '/plugins/enhanced-plugin/index.js'
      }
    })

    // 监听插件事件
    setupEventListeners(pluginManager, dashboard)

    console.log('Enhanced host application initialized')
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
}

function setupUI() {
  const container = document.getElementById('app')
  if (!container) return

  container.innerHTML = `
    <div class="container">
      <div class="header">
        <h1>Enhanced Plugin System Demo</h1>
        <div class="controls">
          <button id="reload">Reload Plugin</button>
          <button id="debug">Debug</button>
          <button id="inspect">Inspect</button>
        </div>
      </div>

      <div class="dashboard">
        <div class="metrics">
          <h2>Performance Metrics</h2>
          <div id="metrics"></div>
        </div>

        <div class="logs">
          <h2>System Logs</h2>
          <div id="logs"></div>
        </div>
      </div>

      <div class="plugin-container">
        <h2>Plugin Output</h2>
        <live-chart></live-chart>
      </div>
    </div>
  `

  // 添加样式
  const style = document.createElement('style')
  style.textContent = `
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .controls {
      display: flex;
      gap: 10px;
    }

    .controls button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
    }

    .controls button:hover {
      background: #0056b3;
    }

    .dashboard {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .metrics, .logs {
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    .plugin-container {
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    #metrics, #logs {
      height: 300px;
      overflow: auto;
    }
  `
  document.head.appendChild(style)
}

function setupEventListeners(
  pluginManager: PluginManager,
  dashboard: Dashboard
) {
  // 重新加载插件
  document.getElementById('reload')?.addEventListener('click', async () => {
    try {
      await pluginManager.stop('enhanced-plugin')
      await pluginManager.start('enhanced-plugin')
      console.log('Plugin reloaded')
    } catch (error) {
      console.error('Failed to reload plugin:', error)
    }
  })

  // 启动调试会话
  document.getElementById('debug')?.addEventListener('click', async () => {
    try {
      await dashboard.startDebugging('enhanced-plugin')
      console.log('Debug session started')
    } catch (error) {
      console.error('Failed to start debugging:', error)
    }
  })

  // 打开检查器
  document.getElementById('inspect')?.addEventListener('click', () => {
    // 更新指标显示
    const metrics = dashboard.getMetrics('enhanced-plugin')
    if (metrics.length > 0) {
      document.getElementById('metrics')!.innerHTML = `
        <pre>${JSON.stringify(metrics[0], null, 2)}</pre>
      `
    }

    // 更新日志显示
    // 获取最近5分钟的日志
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const logs = dashboard.getLogs({
      pluginId: 'enhanced-plugin',
      startTime: fiveMinutesAgo,
      endTime: Date.now()
    })
    document.getElementById('logs')!.innerHTML = `
      <pre>${logs.map(log => 
        `[${new Date(log.timestamp).toISOString()}] ${log.level}: ${log.message}`
      ).join('\n')}</pre>
    `
  })

  // 监听性能指标更新
  window.addEventListener('metrics-update', () => {
    if (document.getElementById('metrics')?.matches(':hover')) return
    document.getElementById('inspect')?.click()
  })

  // 监听插件事件
  pluginManager.on('plugin:error', (pluginId: string, error: Error) => {
    console.error(`Plugin ${pluginId} error:`, error)
  })
}

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', main)