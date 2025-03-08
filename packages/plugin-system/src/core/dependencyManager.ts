import { EventEmitter } from 'share'
import { Logger } from './logger'
import semver from 'semver'

export interface Dependency {
  name: string
  version: string
  url: string
  type: 'npm' | 'cdn' | 'local'
  integrity?: string
}

export interface DependencyResolution {
  name: string
  version: string
  resolved: string
  integrity: string
  dependencies?: Record<string, DependencyResolution>
}

interface DependencyManagerEvents {
  'dependency:loading': (name: string, version: string) => void
  'dependency:loaded': (name: string, version: string) => void
  'dependency:error': (name: string, version: string, error: Error) => void
  [key: string]: (...args: any[]) => void
}

export interface DependencyManagerOptions {
  /**
   * 依赖缓存目录
   */
  cacheDir?: string

  /**
   * CDN URL
   */
  cdnUrl?: string

  /**
   * 共享依赖配置
   */
  shared?: Record<string, string>

  /**
   * 是否允许使用本地依赖
   */
  allowLocal?: boolean

  /**
   * 是否验证完整性
   */
  checkIntegrity?: boolean
}

export class DependencyManager extends EventEmitter<DependencyManagerEvents> {
  private options: Required<DependencyManagerOptions>
  private logger: Logger
  private cache: Map<string, Map<string, string>> = new Map()
  private loading: Set<string> = new Set()
  private resolvedDeps: Map<string, DependencyResolution> = new Map()

  constructor(options: DependencyManagerOptions = {}, logger: Logger) {
    super()
    this.logger = logger
    this.options = {
      cacheDir: '/deps-cache',
      cdnUrl: 'https://cdn.jsdelivr.net/npm',
      shared: {},
      allowLocal: false,
      checkIntegrity: true,
      ...options,
    }
  }

  /**
   * 解析依赖
   */
  async resolveDependencies(
    dependencies: Record<string, string>
  ): Promise<Record<string, DependencyResolution>> {
    const resolved: Record<string, DependencyResolution> = {}

    for (const [name, version] of Object.entries(dependencies)) {
      // 检查是否是共享依赖
      if (this.options.shared[name]) {
        const sharedVersion = this.options.shared[name]
        if (!semver.satisfies(sharedVersion, version)) {
          throw new Error(
            `Shared dependency ${name}@${sharedVersion} does not satisfy required version ${version}`
          )
        }
        resolved[name] = await this.resolveSharedDependency(name, sharedVersion)
        continue
      }

      // 解析具体版本
      const resolvedVersion = await this.resolveVersion(name, version)
      resolved[name] = await this.resolveDependency(name, resolvedVersion)
    }

    return resolved
  }

  /**
   * 加载依赖
   */
  async loadDependency(
    name: string,
    version: string,
    type: 'npm' | 'cdn' | 'local' = 'cdn'
  ): Promise<void> {
    const cacheKey = `${name}@${version}`
    if (this.loading.has(cacheKey)) {
      // 等待已经在进行的加载
      return new Promise((resolve, reject) => {
        this.once('dependency:loaded', (n, v) => {
          if (n === name && v === version) resolve()
        })
        this.once('dependency:error', (n, v, error) => {
          if (n === name && v === version) reject(error)
        })
      })
    }

    try {
      this.loading.add(cacheKey)
      this.emit('dependency:loading', name, version)

      // 检查缓存
      const cached = this.getFromCache(name, version)
      if (cached) {
        await this.evaluateModule(cached)
        this.emit('dependency:loaded', name, version)
        return
      }

      // 加载依赖
      const content = await this.fetchDependency(name, version, type)

      // 验证完整性
      if (this.options.checkIntegrity) {
        await this.verifyIntegrity(name, version, content)
      }

      // 缓存依赖
      this.addToCache(name, version, content)

      // 执行模块
      await this.evaluateModule(content)

      this.emit('dependency:loaded', name, version)
      this.logger.info(`Dependency loaded: ${name}@${version}`, undefined, {
        type,
      })
    } catch (error) {
      const e = error as Error
      this.emit('dependency:error', name, version, e)
      this.logger.error(
        `Failed to load dependency: ${name}@${version}`,
        undefined,
        e
      )
      throw e
    } finally {
      this.loading.delete(cacheKey)
    }
  }

