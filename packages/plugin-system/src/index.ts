import { SandboxOptions, LogLevel } from './core'

// Core types
export type {
  SandboxOptions,
  LogLevel,
  LogEntry,
  LoggerOptions,
  UpdateInfo,
  NetworkRequest,
  PluginMetrics,
  MetricsAlert,
  HealthStatus,
  DependencyInfo,
  DependencyResolution,
  DependencyManagerOptions,
  Dependency,
  DependencyManager,
  DashboardState,
  DashboardView,
} from './core'

// Types
export type { PluginManifest, PluginState, PluginInfo } from './pluginManager'
export type { PluginContext } from './sdk/Plugin'

// Core components
export {
  Logger,
  Monitor,
  Debugger,
  HotReload,
  DependencyLoader,
  Dashboard,
} from './core'

// Core functionality
export { PluginManager } from './pluginManager'
export { Plugin } from './sdk/Plugin'

// Default configurations
export const DEFAULT_SANDBOX_OPTIONS: SandboxOptions = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'blob:'],
    connectSrc: ["'self'"],
  },
  resources: {
    maxMemory: 128,
    maxCPU: 80,
    maxNetworkRequests: 100,
    maxDOMNodes: 1000,
  },
}

export const DEFAULT_LOGGER_OPTIONS = {
  minLevel: 'info' as LogLevel,
  maxEntries: 1000,
  persistLogs: true,
}

export const DEFAULT_MONITOR_OPTIONS = {
  checkInterval: 5000,
  thresholds: {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 70, critical: 90 },
    errors: { warning: 5, critical: 10 },
  },
}

export const DEFAULT_DASHBOARD_OPTIONS = {
  refreshInterval: 1000,
  maxLogEntries: 1000,
  maxMetricsHistory: 100,
}

// Version
export const VERSION = '1.0.0'
