# API 文档

## 核心 API

### PluginManager

插件管理器是整个系统的核心类，提供插件的生命周期管理。

```typescript
class PluginManager {
  /**
   * 创建插件管理器实例
   */
  constructor(options: PluginManagerOptions)
  
  /**
   * 安装插件
   * @param manifest 插件配置清单
   */
  async install(manifest: PluginManifest): Promise<void>
  
  /**
   * 卸载插件
   * @param pluginId 插件ID
   */
  async uninstall(pluginId: string): Promise<void>
  
  /**
   * 启用插件
   * @param pluginId 插件ID
   */
  async enable(pluginId: string): Promise<void>
  
  /**
   * 禁用插件
   * @param pluginId 插件ID
   */
  async disable(pluginId: string): Promise<void>
  
  /**
   * 热更新插件
   * @param pluginId 插件ID
   * @param code 新的插件代码
   */
  async hotReload(pluginId: string, code: string): Promise<void>
  
  /**
   * 获取插件实例
   */
  getPlugin(pluginId: string): Plugin | null
  
  /**
   * 获取所有已安装的插件
   */
  getAllPlugins(): Plugin[]
  
  /**
   * 监听插件事件
   */
  on(event: PluginEvent, handler: Function): void
}
```

### Plugin SDK

插件开发工具包，提供插件开发所需的所有API。

```typescript
class Plugin {
  /**
   * 插件初始化时调用
   */
  async onLoad(): Promise<void>
  
  /**
   * 插件启用时调用
   */
  async onEnable(): Promise<void>
  
  /**
   * 插件禁用时调用
   */
  async onDisable(): Promise<void>
  
  /**
   * 注册API方法
   */
  registerAPI(name: string, implementation: Function): void
  
  /**
   * 注册UI组件
   */
  registerComponent(tagName: string, component: CustomElementConstructor): void
  
  /**
   * 调用宿主应用API
   */
  callHost(method: string, ...args: any[]): Promise<any>
  
  /**
   * 获取插件状态
   */
  getState<T>(key: string): T
  
  /**
   * 设置插件状态
   */
  setState<T>(key: string, value: T): void
  
  /**
   * 发送事件
   */
  emit(event: string, data: any): void
  
  /**
   * 监听事件
   */
  on(event: string, handler: Function): void
}
```

### SandboxManager

沙箱管理器负责创建和管理插件的运行环境。

```typescript
class SandboxManager {
  /**
   * 创建沙箱环境
   */
  createSandbox(pluginId: string, options: SandboxOptions): Sandbox
  
  /**
   * 销毁沙箱环境
   */
  destroySandbox(pluginId: string): void
  
  /**
   * 获取沙箱实例
   */
  getSandbox(pluginId: string): Sandbox | null
  
  /**
   * 设置沙箱资源限制
   */
  setResourceLimits(pluginId: string, limits: ResourceLimits): void
  
  /**
   * 获取沙箱性能指标
   */
  getMetrics(pluginId: string): SandboxMetrics
}
```

### IPCBus

跨沙箱通信总线。

```typescript
class IPCBus {
  /**
   * 发送消息
   */
  send(channel: string, data: any): void
  
  /**
   * 监听消息
   */
  on(channel: string, handler: Function): void
  
  /**
   * 请求-响应模式通信
   */
  request(channel: string, data: any): Promise<any>
  
  /**
   * 广播消息
   */
  broadcast(channel: string, data: any): void
}
```

## 监控 API

### MetricsCollector

性能指标收集器。

```typescript
class MetricsCollector {
  /**
   * 记录指标
   */
  record(name: string, value: number): void
  
  /**
   * 开始计时
   */
  startTimer(name: string): void
  
  /**
   * 结束计时
   */
  endTimer(name: string): number
  
  /**
   * 获取指标统计
   */
  getMetrics(): Metrics
}
```

### HealthMonitor

健康状态监控。

```typescript
class HealthMonitor {
  /**
   * 检查插件健康状态
   */
  checkHealth(pluginId: string): HealthStatus
  
  /**
   * 设置健康检查规则
   */
  setHealthRules(rules: HealthRules): void
  
  /**
   * 获取系统整体健康状态
   */
  getSystemHealth(): SystemHealth
}
```

## 类型定义

### 配置类型

```typescript
interface PluginManagerOptions {
  store?: string
  sandbox?: SandboxOptions
  security?: SecurityOptions
  monitoring?: MonitoringOptions
}

interface SandboxOptions {
  cpu: number
  memory: number
  timeout: number
  permissions: string[]
}

interface SecurityOptions {
  csp: CSPOptions
  authentication: AuthOptions
  encryption: EncryptionOptions
}

interface MonitoringOptions {
  metrics: string[]
  logLevel: LogLevel
  healthCheck: HealthCheckOptions
}
```

### 事件类型

```typescript
type PluginEvent = 
  | 'install'
  | 'uninstall'
  | 'enable'
  | 'disable'
  | 'crash'
  | 'update'
  | 'error'

interface PluginEventData {
  pluginId: string
  timestamp: number
  data: any
}
```

### 状态类型

```typescript
interface PluginState {
  status: PluginStatus
  health: HealthStatus
  resources: ResourceUsage
  metrics: MetricsData
}

type PluginStatus = 
  | 'installing'
  | 'running'
  | 'stopped'
  | 'error'

type HealthStatus =
  | 'healthy'
  | 'warning'
  | 'critical'
```

## 错误处理

系统定义了一系列标准错误类型：

```typescript
class PluginError extends Error {
  constructor(message: string, pluginId: string)
}

class SandboxError extends Error {
  constructor(message: string, sandboxId: string)
}

class SecurityError extends Error {
  constructor(message: string, details: SecurityViolation)
}

class ResourceError extends Error {
  constructor(message: string, limits: ResourceLimits)
}
```

## 扩展接口

### 插件商店接口

```typescript
interface PluginStore {
  /**
   * 获取可用插件列表
   */
  listPlugins(): Promise<PluginInfo[]>
  
  /**
   * 发布插件
   */
  publishPlugin(plugin: PluginPackage): Promise<void>
  
  /**
   * 更新插件
   */
  updatePlugin(pluginId: string, version: string): Promise<void>
}
```

### 调试接口

```typescript
interface DebugAPI {
  /**
   * 启动调试会话
   */
  startDebugSession(pluginId: string): Promise<DebugSession>
  
  /**
   * 设置断点
   */
  setBreakpoint(location: SourceLocation): Promise<void>
  
  /**
   * 获取变量值
   */
  evaluate(expression: string): Promise<any>
}