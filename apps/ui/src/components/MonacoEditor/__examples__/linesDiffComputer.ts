import * as monaco from 'monaco-editor'

interface LineChange {
  originalStartLineNumber: number
  originalEndLineNumber: number
  modifiedStartLineNumber: number
  modifiedEndLineNumber: number
}

class LinesDiffComputer {
  private original: string[]
  private modified: string[]

  constructor(originalText: string, modifiedText: string) {
    this.original = originalText.split('\n')
    this.modified = modifiedText.split('\n')
  }

  computeDiff(): LineChange[] {
    const changes: LineChange[] = []
    let i = 0
    let j = 0

    while (i < this.original.length || j < this.modified.length) {
      // 找到不同的起始位置
      while (
        i < this.original.length &&
        j < this.modified.length &&
        this.original[i] === this.modified[j]
      ) {
        i++
        j++
      }

      if (i < this.original.length || j < this.modified.length) {
        const changeStart = {
          originalStart: i,
          modifiedStart: j
        }

        // 找到下一个匹配点
        while (i < this.original.length && !this.modified.includes(this.original[i])) {
          i++
        }
        while (j < this.modified.length && !this.original.includes(this.modified[j])) {
          j++
        }

        // 只有当有实际变化时才添加差异记录
        if (
          changeStart.originalStart !== i ||
          changeStart.modifiedStart !== j
        ) {
          changes.push({
            originalStartLineNumber: changeStart.originalStart + 1,
            originalEndLineNumber: i,
            modifiedStartLineNumber: changeStart.modifiedStart + 1,
            modifiedEndLineNumber: j
          })
        }
      }
    }

    return this.mergeAdjacentChanges(changes)
  }

  // 合并相邻的差异记录
  private mergeAdjacentChanges(changes: LineChange[]): LineChange[] {
    if (changes.length <= 1) return changes

    const merged: LineChange[] = []
    let current = changes[0]

    for (let i = 1; i < changes.length; i++) {
      const next = changes[i]
      
      if (
        next.originalStartLineNumber <= current.originalEndLineNumber + 1 &&
        next.modifiedStartLineNumber <= current.modifiedEndLineNumber + 1
      ) {
        // 合并相邻的变更
        current = {
          originalStartLineNumber: current.originalStartLineNumber,
          originalEndLineNumber: Math.max(current.originalEndLineNumber, next.originalEndLineNumber),
          modifiedStartLineNumber: current.modifiedStartLineNumber,
          modifiedEndLineNumber: Math.max(current.modifiedEndLineNumber, next.modifiedEndLineNumber)
        }
      } else {
        merged.push(current)
        current = next
      }
    }

    merged.push(current)
    return merged
  }

  createLineDecorations(editor: monaco.editor.IStandaloneCodeEditor, changes: LineChange[], isModified: boolean): monaco.editor.IModelDeltaDecoration[] {
    const decorations: monaco.editor.IModelDeltaDecoration[] = []
    
    changes.forEach(change => {
      const startLine = isModified ? change.modifiedStartLineNumber : change.originalStartLineNumber
      const endLine = isModified ? change.modifiedEndLineNumber : change.originalEndLineNumber

      // 添加或删除的行
      if (startLine <= endLine) {
        const isAdded = isModified
        const type = isAdded ? 'added' : 'removed'
        
        decorations.push({
          range: new monaco.Range(startLine, 1, endLine, 1),
          options: {
            isWholeLine: true,
            linesDecorationsClassName: `diff-${type}-gutter`,
            className: `diff-${type}-line`,
            glyphMarginClassName: `diff-${type}-glyph`,
            overviewRuler: {
              color: {
                id: isAdded ? 'diffEditorInserted' : 'diffEditorRemoved'
              },
              position: monaco.editor.OverviewRulerLane.Center
            },
            minimap: {
              color: {
                id: isAdded ? 'diffEditorInserted' : 'diffEditorRemoved'
              },
              position: monaco.editor.MinimapPosition.Inline
            }
          }
        })
      }
    })

    return decorations
  }

  getDiffStats(): { added: number; removed: number; modified: number } {
    const changes = this.computeDiff()
    let added = 0
    let removed = 0
    let modified = 0

    changes.forEach(change => {
      const originalLength = change.originalEndLineNumber - change.originalStartLineNumber + 1
      const modifiedLength = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1

      if (originalLength === 0) {
        added += modifiedLength
      } else if (modifiedLength === 0) {
        removed += originalLength
      } else {
        const minLength = Math.min(originalLength, modifiedLength)
        modified += minLength
        if (modifiedLength > originalLength) {
          added += modifiedLength - originalLength
        } else {
          removed += originalLength - modifiedLength
        }
      }
    })

    return { added, removed, modified }
  }
}

export { LinesDiffComputer }
export type { LineChange }