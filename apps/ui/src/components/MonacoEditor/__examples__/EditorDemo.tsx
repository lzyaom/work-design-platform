import { defineComponent, ref } from 'vue'
import MonacoEditor from '../index'
import type { MonacoEditorExpose } from '../types'

const defaultJavaScript = `// 编辑器示例
function greeting(name) {
  return \`Hello, \${name}!\`
}

// 未格式化的代码
const user={name:"World",     age:   18};

// 使用模板字符串
console.log(greeting(user.name))
`

const defaultJSON = `{
  "name": "monaco-editor",
  "version": "1.0.0",
  "description": "代码编辑器组件",
  "features": [
    "语法高亮",
    "代码格式化",
    "智能提示",
    "主题切换"
  ]
}`

const defaultHTML = `<!DOCTYPE html>
<html>
  <head>
    <title>Monaco Editor Example</title>
    <style>
      body {
        margin: 0;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <div id="editor"></div>
    <script>
      // 初始化编辑器
      const editor = monaco.editor.create(
        document.getElementById('editor'),
        { language: 'javascript' }
      )
    </script>
  </body>
</html>`

export default defineComponent({
  name: 'EditorDemo',

  setup() {
    const jsEditor = ref<MonacoEditorExpose>()
    const jsonEditor = ref<MonacoEditorExpose>()
    const htmlEditor = ref<MonacoEditorExpose>()
    const jsCode = ref(defaultJavaScript)
    const jsonCode = ref(defaultJSON)
    const htmlCode = ref(defaultHTML)
    const isDarkTheme = ref(true)

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value
    }

    const handleEditorReady = (editor: any) => {
      console.log('编辑器就绪:', editor)
    }

    return () => (
      <div class="editor-demo">
        <div class="demo-header">
          <h1>Monaco Editor 示例</h1>
          <button
            class="theme-toggle"
            onClick={toggleTheme}
            title={isDarkTheme.value ? '切换到亮色主题' : '切换到暗色主题'}
          >
            <i class={`theme-icon ${isDarkTheme.value ? 'theme-icon-light' : 'theme-icon-dark'}`} />
            {isDarkTheme.value ? '亮色主题' : '暗色主题'}
          </button>
        </div>

        <div class="demo-section">
          <h2>JavaScript 编辑器</h2>
          <p>支持语法高亮、代码格式化和智能提示</p>
          <div class="editor-container">
            <MonacoEditor
              ref={jsEditor}
              v-model={jsCode.value}
              language="javascript"
              theme={isDarkTheme.value ? 'vs-dark' : 'vs'}
              height="200px"
              onReady={handleEditorReady}
            />
          </div>
        </div>

        <div class="demo-section">
          <h2>JSON 编辑器</h2>
          <p>支持自动格式化和错误检查</p>
          <div class="editor-container">
            <MonacoEditor
              ref={jsonEditor}
              v-model={jsonCode.value}
              language="json"
              theme={isDarkTheme.value ? 'vs-dark' : 'vs'}
              height="200px"
              readonly={false}
            />
          </div>
        </div>

        <div class="demo-section">
          <h2>HTML 编辑器</h2>
          <p>支持 HTML、CSS 和 JavaScript 混合编辑</p>
          <div class="editor-container">
            <MonacoEditor
              ref={htmlEditor}
              v-model={htmlCode.value}
              language="html"
              theme={isDarkTheme.value ? 'vs-dark' : 'vs'}
              height="200px"
            />
          </div>
        </div>

        <style>
          {`
          .editor-demo {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .demo-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 32px;
          }

          .demo-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }

          .theme-toggle {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--editor-toolbar-background);
            color: var(--editor-foreground);
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .theme-toggle:hover {
            background: var(--editor-toolbar-hover);
          }

          .theme-icon {
            width: 16px;
            height: 16px;
            background-size: contain;
          }

          .theme-icon-light {
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23d4d4d4" d="M8 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 1a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/></svg>');
          }

          .theme-icon-dark {
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23424242" d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8z"/></svg>');
          }

          .demo-section {
            margin-bottom: 40px;
          }

          .demo-section h2 {
            margin: 0 0 8px;
            font-size: 18px;
            font-weight: 600;
          }

          .demo-section p {
            margin: 0 0 16px;
            color: #666;
          }

          .editor-container {
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
            overflow: hidden;
          }

          @media (max-width: 640px) {
            .editor-demo {
              padding: 16px;
            }

            .demo-header h1 {
              font-size: 20px;
            }

            .theme-toggle {
              padding: 6px 12px;
              font-size: 12px;
            }
          }
          `}
        </style>
      </div>
    )
  }
})