export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: 'conventional-changelog-conventionalcommits',
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
  prompt: {
    settings: {},
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: '用于描述变更类型',
        enum: {
          feat: {
            description: '新增功能 (feature)',
            title: 'feat',
            emoji: '✨',
          },
          fix: {
            description: '修复bug (bug fix)',
            title: 'fix',
            emoji: '🐛',
          },
          docs: {
            description: '文档更新 (docs)',
            title: 'docs',
            emoji: '📚',
          },
          style: {
            description: '代码格式 (代码风格修改)',
            title: 'style',
            emoji: '💎',
          },
          refactor: {
            description: '重构 (即不是新增功能，也不是修改bug的代码变动)',
            title: 'refactor',
            emoji: '📦',
          },
          perf: {
            description: '改善性能的代码更改',
            title: 'perf',
            emoji: '⚡️',
          },
          test: {
            description: '添加或修改测试',
            title: 'test',
            emoji: '🚨',
          },
          build: {
            description:
              '影响构建系统或外部依赖的更改 (例如:gulp, npm, webpack)',
            title: 'build',
            emoji: '🛠️',
          },
          ci: {
            description:
              '更改我们的持续集成文件和脚本 (以上内容未涉及到的改动)',
            title: 'ci',
            emoji: '🎫',
          },
          chore: {
            description: '其他改变 (不包括上述类型)',
            title: 'chore',
            emoji: '♻️',
          },
          revert: {
            description: '回滚到上一个版本',
            title: 'revert',
            emoji: '↩️',
          },
        },
      },
      scope: {
        description: '修改范围 (组件/模块)',
        enum: [
          'api',
          'components',
          'config',
          'utils',
          'pages',
          'styles',
          'others',
          '',
        ], // 如果使用默认的提交类型，则可以省略
      },
      subject: {
        description: '提交目的 (简短描述)',
      },
      body: {
        description: '提交详细描述',
      },
      isBreaking: {
        description: '是否破坏性更改',
      },
      breakingBody: {
        description: '破坏性更改描述',
      },
      isIssuesAfcted: {
        description: '是否影响issue',
      },
      issuesBody: {
        description: '影响issue描述',
      },
      issues: {
        description: '关闭的issue (例如: #1, #2)',
      },
    },
  },
}
