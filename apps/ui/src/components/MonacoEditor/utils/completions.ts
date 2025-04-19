import * as monaco from 'monaco-editor'

interface CompletionItem {
  label: string;
  kind: monaco.languages.CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
}

interface SignatureInfo {
  label: string;
  documentation: string;
  parameters: Array<{
    label: string;
    documentation: string;
  }>;
}

type SignatureMap = {
  [key in 'getComponentData' | 'updateComponentData' | 'reloadDataSource' | 'showMessage']: SignatureInfo;
};

export function registerCompletions(suggestions: CompletionItem[]) {
  // 注册代码补全提供者
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      // 补全建议列表
      const completions = suggestions.map(suggestion => ({
        ...suggestion,
        range,
        insertText: suggestion.insertText || suggestion.label,
        // 添加代码片段支持
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      }));

      // 添加内置 API 的代码片段
      const snippets = [
        {
          label: 'getComponentData',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: '获取组件数据',
          insertText: 'const data = await getComponentData(${1:componentId});',
          documentation: '异步获取指定组件的数据',
          range
        },
        {
          label: 'updateComponentData',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: '更新组件数据',
          insertText: 'await updateComponentData(${1:componentId}, {\n\t${2:key}: ${3:value}\n});',
          documentation: '异步更新指定组件的数据',
          range
        },
        {
          label: 'reloadDataSource',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: '重新加载数据源',
          insertText: 'await reloadDataSource(${1:sourceId}, {\n\t${2:param}: ${3:value}\n});',
          documentation: '异步重新加载指定数据源的数据',
          range
        },
        {
          label: 'showMessage',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: '显示消息提示',
          insertText: 'showMessage(${1|"success","error","info","warning"|}, "${2:message}");',
          documentation: '显示消息提示框',
          range
        }
      ];

      return {
        suggestions: [...completions, ...snippets]
      };
    }
  });

  // 注册参数提示
  monaco.languages.registerSignatureHelpProvider('javascript', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp(model, position) {
      // 获取当前行内容
      const lineContent = model.getLineContent(position.lineNumber);
      const word = model.getWordUntilPosition(position);

      // 根据函数名提供参数提示
      const signatures: SignatureMap = {
        getComponentData: {
          label: 'getComponentData(componentId: string): Promise<ComponentData>',
          documentation: '获取指定组件的数据',
          parameters: [{
            label: 'componentId',
            documentation: '组件的唯一标识'
          }]
        },
        updateComponentData: {
          label: 'updateComponentData(componentId: string, data: Partial<ComponentData>): Promise<void>',
          documentation: '更新指定组件的数据',
          parameters: [{
            label: 'componentId',
            documentation: '组件的唯一标识'
          }, {
            label: 'data',
            documentation: '要更新的数据对象'
          }]
        },
        reloadDataSource: {
          label: 'reloadDataSource(sourceId: string, params?: Record<string, any>): Promise<void>',
          documentation: '重新加载指定数据源的数据',
          parameters: [{
            label: 'sourceId',
            documentation: '数据源的唯一标识'
          }, {
            label: 'params',
            documentation: '可选的查询参数'
          }]
        },
        showMessage: {
          label: 'showMessage(type: "success" | "error" | "info" | "warning", content: string): void',
          documentation: '显示消息提示框',
          parameters: [{
            label: 'type',
            documentation: '消息类型'
          }, {
            label: 'content',
            documentation: '消息内容'
          }]
        }
      };

      // 查找当前正在调用的函数
      const functionNames = Object.keys(signatures) as Array<keyof SignatureMap>;
      const currentFunction = functionNames.find(name => lineContent.includes(`${name}(`));

      if (currentFunction) {
        return {
          value: {
            activeSignature: 0,
            activeParameter: lineContent.substring(0, position.column).split(',').length - 1,
            signatures: [{
              label: signatures[currentFunction].label,
              documentation: signatures[currentFunction].documentation,
              parameters: signatures[currentFunction].parameters
            }]
          },
          dispose() {}
        };
      }

      return null;
    }
  });
}