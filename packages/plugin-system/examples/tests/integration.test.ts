import { PluginManager } from '../../src/pluginManager'
import { Logger } from '../../src/core/logger'
import { Monitor } from '../../src/core/monitor'
import { Debugger } from '../../src/core/debugger'
import { HotReload } from '../../src/core/hotReload'
import { DependencyLoader } from '../../src/core/dependencyLoader'
import { Dashboard } from '../../src/core/dashboard'

describe('Plugin System Integration', () => {
  let pluginManager: PluginManager
  let logger: Logger
  let monitor: Monitor
  let debugger_: Debugger
  let hotReload: HotReload
  let dependencyLoader: DependencyLoader
  let dashboard: Dashboard

  beforeEach(() => {
    logger = new Logger({ minLevel: 'debug', persistLogs: false })
    monitor = new Monitor(logger)
    debugger_ = new Debugger(logger)
    hotReload = new HotReload({ autoApply: false }, logger)
    dependencyLoader = new DependencyLoader(logger)
    dashboard = new Dashboard(logger, monitor, debugger_, hotReload)

    pluginManager = new PluginManager({
      sandboxOptions: {
        csp: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", 'registry.npmjs.org']
        }
      }
    })
  })

  afterEach(async () => {
    await pluginManager.destroy()
    dashboard.destroy()
  })

  test('complete plugin lifecycle', async () => {
    // 1. Install plugin
    await pluginManager.install({
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      entry: {
        main: '/base/examples/enhanced-plugin/index.js'
      }
    })

    expect(pluginManager.getPlugin('test-plugin')).toBeDefined()

    // 2. Load dependencies
    await dependencyLoader.loadDependency({
      name: 'chart.js',
      version: '4.4.1',
      type: 'npm'
    })

    expect(dependencyLoader.isDependencyLoaded('chart.js', '4.4.1')).toBeTruthy()

    // 3. Start monitoring
    const metrics = monitor.getMetrics('test-plugin')
    expect(metrics).toBeDefined()
    expect(metrics?.cpu.usage).toBeGreaterThanOrEqual(0)
    expect(metrics?.memory.used).toBeGreaterThanOrEqual(0)

    // 4. Check logs
    logger.info('Plugin installed successfully', 'test-plugin')
    const logs = dashboard.getLogs({ pluginId: 'test-plugin' })
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0].level).toBe('info')

    // 5. Start debugging
    await dashboard.startDebugging('test-plugin')
    const networkRequests = dashboard.getNetworkRequests('test-plugin')
    expect(Array.isArray(networkRequests)).toBeTruthy()

    // 6. Hot reload
    const updates = await hotReload.checkForUpdates(['test-plugin'])
    expect(updates.size).toBe(0) // No updates available in test

    // 7. Stop plugin
    await pluginManager.stop('test-plugin')
    expect(pluginManager.getPlugin('test-plugin')?.state.status).toBe('stopped')
  })

  test('error handling', async () => {
    // 1. Invalid plugin installation
    await expect(
      pluginManager.install({
        id: 'invalid-plugin',
        name: 'Invalid Plugin',
        version: '1.0.0',
        entry: {
          main: '/nonexistent.js'
        }
      })
    ).rejects.toThrow()

    // 2. Resource limits
    const mockPlugin = {
      id: 'resource-heavy-plugin',
      name: 'Resource Heavy Plugin',
      version: '1.0.0',
      entry: { main: '/heavy.js' }
    }

    await pluginManager.install(mockPlugin)

    // Simulate high CPU usage
    monitor.updateMetrics('resource-heavy-plugin', {
      cpu: { usage: 95, peak: 95, average: 90 }
    })

    const metrics = monitor.getMetrics('resource-heavy-plugin')
    expect(metrics?.status).toBe('critical')

    // 3. Network security
    const networkSpy = jest.spyOn(window, 'fetch')
    await expect(
      dependencyLoader.loadDependency({
        name: 'malicious-package',
        version: '1.0.0',
        type: 'npm'
      })
    ).rejects.toThrow()

    // 4. Debug errors
    await expect(
      dashboard.startDebugging('nonexistent-plugin')
    ).rejects.toThrow()
  })

  test('performance monitoring', (done) => {
    let metricsCount = 0
    
    // Monitor metrics updates
    monitor.on('metrics:update', (metrics) => {
      metricsCount++
      expect(metrics.timestamp).toBeDefined()
      expect(metrics.cpu).toBeDefined()
      expect(metrics.memory).toBeDefined()

      if (metricsCount >= 3) {
        done()
      }
    })

    // Install and start plugin
    pluginManager.install({
      id: 'monitored-plugin',
      name: 'Monitored Plugin',
      version: '1.0.0',
      entry: { main: '/monitored.js' }
    })
  })
})