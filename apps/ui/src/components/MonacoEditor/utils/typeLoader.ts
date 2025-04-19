import * as monaco from 'monaco-editor'

// 内置API的类型定义
const apiTypes = `
interface ComponentData {
  props?: Record<string, any>;
  style?: Record<string, any>;
  data?: Record<string, any>;
}

interface DataSource {
  id: string;
  type: 'api' | 'static' | 'component';
  config: Record<string, any>;
}

interface EventContext {
  component: ComponentData;
  dataSource?: DataSource;
  event: Event;
}

// 内置函数定义
declare function getComponentData(id: string): Promise<ComponentData>;
declare function updateComponentData(id: string, data: Partial<ComponentData>): Promise<void>;
declare function reloadDataSource(id: string, params?: Record<string, any>): Promise<void>;
declare function showMessage(type: 'success' | 'error' | 'info' | 'warning', content: string): void;
`

export async function loadTypes() {
  // 添加类型定义
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    apiTypes,
    'ts:api-types.d.ts'
  )

  // 配置 JavaScript 语言选项
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowJs: true,
    typeRoots: ['node_modules/@types']
  })
}