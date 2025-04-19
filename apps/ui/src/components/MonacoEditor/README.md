# Monaco Editor 组件

一个基于 Monaco Editor 的 Vue 3 编辑器组件，支持主题切换、代码高亮和智能提示等功能。

## 功能特点

- ✨ 完整的 Monaco Editor 功能支持
- 🎨 丰富的主题切换和预览
- 🚀 平滑的主题切换动画
- ♿ 完整的无障碍支持
- 🔧 高度可配置
- 📦 开箱即用

## 安装

```bash
pnpm add monaco-editor
```

## 基础使用

```vue
<template>
  <MonacoEditor
    v-model="code"
    language="typescript"
    theme="vs-dark"
    :height="500"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MonacoEditor from '@/components/MonacoEditor'

const code = ref('console.log("Hello, World!");')
</script>
```

## 组件 Props

### MonacoEditor 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | string | - | 编辑器内容（支持 v-model） |
| language | string | 'javascript' | 编程语言 |
| theme | EditorTheme | 'vs-dark' | 编辑器主题 |
| options | EditorOptions | {} | 编辑器配置选项 |
| width | number \| string | '100%' | 编辑器宽度 |
| height | number \| string | '300px' | 编辑器高度 |
| readonly | boolean | false | 是否只读 |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: string) | 内容更新时触发 |
| change | (value: string) | 内容变化时触发 |
| ready | (editor: IStandaloneCodeEditor) | 编辑器初始化完成时触发 |
| focus | - | 获得焦点时触发 |
| blur | - | 失去焦点时触发 |
| scroll | (event: EditorScrollEvent) | 滚动时触发 |
| error | (error: Error) | 发生错误时触发 |
| format | (success: boolean) | 格式化代码后触发 |

### 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getEditor | - | IStandaloneCodeEditor | 获取编辑器实例 |
| formatCode | - | Promise\<void\> | 格式化代码 |
| updateLayout | - | void | 更新编辑器布局 |
| undo | - | void | 撤销操作 |
| redo | - | void | 重做操作 |
| getSelection | - | string \| undefined | 获取选中的文本 |
| setSelection | (start: IPosition, end: IPosition) | void | 设置选中区域 |
| insertText | (text: string) | void | 插入文本 |
| replaceSelection | (text: string) | void | 替换选中的文本 |
| revealPosition | (position: IPosition) | void | 滚动到指定位置 |
| revealLine | (lineNumber: number) | void | 滚动到指定行 |

## 主题配置

### 内置主题

- vs（浅色）
- vs-dark（深色）
- hc-black（高对比度）
- github-light
- github-dark
- monokai
- dracula
- solarized-light
- solarized-dark

### 使用主题预览

```vue
<template>
  <ThemePreview
    v-model="currentTheme"
    placement="bottom"
    :show-preview="true"
    :auto-carousel="true"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThemePreview } from '@/components/MonacoEditor'
import type { EditorTheme } from '@/components/MonacoEditor'

const currentTheme = ref<EditorTheme>('vs-dark')
</script>
```

### 自定义主题

```typescript
import { themeManager } from '@/components/MonacoEditor'

// 注册自定义主题
themeManager.defineTheme('my-theme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6a737d' },
    { token: 'keyword', foreground: 'd73a49' },
    // ...
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#24292e',
    // ...
  }
})

// 使用自定义主题
themeManager.setTheme('my-theme')
```

## 性能优化

### 1. 编辑器配置优化

```typescript
const editorOptions = {
  // 禁用小地图
  minimap: { enabled: false },
  
  // 减少渲染范围
  renderValidationDecorations: 'editable',
  
  // 延迟加载
  renderWhitespace: 'none',
  quickSuggestions: false,
  
  // 减少重新渲染
  scrollBeyondLastLine: false,
  
  // 优化滚动性能
  smoothScrolling: false,
  fastScrollSensitivity: 5
}
```

### 2. 动态加载优化

```typescript
// 按需加载语言
import('monaco-editor/esm/vs/language/typescript/typescript.worker')
import('monaco-editor/esm/vs/language/json/json.worker')

// 预加载主题
themeManager.preloadThemes()
```

### 3. 内存优化

```typescript
// 及时销毁
onBeforeUnmount(() => {
  editor.getModel()?.dispose()
  editor.dispose()
})

// 限制历史记录
editor.getModel()?.setMaxLineCount(1000)
```

## 无障碍支持

- 完整的键盘导航支持
- ARIA 标签和角色
- 高对比度主题
- 支持屏幕阅读器
- 自适应字体大小

## 示例

### 1. 基础编辑器

```vue
<template>
  <MonacoEditor
    v-model="code"
    language="typescript"
    theme="vs-dark"
    :height="500"
    :options="editorOptions"
    @ready="onEditorReady"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MonacoEditor } from '@/components/MonacoEditor'
import type { IStandaloneCodeEditor } from 'monaco-editor'

const code = ref(`function hello(): string {
  return "Hello, World!";
}`)

const editorOptions = {
  fontSize: 14,
  tabSize: 2,
  minimap: { enabled: false }
}

const onEditorReady = (editor: IStandaloneCodeEditor) => {
  console.log('编辑器已准备就绪')
}

const onChange = (value: string) => {
  console.log('内容已更新:', value)
}
</script>
```

### 2. 差异对比

```vue
<template>
  <div class="diff-container">
    <MonacoEditor
      ref="originalEditor"
      v-model="originalCode"
      language="javascript"
      theme="github-light"
      :height="500"
      :readonly="true"
    />
    <MonacoEditor
      ref="modifiedEditor"
      v-model="modifiedCode"
      language="typescript"
      theme="github-light"
      :height="500"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MonacoEditor } from '@/components/MonacoEditor'

const originalCode = ref(`function hello() {
  return "Hello";
}`)

const modifiedCode = ref(`function hello(): string {
  return "Hello, World!";
}`)
</script>

<style scoped>
.diff-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  border: 1px solid #eee;
}
</style>
```

## 常见问题

### 1. 编辑器加载失败

确保正确配置了 Monaco Editor 的 worker：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      languageWorkers: ['typescript', 'javascript', 'json']
    })
  ]
})
```

### 2. 主题切换闪烁

使用 ThemeTransition 组件包裹：

```vue
<template>
  <ThemeTransition>
    <MonacoEditor ... />
  </ThemeTransition>
</template>
```

### 3. 性能问题

- 使用建议的性能优化配置
- 避免频繁更新模型
- 合理使用 debounce/throttle
- 必要时使用虚拟滚动

## 贡献指南

1. Fork 本仓库
2. 创建功能分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## License

MIT License