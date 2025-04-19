# Monaco Editor 组件

一个基于 Monaco Editor 的代码编辑器组件，支持语法高亮、代码提示、格式化等功能。

## 特性

- ✨ 支持多种编程语言
- 🎨 明暗主题切换
- 📝 代码格式化
- ⌨️ 快捷键支持
- 🔄 自动保存
- 🚦 加载状态
- ⚠️ 错误提示

## 安装

```bash
pnpm add monaco-editor
```

## 使用示例

```vue
<template>
  <MonacoEditor
    v-model:value="code"
    language="javascript"
    theme="vs-dark"
    :options="editorOptions"
    @change="handleChange"
    @ready="handleReady"
  />
</template>

<script setup>
import { ref } from 'vue'
import MonacoEditor from '@/components/MonacoEditor'

const code = ref('console.log("Hello World!");')

const editorOptions = {
  fontSize: 14,
  tabSize: 2,
  minimap: { enabled: false }
}

const handleChange = (value) => {
  console.log('代码变更:', value)
}

const handleReady = (editor) => {
  console.log('编辑器就绪:', editor)
}
</script>
```

## 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|---------|------|
| value | string | '' | 编辑器内容 |
| language | string | 'javascript' | 编程语言 |
| theme | string | 'vs-dark' | 编辑器主题 |
| options | object | {} | 编辑器配置项 |
| width | string/number | '100%' | 编辑器宽度 |
| height | string/number | '300px' | 编辑器高度 |

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:value | (value: string) | 内容更新时触发 |
| change | (value: string) | 内容变化时触发 |
| ready | (editor: IStandaloneCodeEditor) | 编辑器就绪时触发 |

## 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getEditor | - | IStandaloneCodeEditor | 获取编辑器实例 |
| formatCode | - | Promise\<void\> | 格式化代码 |
| updateLayout | - | void | 更新编辑器布局 |

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + F | 格式化代码 |

## 主题

组件支持两种主题：

- 亮色主题：`vs`
- 暗色主题：`vs-dark`

可以通过 CSS 变量自定义主题颜色：

```css
[data-theme="light"] .monaco-editor-container {
  --editor-background: #ffffff;
  --editor-foreground: #000000;
  /* 其他变量... */
}
```

## 注意事项

1. 组件会自动处理编辑器的创建和销毁
2. 编辑器实例可以通过 `getEditor` 方法获取
3. 建议设置合适的容器高度
4. 如果需要在布局变化时更新编辑器，调用 `updateLayout`

## 开发计划

- [ ] 添加更多语言支持
- [ ] 改进代码提示功能
- [ ] 添加搜索/替换功能
- [ ] 支持更多自定义主题
- [ ] 添加文件操作功能