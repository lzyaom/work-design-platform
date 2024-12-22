import { defineComponent, ref, onMounted } from 'vue'
import {
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  ExportOutlined,
  EyeOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'
import { Button, Avatar, Tooltip, message } from 'ant-design-vue'
import ComponentPalette from './ComponentPalette.tsx'
import DragDropCanvas from './DragDropCanvas.tsx'
import PropertyPanel from './PropertyPanel.tsx'
import { useDesignStore } from '@/stores/design.ts'
import type { Component } from '@/types/component'
import './index.css'

export default defineComponent({
  name: 'DesignEditor',
  setup() {
    const designStore = useDesignStore()
    const selectedComponent = ref<Component | null>(null)
    const collaborators = ref([
      {
        id: '1',
        name: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        online: true,
      },
      {
        id: '2',
        name: '李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        online: true,
      },
    ])

    // 历史记录
    const canUndo = ref(false)
    const canRedo = ref(false)

    // 处理组件选择
    const handleComponentSelect = (component: Component | null) => {
      selectedComponent.value = component
    }

    // 处理组件更新
    const handleComponentUpdate = (component: Component) => {
      designStore.updateComponent(component)
    }

    // 历史记录操作
    const handleUndo = () => {
      designStore.undo()
      message.success('已撤销')
    }

    const handleRedo = () => {
      designStore.redo()
      message.success('已重做')
    }

    // 保存操作
    const handleSave = async () => {
      try {
        await designStore.saveDesign()
        message.success('保存成功')
      } catch (error) {
        console.error('保存失败', error)
        message.error('保存失败')
      }
    }

    // 导出操作
    const handleExport = async () => {
      try {
        await designStore.exportDesign()
        message.success('导出成功')
      } catch (error) {
        console.error('导出失败', error)
        message.error('导出失败')
      }
    }

    // 预览操作
    const handlePreview = () => {
      window.open('/preview', '_blank')
    }

    onMounted(() => {
      // 初始化设计数据
      designStore.initDesign()
    })

    return () => (
      <div class="design-editor">
        <header class="editor-header glass-header">
          <div class="flex items-center justify-between px-4 w-full">
            <div class="flex items-center">
              <h1 class="text-lg font-medium mr-8">设计项目名称</h1>
              <div class="flex gap-2">
                <Tooltip title="撤销">
                  <Button
                    type="text"
                    class="glass-button"
                    disabled={!canUndo.value}
                    onClick={handleUndo}
                  >
                    <UndoOutlined />
                  </Button>
                </Tooltip>
                <Tooltip title="重做">
                  <Button
                    type="text"
                    class="glass-button"
                    disabled={!canRedo.value}
                    onClick={handleRedo}
                  >
                    <RedoOutlined />
                  </Button>
                </Tooltip>
                <Tooltip title="保存">
                  <Button type="text" class="glass-button" onClick={handleSave}>
                    <SaveOutlined />
                  </Button>
                </Tooltip>
                <Tooltip title="导出">
                  <Button type="text" class="glass-button" onClick={handleExport}>
                    <ExportOutlined />
                  </Button>
                </Tooltip>
                <Tooltip title="预览">
                  <Button type="text" class="glass-button" onClick={handlePreview}>
                    <EyeOutlined />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center">
                <TeamOutlined class="mr-2" />
                <Avatar.Group>
                  {collaborators.value.map((user) => (
                    <Tooltip key={user.id} title={`${user.name}${user.online ? ' (在线)' : ''}`}>
                      <Avatar
                        src={user.avatar}
                        class={user.online ? 'ring-2 ring-green-400' : ''}
                      />
                    </Tooltip>
                  ))}
                </Avatar.Group>
              </div>
            </div>
          </div>
        </header>
        <div class="editor-main flex">
          <aside class="component-sider glass-sider w-[280px]">
            <ComponentPalette />
          </aside>
          <div class="canvas-content flex-1">
            <DragDropCanvas
              components={designStore.components}
              onSelect={handleComponentSelect}
              onUpdate={handleComponentUpdate}
            />
          </div>
          <aside class="property-sider glass-sider w-[300px]">
            <PropertyPanel
              component={selectedComponent.value as Component}
              onUpdate={handleComponentUpdate}
            />
          </aside>
        </div>
      </div>
    )
  },
})
