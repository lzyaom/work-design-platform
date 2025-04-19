import { defineComponent, ref, onMounted } from 'vue'
import MonacoEditor from '../index'
import type { MonacoEditorExpose } from '../types'
import * as monaco from 'monaco-editor'

// TypeScript 示例代码
const initialCode = `interface User {
  id: number;
  name: string;
  age?: number;
  email: string;
}

class UserService {
  private users: User[] = [];

  constructor() {
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user);
  }

  findUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

// 创建服务实例
const userService = new UserService();

// 添加用户
userService.addUser({
  id: 1,
  name: "John Doe",
  age: 30,
  email: "john@example.com"
});

// 查找用户
const user = userService.`

export default defineComponent({
  name: 'LanguageServerExample',
  
  setup() {
    const editorRef = ref<MonacoEditorExpose>()
    const code = ref(initialCode)
    
    // 配置 TypeScript 语言服务
    const configureTypeScript = () => {
      // 添加类型定义
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false
      })

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ['node_modules/@types'],
        lib: ['es2015', 'dom']
      })

      // 添加自定义类型提示
      monaco.languages.registerCompletionItemProvider('typescript', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          }

          const suggestions = [
            {
              label: 'findUserByEmail',
              kind: monaco.languages.CompletionItemKind.Method,
              documentation: '通过邮箱查找用户',
              insertText: 'findUserByEmail(email: string): User | undefined {\n\treturn this.users.find(u => u.email === email);\n}',
              range
            },
            {
              label: 'updateUser',
              kind: monaco.languages.CompletionItemKind.Method,
              documentation: '更新用户信息',
              insertText: 'updateUser(id: number, data: Partial<User>): void {\n\tconst user = this.findUserById(id);\n\tif (user) {\n\t\tObject.assign(user, data);\n\t}\n}',
              range
            },
            {
              label: 'deleteUser',
              kind: monaco.languages.CompletionItemKind.Method,
              documentation: '删除用户',
              insertText: 'deleteUser(id: number): void {\n\tthis.users = this.users.filter(u => u.id !== id);\n}',
              range
            }
          ]

          return { suggestions }
        }
      })
    }

    onMounted(() => {
      configureTypeScript()
    })

    return () => (
      <div class="language-server-example">
        <h2>TypeScript 语言服务示例</h2>
        <p class="description">
          这个示例展示了如何配置 TypeScript 语言服务，包括类型检查、代码补全和智能提示。
          <br />
          试试在最后一行输入 <code>userService.</code> 来查看智能提示！
        </p>
        <div class="editor-container">
          <MonacoEditor
            ref={editorRef}
            v-model={code.value}
            language="typescript"
            theme="vs-dark"
            options={{
              fontSize: 14,
              suggestOnTriggerCharacters: true,
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              wordBasedSuggestions: 'matchingDocuments',
              acceptSuggestionOnCommitCharacter: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on'
            }}
            height="500px"
          />
        </div>
        <style>
          {`
          .language-server-example {
            padding: 20px;
          }

          .description {
            margin: 16px 0;
            color: #666;
            line-height: 1.6;
          }

          .description code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            color: #d32f2f;
          }

          .editor-container {
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
          }

          [data-theme="dark"] .description code {
            background: #333;
            color: #ff4081;
          }
          `}
        </style>
      </div>
    )
  }
})