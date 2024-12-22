import { defineComponent, ref, type PropType, type StyleValue } from 'vue'
import {
  CopyOutlined,
  ScissorOutlined,
  SnippetsOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import { Button, Tooltip } from 'ant-design-vue'
import type { Component } from '@/types/component'
import './DragDropCanvas.css'

export default defineComponent({
  name: 'DragDropCanvas',
  props: {
    components: {
      type: Array as PropType<Component[]>,
      required: true,
    },
    onSelect: {
      type: Function as PropType<(component: Component | null) => void>,
      required: true,
    },
    onUpdate: {
      type: Function as PropType<(component: Component) => void>,
      required: true,
    },
  },
  setup(props) {
    const canvasRef = ref<HTMLDivElement>()
    const selectedComponent = ref<Component | null>(null)
    const clipboard = ref<Component | null>(null)

    // 处理拖拽
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'copy'
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      const data = e.dataTransfer!.getData('component')
      console.log('data', data)
      if (data) {
        const component = JSON.parse(data) as Component
        const rect = canvasRef.value!.getBoundingClientRect()
        component.styles = {
          ...component.styles,
          position: 'absolute',
          left: `${e.clientX - rect.left}px`,
          top: `${e.clientY - rect.top}px`,
        }
        // TODO: 添加组件到画布
        props.onUpdate(component)
      }
    }

    // 处理组件选择
    const handleComponentClick = (e: MouseEvent, component: Component) => {
      e.stopPropagation()
      selectedComponent.value = component
      props.onSelect(component)
    }

    // 处理画布点击
    const handleCanvasClick = () => {
      selectedComponent.value = null
      props.onSelect(null)
    }

    // 工具栏操作
    const handleCopy = () => {
      if (selectedComponent.value) {
        clipboard.value = JSON.parse(JSON.stringify(selectedComponent.value))
      }
    }

    const handleCut = () => {
      if (selectedComponent.value) {
        clipboard.value = JSON.parse(JSON.stringify(selectedComponent.value))
        // TODO: 从画布移除组件
        selectedComponent.value = null
        props.onSelect(null)
      }
    }

    const handlePaste = () => {
      if (clipboard.value) {
        const component = JSON.parse(JSON.stringify(clipboard.value))
        component.id = Date.now().toString() // 生成新的ID
        component.style = {
          ...component.style,
          left: `${parseInt(component.style.left) + 20}px`,
          top: `${parseInt(component.style.top) + 20}px`,
        }
        // TODO: 添加组件到画布
        props.onUpdate(component)
      }
    }

    const handleDelete = () => {
      if (selectedComponent.value) {
        // TODO: 从画布移除组件
        selectedComponent.value = null
        props.onSelect(null)
      }
    }

    // 渲染工具栏
    const renderToolbar = () => {
      if (!selectedComponent.value) return null

      return (
        <div class="component-toolbar">
          <Tooltip title="复制">
            <Button type="text" onClick={handleCopy}>
              <CopyOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="剪切">
            <Button type="text" onClick={handleCut}>
              <ScissorOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="粘贴">
            <Button type="text" onClick={handlePaste} disabled={!clipboard.value}>
              <SnippetsOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Button type="text" onClick={handleDelete} class="text-red-500">
              <DeleteOutlined />
            </Button>
          </Tooltip>
        </div>
      )
    }

    return () => (
      <div
        ref={canvasRef}
        class="drag-drop-canvas"
        onDragover={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        {props.components.map((component) => (
          <div
            class="canvas-component"
            style={component.styles as StyleValue}
            onClick={(e: MouseEvent) => handleComponentClick(e, component)}
          >
            {component.component}
          </div>
        ))}
        {renderToolbar()}
      </div>
    )
  },
})
