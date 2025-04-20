import { defineComponent, ref, onMounted, onUnmounted, type CSSProperties } from 'vue'
import type { Component } from '@/types/component'
import { useDesignStore } from '@/stores/design'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
} from '@ant-design/icons-vue'
import { Button, message, Switch } from 'ant-design-vue'
import './DragDropCanvas.css'
import ComponentRenderer from './core/componentRenderer'
import { componentSchemas } from './core/componentSchemas'

interface AlignmentLine {
  direction: 'horizontal' | 'vertical'
  position: number
}

// 对齐配置
const ALIGNMENT_THRESHOLD = 5

// 缩放控制点类型
type ResizeHandle =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

// 网格配置
const GRID_SIZE = 20

export default defineComponent({
  name: 'DragDropCanvas',
  setup() {
    const designStore = useDesignStore()
    const canvasRef = ref<HTMLDivElement | null>(null)
    const isDragging = ref(false)
    const isResizing = ref(false)
    const isRotating = ref(false)
    const dragStartPos = ref({ x: 0, y: 0 })
    const resizeStartPos = ref({ x: 0, y: 0 })
    const resizeStartSize = ref({ width: 0, height: 0 })
    const rotateStartAngle = ref(0)
    const currentResizeHandle = ref<ResizeHandle | null>(null)
    const alignmentLines = ref<AlignmentLine[]>([])
    const showGrid = ref(true)
    const enableGridSnap = ref(true)
    const isDragOver = ref(false)

    // 对齐到网格
    const snapToGrid = (value: number): number => {
      if (!enableGridSnap.value) return value
      return Math.round(value / GRID_SIZE) * GRID_SIZE
    }

    // 处理组件拖拽开始
    const handleDragStart = (e: DragEvent, component: Component) => {
      if (!e.dataTransfer) return

      isDragging.value = true
      dragStartPos.value = {
        x: e.clientX,
        y: e.clientY,
      }

      e.dataTransfer.setData('component-id', component.id)
      e.dataTransfer.effectAllowed = 'move'

      if (e.target instanceof HTMLElement) {
        e.target.classList.add('dragging')
      }
    }

    // 处理组件拖拽
    const handleDrag = (e: DragEvent) => {
      if (!isDragging.value || !e.clientX || !e.clientY) return

      const deltaX = e.clientX - dragStartPos.value.x
      const deltaY = e.clientY - dragStartPos.value.y

      // 计算对齐线
      alignmentLines.value = calculateAlignmentLines(snapToGrid(deltaX), snapToGrid(deltaY))
    }

    // 处理组件拖拽结束
    const handleDragEnd = (e: DragEvent, component: Component) => {
      isDragging.value = false
      alignmentLines.value = []

      if (e.target instanceof HTMLElement) {
        e.target.classList.remove('dragging')
      }

      if (e.clientX && e.clientY) {
        const deltaX = e.clientX - dragStartPos.value.x
        const deltaY = e.clientY - dragStartPos.value.y

        const newLeft = snapToGrid(parseInt((component.style?.left as string) || '0') + deltaX)
        const newTop = snapToGrid(parseInt((component.style?.top as string) || '0') + deltaY)

        designStore.updateComponent({
          ...component,
          style: {
            ...component.style,
            left: `${newLeft}px`,
            top: `${newTop}px`,
          },
        })
      }
    }

    // 计算对齐线
    const calculateAlignmentLines = (deltaX: number, deltaY: number): AlignmentLine[] => {
      const lines: AlignmentLine[] = []
      const selectedComponent = designStore.selectedComponent

      if (!selectedComponent) return lines

      const currentRect = {
        left: parseInt((selectedComponent.style?.left as string) || '0') + deltaX,
        top: parseInt((selectedComponent.style?.top as string) || '0') + deltaY,
        width: parseInt((selectedComponent.style?.width as string) || '0'),
        height: parseInt((selectedComponent.style?.height as string) || '0'),
      }

      designStore.components.forEach((component) => {
        if (component.id === selectedComponent.id) return

        const rect = {
          left: parseInt((component.style?.left as string) || '0'),
          top: parseInt((component.style?.top as string) || '0'),
          width: parseInt((component.style?.width as string) || '0'),
          height: parseInt((component.style?.height as string) || '0'),
        }

        // 水平对齐
        if (Math.abs(currentRect.top - rect.top) < ALIGNMENT_THRESHOLD) {
          lines.push({ direction: 'horizontal', position: rect.top })
        }
        if (Math.abs(currentRect.top + currentRect.height - rect.top) < ALIGNMENT_THRESHOLD) {
          lines.push({ direction: 'horizontal', position: rect.top })
        }
        if (Math.abs(currentRect.top - (rect.top + rect.height)) < ALIGNMENT_THRESHOLD) {
          lines.push({ direction: 'horizontal', position: rect.top + rect.height })
        }

        // 垂直对齐
        if (Math.abs(currentRect.left - rect.left) < ALIGNMENT_THRESHOLD) {
          lines.push({ direction: 'vertical', position: rect.left })
        }
        if (Math.abs(currentRect.left + currentRect.width - rect.left) < ALIGNMENT_THRESHOLD) {
          lines.push({ direction: 'vertical', position: rect.left })
        }
        if (Math.abs(currentRect.left - (rect.left + rect.width)) < ALIGNMENT_THRESHOLD) {
          lines.push({ direction: 'vertical', position: rect.left + rect.width })
        }
      })

      return lines
    }

    // 渲染对齐线
    const renderAlignmentLines = () => {
      return alignmentLines.value.map((line, index) => (
        <div
          key={`${line.direction}-${index}`}
          class={`alignment-line ${line.direction}`}
          style={{
            [line.direction === 'horizontal' ? 'top' : 'left']: `${line.position}px`,
          }}
        />
      ))
    }

    // 处理层级调整
    const handleLayerChange = (component: Component, direction: 'up' | 'down') => {
      designStore.moveComponent(component.id, direction)
      message.success(direction === 'up' ? '已上移一层' : '已下移一层')
    }

    // 计算旋转角度
    const calculateRotationAngle = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).closest('.component-wrapper')?.getBoundingClientRect()
      if (!rect) return 0

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)

      return angle
    }

    // 处理旋转开始
    const handleRotateStart = (e: MouseEvent, component: Component) => {
      e.stopPropagation()
      if (!component) return

      isRotating.value = true
      rotateStartAngle.value = calculateRotationAngle(e)

      // 获取当前旋转角度
      const currentRotation = parseInt(
        component.style?.transform?.replace('rotate(', '').replace('deg)', '') || '0',
      )
      rotateStartAngle.value = currentRotation

      document.addEventListener('mousemove', handleRotateMove)
      document.addEventListener('mouseup', handleRotateEnd)
    }

    // 处理旋转移动
    const handleRotateMove = (e: MouseEvent) => {
      if (!isRotating.value || !designStore.selectedComponent) return

      const component = designStore.selectedComponent
      const currentAngle = calculateRotationAngle(e)
      const deltaAngle = currentAngle - rotateStartAngle.value

      // 计算新的旋转角度，每15度对齐
      const newRotation = Math.round((rotateStartAngle.value + deltaAngle) / 15) * 15

      // 更新组件旋转角度
      designStore.updateComponent({
        ...component,
        style: {
          ...component.style,
          transform: `rotate(${newRotation}deg)`,
        },
      })
    }

    // 处理旋转结束
    const handleRotateEnd = () => {
      isRotating.value = false
      document.removeEventListener('mousemove', handleRotateMove)
      document.removeEventListener('mouseup', handleRotateEnd)
    }

    // 快速旋转（90度）
    const handleQuickRotate = (component: Component, direction: 'left' | 'right') => {
      const currentRotation = parseInt(
        component.style?.transform?.replace('rotate(', '').replace('deg)', '') || '0',
      )
      const newRotation = direction === 'left' ? currentRotation - 90 : currentRotation + 90

      designStore.updateComponent({
        ...component,
        style: {
          ...component.style,
          transform: `rotate(${newRotation}deg)`,
        },
      })

      message.success(direction === 'left' ? '逆时针旋转90度' : '顺时针旋转90度')
    }

    // 处理键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      const selectedComponent = designStore.selectedComponent
      if (!selectedComponent) return

      const step = e.shiftKey ? GRID_SIZE : enableGridSnap.value ? GRID_SIZE : 1
      let deltaX = 0
      let deltaY = 0

      // 原有的方向键移动逻辑
      switch (e.key) {
        case 'ArrowLeft':
          deltaX = -step
          break
        case 'ArrowRight':
          deltaX = step
          break
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd + Up: 上移一层
            e.preventDefault()
            handleLayerChange(selectedComponent, 'up')
            return
          }
          deltaY = -step
          break
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd + Down: 下移一层
            e.preventDefault()
            handleLayerChange(selectedComponent, 'down')
            return
          }
          deltaY = step
          break
        case 'PageUp':
          // PageUp: 上移一层
          e.preventDefault()
          handleLayerChange(selectedComponent, 'up')
          return
        case 'PageDown':
          // PageDown: 下移一层
          e.preventDefault()
          handleLayerChange(selectedComponent, 'down')
          return
        case 'r':
          if (e.shiftKey) {
            // Shift + R: 逆时针旋转90度
            e.preventDefault()
            handleQuickRotate(selectedComponent, 'left')
          } else {
            // R: 顺时针旋转90度
            e.preventDefault()
            handleQuickRotate(selectedComponent, 'right')
          }
          break
      }

      if (deltaX !== 0 || deltaY !== 0) {
        e.preventDefault()
        const newLeft = snapToGrid(
          parseInt((selectedComponent.style?.left as string) || '0') + deltaX,
        )
        const newTop = snapToGrid(parseInt((selectedComponent.style?.top as string) || '0') + deltaY)

        designStore.updateComponent({
          ...selectedComponent,
          style: {
            ...selectedComponent.style,
            left: `${newLeft}px`,
            top: `${newTop}px`,
          },
        })
      }
    }

    // 处理缩放开始
    const handleResizeStart = (e: MouseEvent, component: Component, handle: ResizeHandle) => {
      e.stopPropagation()
      if (!component) return

      isResizing.value = true
      currentResizeHandle.value = handle
      resizeStartPos.value = {
        x: e.clientX,
        y: e.clientY,
      }
      resizeStartSize.value = {
        width: parseInt(component.style?.width as string),
        height: parseInt(component.style?.height as string),
      }

      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
    }

    // 处理缩放移动
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing.value || !currentResizeHandle.value || !designStore.selectedComponent) return

      const deltaX = e.clientX - resizeStartPos.value.x
      const deltaY = e.clientY - resizeStartPos.value.y
      const handle = currentResizeHandle.value
      const component = designStore.selectedComponent
      const newSize = { ...resizeStartSize.value }
      const minSize = { width: 50, height: 30 }

      // 根据不同的控制点计算新的尺寸，并对齐到网格
      if (handle.includes('right')) {
        newSize.width = snapToGrid(Math.max(minSize.width, resizeStartSize.value.width + deltaX))
      } else if (handle.includes('left')) {
        newSize.width = snapToGrid(Math.max(minSize.width, resizeStartSize.value.width - deltaX))
      }

      if (handle.includes('bottom')) {
        newSize.height = snapToGrid(Math.max(minSize.height, resizeStartSize.value.height + deltaY))
      } else if (handle.includes('top')) {
        newSize.height = snapToGrid(Math.max(minSize.height, resizeStartSize.value.height - deltaY))
      }

      // 更新组件尺寸
      designStore.updateComponent({
        ...component,
        style: {
          ...component.style,
          width: `${newSize.width}px`,
          height: `${newSize.height}px`,
          ...(handle.includes('left')
            ? {
                left: `${snapToGrid(parseInt((component.style?.left as string) || '0') + (resizeStartSize.value.width - newSize.width))}px`,
              }
            : {}),
          ...(handle.includes('top')
            ? {
                top: `${snapToGrid(parseInt((component.style?.top as string) || '0') + (resizeStartSize.value.height - newSize.height))}px`,
              }
            : {}),
        },
      })
    }

    // 处理缩放结束
    const handleResizeEnd = () => {
      isResizing.value = false
      currentResizeHandle.value = null
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }

    // 渲染缩放控制点
    const renderResizeHandles = (component: Component) => {
      if (designStore.selectedId !== component.id) return null

      const handles: ResizeHandle[] = [
        'top-left',
        'top-center',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ]

      return (
        <div class="resize-handles">
          {handles.map((handle) => (
            <div
              key={handle}
              class={`resize-handle ${handle}`}
              onMousedown={(e: MouseEvent) => handleResizeStart(e, component, handle)}
            />
          ))}
        </div>
      )
    }

    // 渲染旋转控制点
    const renderRotateHandle = (component: Component) => {
      if (designStore.selectedId !== component.id) return null

      return (
        <div class="rotate-handle" onMousedown={(e: MouseEvent) => handleRotateStart(e, component)}>
          <div class="rotate-buttons">
            <Button
              type="text"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickRotate(component, 'left')
              }}
            >
              <RotateLeftOutlined />
            </Button>
            <Button
              type="text"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickRotate(component, 'right')
              }}
            >
              <RotateRightOutlined />
            </Button>
          </div>
        </div>
      )
    }

    // 切换网格显示
    const toggleGrid = () => {
      showGrid.value = !showGrid.value
      message.success(showGrid.value ? '已显示网格' : '已隐藏网格')
    }

    // 切换网格吸附
    const toggleGridSnap = () => {
      enableGridSnap.value = !enableGridSnap.value
      message.success(enableGridSnap.value ? '已启用网格吸附' : '已禁用网格吸附')
    }

    // 渲染网格控制按钮
    const renderGridControls = () => {
      return (
        <div class="grid-controls">
          <div class="control-item">
            <Switch checked={showGrid.value} onChange={toggleGrid} size="small" />
            <span class="control-label">显示网格</span>
          </div>
          <div class="control-item">
            <Switch checked={enableGridSnap.value} onChange={toggleGridSnap} size="small" />
            <span class="control-label">网格吸附</span>
          </div>
        </div>
      )
    }

    // 处理拖拽进入
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      isDragOver.value = true
    }

    // 处理拖拽离开
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      if (e.target === canvasRef.value) {
        isDragOver.value = false
      }
    }

    // 处理拖拽悬停
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
    }

    // 处理组件放置
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      isDragOver.value = false

      const componentData = e.dataTransfer?.getData('component-data')
      if (!componentData || !canvasRef.value) return

      try {
        const component = JSON.parse(componentData)
        const rect = canvasRef.value.getBoundingClientRect()
        const x = Math.round(e.clientX - rect.left)
        const y = Math.round(e.clientY - rect.top)

        // 获取组件的默认配置
        const schema = componentSchemas[component.type as keyof typeof componentSchemas]
        if (!schema) {
          throw new Error(`未找到组件 ${component.type} 的配置`)
        }

        // 创建新组件，合并默认配置
        const newComponent: Component = {
          id: `${component.type}_${Date.now()}`,
          type: component.type,
          title: component.title || schema.title,
          props: {
            // 从 schema 中获取默认属性值
            ...Object.entries(schema.properties.props?.properties || {}).reduce(
              (acc, [key, propSchema]) => {
                const value = propSchema as { default?: unknown }
                if ('default' in value) {
                  acc[key] = value.default
                }
                return acc
              },
              {} as Record<string, unknown>,
            ),
            // 合并组件自带的属性
            ...component.props,
          },
          style: {
            position: 'absolute',
            left: `${snapToGrid(x)}px`,
            top: `${snapToGrid(y)}px`,
            width: '100px', // 默认尺寸
            height: '100px', // 默认尺寸
            // 从 schema 中获取默认样式值
            ...Object.entries(schema.properties.style?.properties || {}).reduce(
              (acc, [key, styleSchema]) => {
                const value = styleSchema as { default?: unknown }
                if ('default' in value) {
                  acc[key] = value.default
                }
                return acc
              },
              {} as Record<string, unknown>,
            ),
            // 合并组件自带的样式
            ...component.style,
          },
          // 添加默认事件配置
          events: component.events || [],
          // 添加默认动画配置
          animations: component.animations || [],
          // 添加默认数据绑定配置
          dataBindings: component.dataBindings || [],
        }

        // 添加到设计器中
        designStore.addComponent(newComponent)
        designStore.selectComponent(newComponent.id)
        message.success('添加组件成功')
      } catch (error) {
        console.error('组件创建失败:', error)
        message.error('组件创建失败')
      }
    }

    const handleCanvasClick = (e: MouseEvent) => {
      if (e.target === canvasRef.value && designStore.selectedId) {
        designStore.selectComponent(null)
      }
    }
    const handleContextOutside = (e: MouseEvent) => {
      if (designStore.selectedId) {
        // 如果组件被选中，则不取消选中
        return
      }
      if (e.target !== canvasRef.value) {
        designStore.selectComponent(null)
      }
    }
    const handleComponentClick = (e: MouseEvent, component: Component) => {
      e.stopPropagation()
      if (designStore.selectedId === component.id) {
        return
      }
      designStore.selectComponent(component.id)
    }

    // 添加键盘事件监听
    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('click', handleContextOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleContextOutside)
    })

    return () => (
      <div
        ref={canvasRef}
        class={`drag-drop-canvas ${showGrid.value ? 'show-grid' : ''} ${isDragOver.value ? 'drag-over' : ''}`}
        onDragenter={handleDragEnter}
        onDragleave={handleDragLeave}
        onDragover={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        {/* 拖拽指示器 */}
        {isDragOver.value && <div class="drop-indicator" />}

        {/* 网格控制按钮 */}
        {renderGridControls()}

        {/* 组件列表 */}
        {designStore.components.map((component) => (
          <div
            key={component.id}
            class={`component-wrapper ${designStore.selectedId === component.id ? 'selected' : ''} ${isResizing.value ? 'resizing' : ''} ${isRotating.value ? 'rotating' : ''}`}
            draggable={!isResizing.value && !isRotating.value}
            onDragstart={(e: DragEvent) => handleDragStart(e, component)}
            onDrag={handleDrag}
            onDragend={(e: DragEvent) => handleDragEnd(e, component)}
            onClick={(e: MouseEvent) => handleComponentClick(e, component)}
            style={
              {
                position: 'absolute',
                ...component.style,
                zIndex: designStore.components.indexOf(component),
              } as CSSProperties
            }
            data-id={component.id}
          >
            {/* 组件内容 */}
            <ComponentRenderer component={component} class="component-content" />

            {/* 工具栏 */}
            {/* {designStore.selectedId === component.id && (
              <div class="component-toolbar">
                <Button
                  type="text"
                  onClick={() => handleLayerChange(component, 'up')}
                  disabled={
                    designStore.components.indexOf(component) === designStore.components.length - 1
                  }
                >
                  <ArrowUpOutlined />
                </Button>
                <Button
                  type="text"
                  onClick={() => handleLayerChange(component, 'down')}
                  disabled={designStore.components.indexOf(component) === 0}
                >
                  <ArrowDownOutlined />
                </Button>
              </div>
            )} */}

            {/* 缩放控制点 */}
            {renderResizeHandles(component)}

            {/* 旋转控制点 */}
            {/* {renderRotateHandle(component)} */}
          </div>
        ))}
        {renderAlignmentLines()}
      </div>
    )
  },
})
