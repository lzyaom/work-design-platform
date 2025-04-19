import { defineComponent, ref, watch } from 'vue'
import type { MonacoEditorExpose } from '../types'
import * as monaco from 'monaco-editor'

interface SearchState {
  searchTerm: string
  matchCase: boolean
  matchWholeWord: boolean
  useRegex: boolean
  currentMatch: number
  totalMatches: number
}

export default defineComponent({
  name: 'DiffSearch',

  props: {
    originalEditor: {
      type: Object as () => MonacoEditorExpose | undefined,
      required: true
    },
    modifiedEditor: {
      type: Object as () => MonacoEditorExpose | undefined,
      required: true
    }
  },

  setup(props) {
    const state = ref<SearchState>({
      searchTerm: '',
      matchCase: false,
      matchWholeWord: false,
      useRegex: false,
      currentMatch: 0,
      totalMatches: 0
    })

    const searchDecorations = ref<{ [key: string]: string[] }>({
      original: [],
      modified: []
    })

    // 清除搜索高亮
    const clearSearchHighlights = () => {
      const editors = {
        original: props.originalEditor?.getEditor(),
        modified: props.modifiedEditor?.getEditor()
      }

      Object.entries(editors).forEach(([key, editor]) => {
        if (editor && searchDecorations.value[key].length) {
          editor.deltaDecorations(searchDecorations.value[key], [])
          searchDecorations.value[key] = []
        }
      })
    }

    // 执行搜索
    const performSearch = () => {
      clearSearchHighlights()
      if (!state.value.searchTerm) {
        state.value.currentMatch = 0
        state.value.totalMatches = 0
        return
      }

      const editors = {
        original: props.originalEditor?.getEditor(),
        modified: props.modifiedEditor?.getEditor()
      }

      Object.entries(editors).forEach(([key, editor]) => {
        if (!editor?.getModel()) return

        const searchParams: monaco.editor.FindMatch[] = editor.getModel()!.findMatches(
          state.value.searchTerm,
          false,
          state.value.useRegex,
          state.value.matchCase,
          state.value.matchWholeWord ? ' ' : null,
          true
        )

        const decorations = searchParams.map(match => ({
          range: match.range,
          options: {
            className: 'diff-search-result',
            isWholeLine: false,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          }
        }))

        searchDecorations.value[key] = editor.deltaDecorations([], decorations)
        state.value.totalMatches += searchParams.length
      })

      if (state.value.totalMatches > 0) {
        state.value.currentMatch = 1
        goToMatch(0)
      }
    }

    // 跳转到指定匹配项
    const goToMatch = (index: number) => {
      if (!state.value.totalMatches) return

      const editors = {
        original: props.originalEditor?.getEditor(),
        modified: props.modifiedEditor?.getEditor()
      }

      let currentIndex = 0
      for (const [key, editor] of Object.entries(editors)) {
        if (!editor?.getModel()) continue

        const matches = editor.getModel()!.findMatches(
          state.value.searchTerm,
          false,
          state.value.useRegex,
          state.value.matchCase,
          state.value.matchWholeWord ? ' ' : null,
          true
        )

        for (const match of matches) {
          if (currentIndex === index) {
            editor.revealRangeInCenter(match.range)
            editor.setSelection(match.range)
            return
          }
          currentIndex++
        }
      }
    }

    // 下一个匹配项
    const findNext = () => {
      if (!state.value.totalMatches) return
      state.value.currentMatch = state.value.currentMatch % state.value.totalMatches + 1
      goToMatch(state.value.currentMatch - 1)
    }

    // 上一个匹配项
    const findPrevious = () => {
      if (!state.value.totalMatches) return
      state.value.currentMatch = (state.value.currentMatch - 2 + state.value.totalMatches) % state.value.totalMatches + 1
      goToMatch(state.value.currentMatch - 1)
    }

    // 监听搜索条件变化
    watch(
      () => [
        state.value.searchTerm,
        state.value.matchCase,
        state.value.matchWholeWord,
        state.value.useRegex
      ],
      () => {
        performSearch()
      }
    )

    return () => (
      <div class="diff-search">
        <div class="search-input-group">
          <input
            type="text"
            class="search-input"
            placeholder="搜索..."
            v-model={state.value.searchTerm}
          />
          <span class="search-count">
            {state.value.totalMatches > 0
              ? `${state.value.currentMatch}/${state.value.totalMatches}`
              : '无匹配'}
          </span>
        </div>
        
        <div class="search-options">
          <label class="search-option">
            <input
              type="checkbox"
              v-model={state.value.matchCase}
            />
            区分大小写
          </label>
          <label class="search-option">
            <input
              type="checkbox"
              v-model={state.value.matchWholeWord}
            />
            全词匹配
          </label>
          <label class="search-option">
            <input
              type="checkbox"
              v-model={state.value.useRegex}
            />
            正则表达式
          </label>
        </div>

        <div class="search-actions">
          <button
            class="search-button"
            onClick={findPrevious}
            disabled={!state.value.totalMatches}
            title="上一个匹配项 (⇧F3)"
          >
            <i class="codicon codicon-arrow-up" />
          </button>
          <button
            class="search-button"
            onClick={findNext}
            disabled={!state.value.totalMatches}
            title="下一个匹配项 (F3)"
          >
            <i class="codicon codicon-arrow-down" />
          </button>
          <button
            class="search-button"
            onClick={() => clearSearchHighlights()}
            disabled={!state.value.totalMatches}
            title="清除搜索结果"
          >
            <i class="codicon codicon-clear-all" />
          </button>
        </div>

        <style>
          {`
          .diff-search {
            padding: 8px;
            border-bottom: 1px solid var(--editor-border-color);
            background: var(--editor-toolbar-background);
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .search-input-group {
            position: relative;
            flex: 1;
          }

          .search-input {
            width: 100%;
            padding: 4px 8px;
            padding-right: 60px;
            border: 1px solid var(--editor-border-color);
            border-radius: 3px;
            background: var(--editor-background);
            color: var(--editor-foreground);
            font-size: 13px;
          }

          .search-count {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 12px;
            color: var(--editor-foreground);
            opacity: 0.7;
          }

          .search-options {
            display: flex;
            gap: 12px;
            font-size: 12px;
          }

          .search-option {
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--editor-foreground);
            cursor: pointer;
            user-select: none;
          }

          .search-option input {
            margin: 0;
          }

          .search-actions {
            display: flex;
            gap: 4px;
          }

          .search-button {
            padding: 4px;
            border: none;
            background: transparent;
            color: var(--editor-foreground);
            cursor: pointer;
            border-radius: 3px;
            opacity: 0.7;
            transition: all 0.2s;
          }

          .search-button:hover:not(:disabled) {
            background: var(--editor-toolbar-hover);
            opacity: 1;
          }

          .search-button:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .diff-search-result {
            background: rgba(255, 214, 0, 0.3);
            border: 1px solid rgba(255, 214, 0, 0.6);
          }

          [data-theme="dark"] .diff-search-result {
            background: rgba(255, 214, 0, 0.2);
            border-color: rgba(255, 214, 0, 0.4);
          }
          `}
        </style>
      </div>
    )
  }
})