  /**
   * 获取已解析的依赖
   */
  getResolved(name: string): DependencyResolution | undefined {
    return this.resolvedDeps.get(name)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  private async resolveSharedDependency(
    name: string,
    version: string
  ): Promise<DependencyResolution> {
    const cached = this.resolvedDeps.get(name)
    if (cached && cached.version === version) {
      return cached
    }

    const resolution: DependencyResolution = {
      name,
      version,
      resolved: `${this.options.cdnUrl}/${name}@${version}`,
      integrity: await this.fetchIntegrity(name, version),
    }

    this.resolvedDeps.set(name, resolution)
    return resolution
  }

  private async resolveDependency(
    name: string,
    version: string
  ): Promise<DependencyResolution> {
    const cached = this.resolvedDeps.get(name)
    if (cached && cached.version === version) {
      return cached
    }

    // 获取依赖信息
    const info = await this.fetchDependencyInfo(name, version)

    // 递归解析子依赖
    const dependencies: Record<string, DependencyResolution> = {}
    if (info.dependencies) {
      for (const [depName, depVersion] of Object.entries(info.dependencies)) {
        dependencies[depName] = await this.resolveDependency(
          depName,
          depVersion
        )
      }
    }

    const resolution: DependencyResolution = {
      name,
      version,
      resolved: `${this.options.cdnUrl}/${name}@${version}`,
      integrity: await this.fetchIntegrity(name, version),
      dependencies,
    }

    this.resolvedDeps.set(name, resolution)
    return resolution
  }

  private async resolveVersion(name: string, range: string): Promise<string> {
    // 从 npm registry 获取版本信息
    const response = await fetch(`https://registry.npmjs.org/${name}`)

    if (!response.ok) {
      throw new Error(`Failed to resolve version: ${response.statusText}`)
    }

    const data = await response.json()
    const versions = Object.keys(data.versions)
    const resolved = semver.maxSatisfying(versions, range)

    if (!resolved) {
      throw new Error(`No version found for ${name}@${range}`)
    }

    return resolved
  }

  private getFromCache(name: string, version: string): string | undefined {
    return this.cache.get(name)?.get(version)
  }

  private addToCache(name: string, version: string, content: string): void {
    if (!this.cache.has(name)) {
      this.cache.set(name, new Map())
    }
    this.cache.get(name)!.set(version, content)
  }

  private async fetchDependency(
    name: string,
    version: string,
    type: 'npm' | 'cdn' | 'local'
  ): Promise<string> {
    switch (type) {
      case 'npm':
        return this.fetchFromNpm(name, version)
      case 'cdn':
        return this.fetchFromCdn(name, version)
      case 'local':
        if (!this.options.allowLocal) {
          throw new Error('Local dependencies are not allowed')
        }
        return this.fetchFromLocal(name, version)
      default:
        throw new Error(`Unsupported dependency type: ${type}`)
    }
  }

  private async fetchFromNpm(name: string, version: string): Promise<string> {
    const response = await fetch(
      `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch from npm: ${response.statusText}`)
    }
    // TODO: 解包 tgz 并返回入口文件内容
    return ''
  }

  private async fetchFromCdn(name: string, version: string): Promise<string> {
    const response = await fetch(`${this.options.cdnUrl}/${name}@${version}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch from CDN: ${response.statusText}`)
    }
    return response.text()
  }

  private async fetchFromLocal(name: string, version: string): Promise<string> {
    const response = await fetch(`/local-deps/${name}/${version}/index.js`)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch local dependency: ${response.statusText}`
      )
    }
    return response.text()
  }

  private async fetchDependencyInfo(
    name: string,
    version: string
  ): Promise<{ dependencies?: Record<string, string> }> {
    const response = await fetch(
      `https://registry.npmjs.org/${name}/${version}`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch dependency info: ${response.statusText}`)
    }
    return response.json()
  }

  private async fetchIntegrity(name: string, version: string): Promise<string> {
    const response = await fetch(
      `${this.options.cdnUrl}/${name}@${version}.sri`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch integrity: ${response.statusText}`)
    }
    return response.text()
  }

  private async verifyIntegrity(
    name: string,
    version: string,
    content: string
  ): Promise<void> {
    const integrity = await this.fetchIntegrity(name, version)
    const [algorithm, expected] = integrity.split('-')

    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest(algorithm as any, data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const actual = btoa(String.fromCharCode(...hashArray))

    if (actual !== expected) {
      throw new Error('Integrity check failed')
    }
  }

  private async evaluateModule(content: string): Promise<void> {
    const blob = new Blob([content], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    try {
      await import(url)
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}
