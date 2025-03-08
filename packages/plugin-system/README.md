# 插件系统

一个基于 Web Components 和 IFrame 沙箱的安全、可扩展的插件系统，支持运行时动态加载和卸载插件。

## 特性

- 🔒 安全沙箱: 基于 IFrame + Shadow DOM 的双重隔离
- 🔌 热插拔: 支持运行时动态加载和卸载插件
- 📡 IPC 通信: 基于 postMessage 的安全通信机制
- 🔧 RPC 调用: 支持跨沙箱的远程方法调用
- 📊 监控面板: 实时监控插件性能和健康状态
- 🛠️ 调试工具: 内置开发调试支持
- 💾 状态持久化: 插件状态自动保存和恢复
- 🔑 身份验证: 安全的插件通信认证机制
- 📦 插件商店: 内置插件分发和管理接口

## 快速开始

### 安装

```bash
npm install @work-designer/plugin-system
```

### 使用示例

```typescript
import { PluginManager } from '@work-designer/plugin-system'

// 创建插件管理器
const manager = new PluginManager({
  store: 'https://plugins.example.com',
  sandbox: {
    cpu: 80, // CPU 限制 (%)
    memory: 128, // 内存限制 (MB)
  },
})

// 安装插件
await manager.install({
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  entry: 'https://my-plugin.com/index.js',
})

// 启用插件
await manager.enable('my-plugin')

// 监听插件事件
manager.on('crash', (pluginId, error) => {
  console.error(`Plugin ${pluginId} crashed:`, error)
})
```

### 开发插件

```typescript
import { Plugin } from '@work-designer/plugin-sdk'

export default class MyPlugin extends Plugin {
  async onLoad() {
    // 注册 API
    this.registerAPI('greeting', () => 'Hello from plugin!')

    // 注册 UI 组件
    this.registerComponent(
      'my-widget',
      class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<h1>My Widget</h1>'
        }
      }
    )
  }

  async onUnload() {
    // 清理资源
  }
}
```

## 文档

- [架构设计](./ARCHITECTURE.md)
- [API 文档](./API.md)
- [安全说明](./SECURITY.md)
- [插件开发指南](./docs/plugin-development.md)

## License

MIT
