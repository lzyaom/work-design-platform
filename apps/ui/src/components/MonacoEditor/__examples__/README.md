# Monaco Editor 组件使用指南

## 快速开始

安装依赖：
```bash
pnpm add monaco-editor
```

基础用法：
```vue
<template>
  <MonacoEditor
    v-model="code"
    language="javascript"
    theme="vs-dark"
  />
</template>

<script setup>
import { ref } from 'vue'
import MonacoEditor from '@/components/MonacoEditor'

const code = ref('console.log("Hello World!")')
</script>
```

## 功能特性

- ✨ 语法高亮：支持多种编程语言
- 🎨 主题切换：内置亮色和暗色主题
- 📝 代码格式化：支持快捷键和工具栏按钮
- ⌨️ 智能提示：类型检查和代码补全
- 🔄 实时预览：即时反馈代码更改
- 🎯 错误提示：清晰的错误信息展示

## 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|---------|------|
| modelValue | string | '' | 编辑器内容 |
| language | string | 'javascript' | 编程语言 |
| theme | string | 'vs-dark' | 主题样式 |
| options | object | {} | 编辑器配置 |
| width | string/number | '100%' | 宽度 |
| height | string/number | '300px' | 高度 |
| readonly | boolean | false | 只读模式 |

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: string) | 内容更新 |
| change | (value: string) | 内容变化 |
| ready | (editor: IStandaloneCodeEditor) | 编辑器就绪 |
| focus | - | 获得焦点 |
| blur | - | 失去焦点 |

## 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getEditor | - | IStandaloneCodeEditor | 获取编辑器实例 |
| formatCode | - | Promise\<void\> | 格式化代码 |
| updateLayout | - | void | 更新布局 |
| undo | - | void | 撤销操作 |
| redo | - | void | 重做操作 |

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + Shift + F | 格式化代码 |
| Ctrl/Cmd + Z | 撤销 |
| Ctrl/Cmd + Shift + Z | 重做 |

## 高级用法

### 1. 自定义配置

```vue
<template>
  <MonacoEditor
    v-model="code"
    language="typescript"
    :options="{
      fontSize: 14,
      tabSize: 2,
      minimap: { enabled: false },
      formatOnPaste: true,
      formatOnType: true
    }"
  />
</template>
```

### 2. 实例方法调用

```vue
<template>
  <MonacoEditor ref="editor" v-model="code" />
  <button @click="handleFormat">格式化</button>
</template>

<script setup>
import { ref } from 'vue'
import type { MonacoEditorExpose } from './types'

const editor = ref<MonacoEditorExpose>()
const code = ref('')

const handleFormat = async () => {
  await editor.value?.formatCode()
}
</script>
```

### 3. 错误处理

组件内置了错误处理和提示机制：
- 格式化失败提示
- 初始化错误处理
- 加载状态展示

### 4. 主题定制

可以通过 CSS 变量自定义主题：

```css
[data-theme="light"] .monaco-editor-container {
  --editor-background: #ffffff;
  --editor-foreground: #000000;
  --editor-toolbar-background: #f5f5f5;
  /* 其他变量... */
}
```

## 最佳实践

1. 总是设置合适的容器高度
2. 考虑使用节流或防抖处理频繁更新
3. 在组件销毁时确保清理资源
4. 使用 v-model 进行双向绑定
5. 适当配置编辑器选项提升性能

## 常见问题

Q: 如何处理编辑器的自适应高度？  
A: 使用 updateLayout 方法在容器大小变化时更新布局。

Q: 如何集成自定义语言？  
A: 通过 Monaco 的 languages API 注册新语言。

Q: 如何优化大文件的性能？  
A: 可以禁用不必要的特性，如小地图、行号等。

## 开发计划

- [ ] 添加更多语言支持
- [ ] 改进代码提示功能
- [ ] 添加搜索/替换功能
- [ ] 支持更多自定义主题
- [ ] 添加文件操作功能

## 贡献指南

欢迎提交 Issue 和 Pull Request。在提交之前，请：

1. 确保代码通过所有测试
2. 遵循项目的代码规范
3. 更新相关文档
4. 添加必要的测试用例