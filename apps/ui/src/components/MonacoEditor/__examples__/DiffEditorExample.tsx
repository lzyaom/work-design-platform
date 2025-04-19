import { defineComponent, ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import MonacoEditor from '../index'
import DiffToolbar from './DiffToolbar'
import DiffSearch from './DiffSearch'
import { LinesDiffComputer } from './linesDiffComputer'
import type { MonacoEditorExpose } from '../types'
import type { LineChange } from './linesDiffComputer'
import * as monaco from 'monaco-editor'
import { originalCode, modifiedCode } from './sampleCode'
import { debounce, throttle } from './utils'

interface Decoration extends monaco.editor.IModelDecoration {
  options: monaco.editor.IModelDecorationOptions
}

export default defineComponent({
  name: 'DiffEditorExample',
  
  setup() {
    // 编辑器引用
    const originalEditor = ref<MonacoEditorExpose>()
    const modifiedEditor = ref<MonacoEditorExpose>()
    
    // 编辑器内容
    const original = ref(originalCode)
    const modified = ref(modifiedCode)
    
    // 状态管理
    const showInlineChanges = ref(true)
    const isLoading = ref(true)
    const currentDiffIndex = ref(-1)
    const diffRanges = ref<LineChange[]>([])
    const showSearch = ref(false)

    // 编辑器状态
    const getEditors = () => ({
      original: originalEditor.value?.getEditor(),
      modified: modifiedEditor.value?.getEditor()
    })

    const getModels = () => ({
      original: originalEditor.value?.getEditor()?.getModel(),
      modified: modifiedEditor.value?.getEditor()?.getModel()
    })

    // 获取装饰器
    const getModelDecorations = (editor: monaco.editor.IStandaloneCodeEditor): Decoration[] => {
      const model = editor.getModel()
      return model ? (model.getAllDecorations() as Decoration[]) : []
    }

    // 计算和应用差异（使用防抖优化性能）
    const computeAndApplyDiff = debounce(() => {
      const { original: originalModel, modified: modifiedModel } = getModels()
      if (!originalModel || !modifiedModel) return

      const diffComputer = new LinesDiffComputer(
        originalModel.getValue(),
        modifiedModel.getValue()
      )

      // 计算差异
      const changes = diffComputer.computeDiff()
      diffRanges.value = changes

      // 应用装饰器
      const { original: originalEditor, modified: modifiedEditor } = getEditors()
      if (originalEditor && modifiedEditor) {
        // 清除旧的装饰器
        const originalDecorations = getModelDecorations(originalEditor)
        const modifiedDecorations = getModelDecorations(modifiedEditor)
        
        originalEditor.deltaDecorations(
          originalDecorations.map(d => d.id),
          []
        )
        modifiedEditor.deltaDecorations(
          modifiedDecorations.map(d => d.id),
          []
        )

        // 添加新的装饰器
        originalEditor.deltaDecorations(
          [],
          diffComputer.createLineDecorations(originalEditor, changes, false)
        )
        modifiedEditor.deltaDecorations(
          [],
          diffComputer.createLineDecorations(modifiedEditor, changes, true)
        )
      }

      // 重置当前差异索引
      if (changes.length > 0 && currentDiffIndex.value === -1) {
        currentDiffIndex.value = 0
      }
    }, 300)

    // 导航到指定差异
    const navigateToDiff = (index: number) => {
      if (index < 0 || index >= diffRanges.value.length) return

      const change = diffRanges.value[index]
      const editors = getEditors()

      // 清除之前的高亮
      Object.values(editors).forEach(editor => {
        if (!editor) return
        const currentHighlights = getModelDecorations(editor)
          .filter(d => d.options.className === 'current-diff-line')
          .map(d => d.id)
        editor.deltaDecorations(currentHighlights, [])
      })

      // 添加新的高亮
      editors.original?.deltaDecorations([], [{
        range: new monaco.Range(
          change.originalStartLineNumber,
          1,
          change.originalEndLineNumber,
          1
        ),
        options: {
          isWholeLine: true,
          className: 'current-diff-line',
          glyphMarginClassName: 'current-diff-glyph'
        }
      }])
      editors.modified?.deltaDecorations([], [{
        range: new monaco.Range(
          change.modifiedStartLineNumber,
          1,
          change.modifiedEndLineNumber,
          1
        ),
        options: {
          isWholeLine: true,
          className: 'current-diff-line',
          glyphMarginClassName: 'current-diff-glyph'
        }
      }])

      // 滚动到视图中心
      editors.modified?.revealLineInCenter(change.modifiedStartLineNumber)
      editors.original?.revealLineInCenter(change.originalStartLineNumber)

      currentDiffIndex.value = index
    }

    // 下一个差异
    const goToNextDiff = () => {
      if (diffRanges.value.length === 0) return
      const nextIndex = (currentDiffIndex.value + 1) % diffRanges.value.length
      navigateToDiff(nextIndex)
    }

    // 上一个差异
    const goToPrevDiff = () => {
      if (diffRanges.value.length === 0) return
      const prevIndex = currentDiffIndex.value - 1
      navigateToDiff(prevIndex < 0 ? diffRanges.value.length - 1 : prevIndex)
    }

    // 同步滚动（使用节流优化）
    let isScrolling = false
    const handleScroll = throttle((sourceEditor: monaco.editor.IStandaloneCodeEditor, targetEditor: monaco.editor.IStandaloneCodeEditor) => {
      if (isScrolling) return
      isScrolling = true

      try {
        const sourceScrollTop = sourceEditor.getScrollTop()
        const sourceScrollLeft = sourceEditor.getScrollLeft()
        
        targetEditor.setScrollTop(sourceScrollTop)
        targetEditor.setScrollLeft(sourceScrollLeft)
      } finally {
        setTimeout(() => {
          isScrolling = false
        }, 100)
      }
    }, 16) // 约60fps

    // 编辑器配置
    const editorOptions = computed(() => ({
      readOnly: true,
      minimap: { enabled: false },
      lineNumbers: 'on' as const,
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 2,
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 5,
      lineNumbersMinChars: 3,
      renderFinalNewline: 'on' as const,
      renderWhitespace: 'selection' as const,
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      }
    }))

    // 快捷键处理
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        showSearch.value = true
      } else if (e.key === 'Escape' && showSearch.value) {
        showSearch.value = false
      }
    }

    // 生命周期
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
      
      setTimeout(() => {
        computeAndApplyDiff()
        isLoading.value = false
        goToNextDiff()
      }, 500)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })

    // 监听内容变化
    watch([original, modified], () => {
      computeAndApplyDiff()
    })

    return () => (
      <div class="diff-editor-example">
        <h2>代码对比示例</h2>
        <p class="description">
          这个示例展示了如何使用 Monaco Editor 进行代码对比，比较改动前后的差异。
          示例中展示了从 JavaScript 到 TypeScript 的迁移，添加了类型注解和文档注释。
          <br />
          <kbd>Ctrl/Cmd + F</kbd> 打开搜索，<kbd>ESC</kbd> 关闭搜索
        </p>
        
        <div class="editor-container">
          {originalEditor.value?.getEditor()?.getModel() && modifiedEditor.value?.getEditor()?.getModel() && (
            <>
              <DiffToolbar
                originalModel={originalEditor.value.getEditor()!.getModel()!}
                modifiedModel={modifiedEditor.value.getEditor()!.getModel()!}
                v-model:showInlineChanges={showInlineChanges.value}
                onNext-diff={goToNextDiff}
                onPrev-diff={goToPrevDiff}
              />
              {showSearch.value && (
                <DiffSearch
                  originalEditor={originalEditor.value}
                  modifiedEditor={modifiedEditor.value}
                />
              )}
            </>
          )}
          
          <div class="editors-wrapper">
            <div class="editor-column">
              <MonacoEditor
                ref={originalEditor}
                modelValue={original.value}
                language="javascript"
                theme="vs-dark"
                options={editorOptions.value}
                height="500px"
                onScroll={e => {
                  const editors = getEditors()
                  if (editors.original && editors.modified) {
                    handleScroll(editors.original, editors.modified)
                  }
                }}
              />
            </div>
            <div class="editor-column">
              <MonacoEditor
                ref={modifiedEditor}
                modelValue={modified.value}
                language="typescript"
                theme="vs-dark"
                options={editorOptions.value}
                height="500px"
                onScroll={e => {
                  const editors = getEditors()
                  if (editors.original && editors.modified) {
                    handleScroll(editors.modified, editors.original)
                  }
                }}
              />
            </div>
          </div>
        </div>

        <style>
          {`
          .diff-editor-example {
            padding: 20px;
          }

          .description {
            margin: 16px 0;
            color: #666;
            line-height: 1.6;
          }

          kbd {
            padding: 2px 6px;
            background: #eee;
            border-radius: 3px;
            border: 1px solid #ccc;
            font-size: 12px;
            font-family: monospace;
          }

          .editor-container {
            border: 1px solid var(--editor-border-color);
            border-radius: 4px;
            overflow: hidden;
          }

          .editors-wrapper {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0;
          }

          .editor-column {
            position: relative;
            min-width: 0;
          }

          .editor-column + .editor-column::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 1px;
            background: var(--editor-border-color);
          }

          [data-theme="dark"] {
            .description {
              color: #999;
            }

            kbd {
              background: #333;
              border-color: #444;
              color: #fff;
            }
          }

          @media (max-width: 768px) {
            .diff-editor-example {
              padding: 16px;
            }

            .editors-wrapper {
              grid-template-columns: 1fr;
            }

            .editor-column + .editor-column::before {
              display: none;
            }
          }
          `}
        </style>
      </div>
    )
  }
})