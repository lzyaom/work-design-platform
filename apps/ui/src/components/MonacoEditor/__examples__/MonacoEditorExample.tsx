import { defineComponent, ref } from 'vue'
import MonacoEditor from '../index'
import type { MonacoEditorExpose } from '../types'

export default defineComponent({
  name: 'MonacoEditorExample',

  setup() {
    // 代码示例
    const basicCode = ref(`// 基础示例
function greeting(name: string) {
  return \`Hello, \${name}!\`
}

console.log(greeting('World'))`)

    const jsonCode = ref(`{
  "name": "monaco-editor",
  "version": "1.0.0",
  "description": "代码编辑器组件",
  "author": "Roo"
}`)

    const htmlCode = ref(`<!DOCTYPE html>
<html>
<head>
  <title>Monaco Editor Example</title>
</head>
<body>
  <div id="editor"></div>
</body>
</html>`)

    // 编辑器配置
    const basicOptions = {
      fontSize: 14,
      tabSize: 2,
      minimap: { enabled: false },
      scrollBeyondLastLine: false
    }

    const jsonOptions = {
      ...basicOptions,
      formatOnPaste: true,
      formatOnType: true
    }

    const editorRef = ref<MonacoEditorExpose>()

    // 事件处理
    const handleBasicChange = (value: string) => {
      console.log('基础示例代码变更:', value)
    }

    const handleEditorReady = (editor: any) => {
      console.log('编辑器就绪:', editor)
    }

    const handleFormatClick = async () => {
      await editorRef.value?.formatCode()
    }

    return () => (
      <div class="editor-examples">
        <section class="example-section">
          <h2>基础用法</h2>
          <p>TypeScript 代码编辑器，支持语法高亮和类型检查</p>
          <div class="editor-container">
            <MonacoEditor
              ref={editorRef}
              value={basicCode.value}
              language="typescript"
              theme="vs-dark"
              options={basicOptions}
              onChange={handleBasicChange}
              onReady={handleEditorReady}
            />
          </div>
          <div class="editor-actions">
            <button onClick={handleFormatClick}>格式化代码</button>
          </div>
        </section>

        <section class="example-section">
          <h2>JSON 编辑器</h2>
          <p>JSON 编辑器，支持自动格式化</p>
          <div class="editor-container">
            <MonacoEditor
              value={jsonCode.value}
              language="json"
              theme="vs"
              options={jsonOptions}
            />
          </div>
        </section>

        <section class="example-section">
          <h2>HTML 编辑器</h2>
          <p>HTML 编辑器，支持语法高亮和自动补全</p>
          <div class="editor-container">
            <MonacoEditor
              value={htmlCode.value}
              language="html"
              theme="vs-dark"
              options={basicOptions}
            />
          </div>
        </section>

        <style>
          {`
          .editor-examples {
            padding: 20px;
          }

          .example-section {
            margin-bottom: 40px;
          }

          .example-section h2 {
            margin: 0 0 8px;
            font-size: 18px;
            font-weight: 600;
          }

          .example-section p {
            margin: 0 0 16px;
            color: #666;
          }

          .editor-container {
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
          }

          .editor-actions {
            margin-top: 8px;
            display: flex;
            gap: 8px;
          }

          .editor-actions button {
            padding: 4px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
            cursor: pointer;
            transition: all 0.2s;
          }

          .editor-actions button:hover {
            background: #f5f5f5;
          }

          [data-theme="dark"] .editor-actions button {
            background: #1e1e1e;
            border-color: #404040;
            color: #d4d4d4;
          }

          [data-theme="dark"] .editor-actions button:hover {
            background: #2c2c2d;
          }
          `}
        </style>
      </div>
    )
  }
})