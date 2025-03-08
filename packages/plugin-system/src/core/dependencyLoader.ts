import { Logger } from './logger'

export interface DependencyInfo {
  name: string
  version: string
  type: 'npm' | 'umd' | 'esm'
  url?: string
  integrity?: string
}

export interface DependencyResolution {
  name: string
  version: string
  url: string
  integrity: string
  dependencies?: DependencyResolution[]
}

export class DependencyLoader {
  private loadedDependencies: Map<string, DependencyResolution>
  private loading: Set<string>
  private logger: Logger

  constructor(logger: Logger) {
    this.loadedDependencies = new Map()
    this.loading = new Set()
    this.logger = logger
  }

  /**
   * 加载依赖
   */
  async loadDependency(info: DependencyInfo): Promise<void> {
    const key = `${info.name}@${info.version}`
    if (this.loadedDependencies.has(key)) {
      return
    }

    if (this.loading.has(key)) {
      await this.waitForLoading(key)
      return
    }

    try {
      this.loading.add(key)
      const resolution = await this.resolveDependency(info)
      
      // 加载子依赖
      if (resolution.dependencies) {
        await Promise.all(
          resolution.dependencies.map(dep =>
            this.loadDependency({
              name: dep.name,
              version: dep.version,
              type: 'npm'
            })
          )
        )
      }

      // 加载主依赖
      await this.injectDependency(resolution)
      
      this.loadedDependencies.set(key, resolution)
      this.logger.info(`Dependency loaded: ${key}`)
    } catch (error) {
      this.logger.error(
        `Failed to load dependency: ${key}`,
        undefined,
        error as Error
      )
      throw error
    } finally {
      this.loading.delete(key)
    }
  }

  /**
   * 检查依赖是否已加载
   */
  isDependencyLoaded(name: string, version: string): boolean {
    return this.loadedDependencies.has(`${name}@${version}`)
  }

  /**
   * 获取已加载的依赖
   */
  getLoadedDependencies(): Map<string, DependencyResolution> {
    return new Map(this.loadedDependencies)
  }

  /**
   * 卸载依赖
   */
  unloadDependency(name: string, version: string): void {
    const key = `${name}@${version}`
    if (!this.loadedDependencies.has(key)) {
      return
    }

    // 移除相关的 script 标签
    const scriptId = this.getScriptId(key)
    const script = document.getElementById(scriptId)
    if (script) {
      script.remove()
    }

    this.loadedDependencies.delete(key)
    this.logger.info(`Dependency unloaded: ${key}`)
  }

  private async resolveDependency(info: DependencyInfo): Promise<DependencyResolution> {
    switch (info.type) {
      case 'npm':
        return this.resolveNpmDependency(info)
      case 'umd':
      case 'esm':
        return this.resolveUrlDependency(info)
      default:
        throw new Error(`Unsupported dependency type: ${info.type}`)
    }
  }

  private async resolveNpmDependency(
    info: DependencyInfo
  ): Promise<DependencyResolution> {
    // 从 npm registry 获取包信息
    const response = await fetch(
      `https://registry.npmjs.org/${info.name}/${info.version}`
    )
    
    if (!response.ok) {
      throw new Error(`Failed to resolve npm dependency: ${response.statusText}`)
    }

    const data = await response.json()
    const cdnUrl = `https://cdn.jsdelivr.net/npm/${info.name}@${info.version}`
    
    // 获取完整性哈希
    const integrityResponse = await fetch(`${cdnUrl}.sri`)
    const integrity = await integrityResponse.text()

    return {
      name: info.name,
      version: info.version,
      url: cdnUrl,
      integrity,
      dependencies: Object.entries(data.dependencies || {}).map(
        ([name, version]) => ({
          name,
          version: version as string,
          url: `https://cdn.jsdelivr.net/npm/${name}@${version}`,
          integrity: '' // 需要单独获取
        })
      )
    }
  }

  private async resolveUrlDependency(
    info: DependencyInfo
  ): Promise<DependencyResolution> {
    if (!info.url) {
      throw new Error('URL is required for UMD/ESM dependencies')
    }

    return {
      name: info.name,
      version: info.version,
      url: info.url,
      integrity: info.integrity || ''
    }
  }

  private async injectDependency(
    resolution: DependencyResolution
  ): Promise<void> {
    const scriptId = this.getScriptId(`${resolution.name}@${resolution.version}`)
    
    // 检查是否已注入
    if (document.getElementById(scriptId)) {
      return
    }

    // 创建 script 标签
    const script = document.createElement('script')
    script.id = scriptId
    script.src = resolution.url
    
    if (resolution.integrity) {
      script.integrity = resolution.integrity
      script.crossOrigin = 'anonymous'
    }

    // 等待加载完成
    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve()
      script.onerror = (error) => reject(error)
      document.head.appendChild(script)
    })
  }

  private getScriptId(key: string): string {
    return `dependency-${key.replace(/[@/]/g, '-')}`
  }

  private async waitForLoading(key: string): Promise<void> {
    while (this.loading.has(key)) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}