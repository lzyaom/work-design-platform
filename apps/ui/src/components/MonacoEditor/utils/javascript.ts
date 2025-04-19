import * as monaco from 'monaco-editor'

export function configureJavaScript() {
  // 配置 JavaScript 语言选项
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [1005] // 忽略"无法找到名称"的错误
  })

  // 配置编译选项
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: true,
    strict: true,
    noImplicitAny: false,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    typeRoots: ['node_modules/@types']
  })

  // 注册格式化器
  monaco.languages.registerDocumentFormattingEditProvider('javascript', {
    async provideDocumentFormattingEdits(model) {
      const text = model.getValue()
      // 简单的格式化规则
      const formatted = text
        .replace(/{\s*/g, '{\n  ') // 在 { 后添加换行和缩进
        .replace(/;\s*/g, ';\n')   // 在 ; 后添加换行
        .replace(/}\s*/g, '\n}')   // 在 } 前添加换行
        .replace(/,\s*/g, ', ')    // 在 , 后添加空格
        .replace(/\s*=\s*/g, ' = ') // 在 = 前后添加空格
        .replace(/\n\s*\n/g, '\n') // 移除多余的空行

      return [{
        range: model.getFullModelRange(),
        text: formatted
      }]
    }
  })

  // 配置语言特性
  monaco.languages.setLanguageConfiguration('javascript', {
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    
    // 配置注释
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },

    // 配置括号
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],

    // 配置自动闭合
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
      { open: '"', close: '"', notIn: ['string'] },
      { open: '`', close: '`', notIn: ['string', 'comment'] }
    ],

    // 配置包围选择
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: "'", close: "'" },
      { open: '"', close: '"' },
      { open: '`', close: '`' }
    ],

    // 配置折叠规则
    folding: {
      markers: {
        start: new RegExp('^\\s*//\\s*#?region\\b'),
        end: new RegExp('^\\s*//\\s*#?endregion\\b')
      }
    }
  })

  // 添加语言标记规则
  monaco.languages.setMonarchTokensProvider('javascript', {
    defaultToken: 'invalid',
    tokenPostfix: '.js',

    keywords: [
      'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
      'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
      'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new',
      'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
      'typeof', 'var', 'void', 'while', 'with', 'yield', 'async', 'await',
      'of'
    ],

    operators: [
      '<=', '>=', '==', '!=', '===', '!==', '=>', '+', '-', '**',
      '*', '/', '%', '++', '--', '<<', '</', '>>', '>>>', '&',
      '|', '^', '!', '~', '&&', '||', '?', ':', '=', '+=', '-=',
      '*=', '**=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '|=',
      '^=', '@',
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        [/[{}]/, 'delimiter.bracket'],
        { include: 'common' }
      ],

      common: [
        // 标识符和关键字
        [/[a-z_$][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],

        // 空白
        [/[ \t\r\n]+/, 'white'],

        // 注释
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],

        // 字符串
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'/, 'string', '@string_single'],
        [/`/, 'string', '@string_backtick'],
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],

      string_double: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop']
      ],

      string_single: [
        [/[^\\']+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/'/, 'string', '@pop']
      ],

      string_backtick: [
        [/\$\{/, { token: 'delimiter.bracket', next: '@bracketCounting' }],
        [/[^\\`$]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/`/, 'string', '@pop']
      ],

      bracketCounting: [
        [/\{/, 'delimiter.bracket', '@bracketCounting'],
        [/\}/, 'delimiter.bracket', '@pop'],
        { include: 'common' }
      ]
    }
  })
}