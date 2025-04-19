import { defineComponent, ref, computed } from 'vue'
import * as monaco from 'monaco-editor'
import type { PropType } from 'vue'

interface DiffInfo {
  added: number
  removed: number
  changed: number
}

interface LineChange {
  originalStartLineNumber: number
  originalEndLineNumber: number
  modifiedStartLineNumber: number
  modifiedEndLineNumber: number
}

export default defineComponent({
  name: 'DiffToolbar',

  props: {
    originalModel: {
      type: Object as PropType<monaco.editor.ITextModel>,
      required: true
    },
    modifiedModel: {
      type: Object as PropType<monaco.editor.ITextModel>,
      required: true
    },
    showInlineChanges: {
      type: Boolean,
      default: true
    }
  },

  emits: {
    'update:showInlineChanges': (value: boolean) => true,
    'copy-original': () => true,
    'copy-modified': () => true,
    'next-diff': () => true,
    'prev-diff': () => true
  },

  setup(props, { emit }) {
    const loading = ref(false)

    // 计算行级别的差异
    const calculateLineDiff = (original: string[], modified: string[]): LineChange[] => {
      const changes: LineChange[] = []
      let i = 0
      let j = 0

      while (i < original.length || j < modified.length) {
        if (i < original.length && j < modified.length && original[i] === modified[j]) {
          i++
          j++
          continue
        }

        const originalStart = i
        const modifiedStart = j

        while (i < original.length && !modified.includes(original[i])) i++
        while (j < modified.length && !original.includes(modified[j])) j++

        changes.push({
          originalStartLineNumber: originalStart + 1,
          originalEndLineNumber: i,
          modifiedStartLineNumber: modifiedStart + 1,
          modifiedEndLineNumber: j
        })
      }

      return changes
    }

    const diffInfo = computed<DiffInfo>(() => {
      const originalLines = props.originalModel.getValue().split('\n')
      const modifiedLines = props.modifiedModel.getValue().split('\n')
      const changes = calculateLineDiff(originalLines, modifiedLines)

      let added = 0
      let removed = 0
      let changed = 0

      changes.forEach(change => {
        const originalLength = change.originalEndLineNumber - change.originalStartLineNumber + 1
        const modifiedLength = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1

        if (originalLength === 0) {
          added += modifiedLength
        } else if (modifiedLength === 0) {
          removed += originalLength
        } else {
          const minLength = Math.min(originalLength, modifiedLength)
          changed += minLength
          if (modifiedLength > originalLength) {
            added += modifiedLength - originalLength
          } else {
            removed += originalLength - modifiedLength
          }
        }
      })

      return { added, removed, changed }
    })

    const handleViewModeChange = () => {
      emit('update:showInlineChanges', !props.showInlineChanges)
    }

    const copyOriginal = async () => {
      try {
        loading.value = true
        const text = props.originalModel.getValue()
        await navigator.clipboard.writeText(text)
        showToast('已复制原始代码')
      } catch (err) {
        showToast('复制失败，请重试', 'error')
      } finally {
        loading.value = false
      }
    }

    const copyModified = async () => {
      try {
        loading.value = true
        const text = props.modifiedModel.getValue()
        await navigator.clipboard.writeText(text)
        showToast('已复制修改后的代码')
      } catch (err) {
        showToast('复制失败，请重试', 'error')
      } finally {
        loading.value = false
      }
    }

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      const toast = document.createElement('div')
      toast.className = `diff-toast ${type}`
      toast.textContent = message
      document.body.appendChild(toast)

      setTimeout(() => {
        toast.classList.add('fade-out')
        setTimeout(() => toast.remove(), 300)
      }, 2000)
    }

    return () => (
      <div class="diff-toolbar">
        <div class="diff-stats">
          <span class="stat-item added" title="添加的行数">
            <i class="codicon codicon-add" />
            {diffInfo.value.added}
          </span>
          <span class="stat-item removed" title="删除的行数">
            <i class="codicon codicon-remove" />
            {diffInfo.value.removed}
          </span>
          <span class="stat-item changed" title="修改的行数">
            <i class="codicon codicon-edit" />
            {diffInfo.value.changed}
          </span>
        </div>

        <div class="diff-actions">
          <button
            class="action-button"
            title="上一处差异"
            onClick={() => emit('prev-diff')}
            disabled={loading.value}
          >
            <i class="codicon codicon-arrow-up" />
          </button>
          <button
            class="action-button"
            title="下一处差异"
            onClick={() => emit('next-diff')}
            disabled={loading.value}
          >
            <i class="codicon codicon-arrow-down" />
          </button>
          <div class="action-separator" />
          <button
            class="action-button"
            title="复制原始代码"
            onClick={copyOriginal}
            disabled={loading.value}
          >
            <i class="codicon codicon-copy" />
            原始
          </button>
          <button
            class="action-button"
            title="复制修改后代码"
            onClick={copyModified}
            disabled={loading.value}
          >
            <i class="codicon codicon-copy" />
            修改
          </button>
          <div class="action-separator" />
          <button
            class={['action-button', { active: props.showInlineChanges }]}
            title="切换对比模式"
            onClick={handleViewModeChange}
            disabled={loading.value}
          >
            <i class={`codicon codicon-${props.showInlineChanges ? 'split-horizontal' : 'merge'}`} />
            {props.showInlineChanges ? '并排' : '内联'}
          </button>
        </div>

        <style>
          {`
          .diff-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: var(--editor-toolbar-background);
            border-bottom: 1px solid var(--editor-border-color);
          }

          .diff-stats {
            display: flex;
            gap: 16px;
          }

          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--editor-foreground);
          }

          .stat-item.added {
            color: #28a745;
          }

          .stat-item.removed {
            color: #d73a49;
          }

          .stat-item.changed {
            color: #2188ff;
          }

          .diff-actions {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .action-button {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            font-size: 12px;
            color: var(--editor-foreground);
            background: transparent;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .action-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .action-button:not(:disabled):hover {
            background: var(--editor-toolbar-hover);
          }

          .action-button.active {
            background: var(--editor-toolbar-active);
          }

          .action-separator {
            width: 1px;
            height: 16px;
            margin: 0 4px;
            background: var(--editor-border-color);
          }

          .diff-toast {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            color: #fff;
            background: rgba(40, 167, 69, 0.9);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            transition: opacity 0.3s ease;
          }

          .diff-toast.error {
            background: rgba(215, 58, 73, 0.9);
          }

          .diff-toast.fade-out {
            opacity: 0;
          }

          @media (max-width: 640px) {
            .diff-toolbar {
              flex-direction: column;
              gap: 8px;
            }

            .diff-stats {
              width: 100%;
              justify-content: space-around;
            }

            .diff-actions {
              width: 100%;
              justify-content: space-between;
            }
          }
          `}
        </style>
      </div>
    )
  }
})