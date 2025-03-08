import { PluginManager } from '../../src/pluginManager'

async function main() {
  // 创建插件管理器
  const pluginManager = new PluginManager({
    sandboxOptions: {
      csp: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"]
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
    // 安装计数器插件
    await pluginManager.install({
      id: 'counter-plugin',
      name: 'Counter Plugin',
      version: '1.0.0',
      description: 'A simple counter plugin example',
      entry: {
        main: '/plugins/counter-plugin/index.js'
      }
    })

    // 获取插件实例
    const plugin = pluginManager.getPlugin('counter-plugin')
    if (!plugin) {
      throw new Error('Failed to load counter plugin')
    }

    // 创建UI示例
    const container = document.getElementById('app')
    if (!container) {
      throw new Error('App container not found')
    }

    // 添加控制按钮
    const controls = document.createElement('div')
    controls.innerHTML = `
      <div class="controls" style="margin-bottom: 20px;">
        <button id="increment">Remote Increment</button>
        <button id="reset">Reset Counter</button>
        <button id="reload">Reload Plugin</button>
      </div>
    `
    container.appendChild(controls)

    // 添加计数器组件
    const counter = document.createElement('counter-plugin-counter-widget')
    container.appendChild(counter)

    // 添加事件监听
    document.getElementById('increment')?.addEventListener('click', async () => {
      try {
        await pluginManager.callPluginMethod('counter-plugin', 'increment', [])
      } catch (error) {
        console.error('Failed to increment counter:', error)
      }
    })

    document.getElementById('reset')?.addEventListener('click', async () => {
      try {
        await pluginManager.callPluginMethod('counter-plugin', 'setCount', [0])
      } catch (error) {
        console.error('Failed to reset counter:', error)
      }
    })

    document.getElementById('reload')?.addEventListener('click', async () => {
      // 重新加载插件
      await pluginManager.stop('counter-plugin')
      await pluginManager.start('counter-plugin')
    })

    // 监听插件事件
    pluginManager.on('plugin:error', (pluginId: string, error: Error) => {
      console.error(`Plugin ${pluginId} error:`, error)
    })

    console.log('Counter plugin example running')
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
}

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', main)