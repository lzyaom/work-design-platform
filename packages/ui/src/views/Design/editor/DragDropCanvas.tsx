import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import {
  CopyOutlined,
  DeleteOutlined,
  ScissorOutlined,
  SnippetsOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  GroupOutlined,
  UngroupOutlined,
} from '@ant-design/icons-vue'
import { Menu, message } from 'ant-design-vue'
import type { MenuProps } from 'ant-design-vue'
import { useDesignStore } from '@/stores/design'
import type { Component } from '@/types/component'
import './DragDropCanvas.css'
import { ComponentRenderer } from './core/componentRenderer'
export default defineComponent({
  name: 'DragDropCanvas',
  setup() {
    const designStore = useDesignStore()
    const canvasRef = ref<HTMLDivElement>()
    const contextMenuPosition = ref({ x: 0, y: 0 })
    const showContextMenu = ref(false)
    const clipboard = ref<Component | null>(null)

    // 处理组件拖放
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      const data = e.dataTransfer?.getData('component')
      if (data && canvasRef.value) {
        const component = JSON.parse(data)
        const rect = canvasRef.value.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // 创建新组件
        const newComponent: Component = {
          ...component,
          id: `${component.type}_${Date.now()}`,
          props: {},
          style: {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            ...component.style,
          },
        }

        designStore.addComponent(newComponent)
        message.success('添加组件成功')
      }
    }

    // 处理拖拽悬停
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
    }

    // 处理右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      contextMenuPosition.value = {
        x: e.offsetX,
        y: e.offsetY,
      }
      showContextMenu.value = true
    }

    const handleContextMenuOutside = (e: MouseEvent) => {
      if (e.target !== canvasRef.value) {
        showContextMenu.value = false
      }
    }

    // 右键菜单项
    const contextMenuItems = [
      {
        key: 'copy',
        icon: <CopyOutlined />,
        label: '复制',
      },
      {
        key: 'cut',
        icon: <ScissorOutlined />,
        label: '剪切',
      },
      {
        key: 'paste',
        icon: <SnippetsOutlined />,
        label: '粘贴',
        disabled: !clipboard.value,
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
      },
      {
        type: 'divider',
      },
      {
        key: 'moveUp',
        icon: <ArrowUpOutlined />,
        label: '上移一层',
      },
      {
        key: 'moveDown',
        icon: <ArrowDownOutlined />,
        label: '下移一层',
      },
      {
        type: 'divider',
      },
      {
        key: 'group',
        icon: <GroupOutlined />,
        label: '组合',
      },
      {
        key: 'ungroup',
        icon: <UngroupOutlined />,
        label: '取消组合',
      },
    ]

    // 处理菜单点击
    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
      const selectedComponent = designStore.selectedComponent
      if (!selectedComponent) return

      switch (key) {
        case 'copy':
          clipboard.value = { ...selectedComponent }
          message.success('已复制到剪贴板')
          break
        case 'cut':
          clipboard.value = { ...selectedComponent }
          designStore.deleteComponent(selectedComponent.id)
          message.success('已剪切到剪贴板')
          break
        case 'paste':
          if (clipboard.value && clipboard.value.style) {
            const newComponent = {
              ...clipboard.value,
              id: `${clipboard.value.type}_${Date.now()}`,
              style: {
                ...clipboard.value.style,
                left: `${parseInt((clipboard.value.style.left as string) || '0') + 20}px`,
                top: `${parseInt((clipboard.value.style.top as string) || '0') + 20}px`,
              },
            }
            designStore.addComponent(newComponent)
            message.success('已粘贴组件')
          }
          break
        case 'delete':
          designStore.deleteComponent(selectedComponent.id)
          message.success('已删除组件')
          break
        case 'moveUp':
          designStore.moveComponent(selectedComponent.id, 'up')
          message.success('已上移一层')
          break
        case 'moveDown':
          designStore.moveComponent(selectedComponent.id, 'down')
          message.success('已下移一层')
          break
        case 'group':
          // TODO: 实现组合功能
          message.info('组合功能开发中')
          break
        case 'ungroup':
          // TODO: 实现取消组合功能
          message.info('取消组合功能开发中')
          break
      }

      showContextMenu.value = false
    }

    // 处理点击画布
    const handleCanvasClick = (e: MouseEvent) => {
      if (e.target === canvasRef.value) {
        designStore.clearSelection()
      }
      showContextMenu.value = false
    }

    // 处理点击组件
    const handleComponentClick = (e: MouseEvent, component: Component) => {
      e.stopPropagation()
      designStore.selectComponent(component.id)
    }

    // 处理组件拖动
    const handleComponentDragStart = (e: DragEvent, component: Component) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('componentId', component.id)
        designStore.selectComponent(component.id)
      }
    }

    // 清理事件监听
    onMounted(() => {
      document.addEventListener('click', handleContextMenuOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleContextMenuOutside)
    })

    return () => (
      <div
        ref={canvasRef}
        class="drag-drop-canvas"
        onDrop={handleDrop}
        onDragover={handleDragOver}
        onClick={handleCanvasClick}
        onContextmenu={handleContextMenu}
      >
        {designStore.components.map((component) => (
          <div
            key={component.id}
            class={['component-wrapper', { selected: component.id === designStore.selectedId }]}
            onClick={(e) => handleComponentClick(e, component)}
            onContextmenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              designStore.selectComponent(component.id)
              handleContextMenu(e)
            }}
            draggable
            onDragstart={(e) => handleComponentDragStart(e, component)}
          >
            {/* 渲染组件 */}
            <ComponentRenderer component={component} />
          </div>
        ))}

        {/* 右键菜单 */}
        {showContextMenu.value && (
          <Menu
            onClick={handleMenuClick}
            class="context-menu"
            style={{
              left: `${contextMenuPosition.value.x}px`,
              top: `${contextMenuPosition.value.y}px`,
            }}
          >
            {contextMenuItems.map((item) =>
              item.type === 'divider' ? (
                <Menu.Divider key={Math.random()} />
              ) : (
                <Menu.Item
                  key={item.key}
                  icon={item.icon}
                  danger={item.danger}
                  disabled={item.disabled}
                >
                  {item.label}
                </Menu.Item>
              ),
            )}
          </Menu>
        )}
      </div>
    )
  },
})
