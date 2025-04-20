import { defineComponent, ref, onMounted } from 'vue'
import {
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  ExportOutlined,
  EyeOutlined,
  TeamOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons-vue'
import { Button, Avatar, Tooltip, message } from 'ant-design-vue'
import ComponentBlock from './ComponentBlock.tsx'
import DragDropCanvas from './DragDropCanvas.tsx'
import PropertyPanel from './PropertyPanel/index.tsx'
import { useDesignStore } from '@/stores/design.ts'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'DesignEditor',
  setup() {
    const designStore = useDesignStore()
    const { selectedComponent, canUndo, canRedo } = storeToRefs(designStore)
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
      // designStore.initDesign()
    })


    return {
      collaborators,
      selectedComponent,
      canUndo,
      canRedo,
      handleUndo,
      handleRedo,
      handleSave,
      handleExport,
      handlePreview,
    }
  },
  render () {
    return (
      <div class="design-editor flex flex-col h-screen">
        <header class="editor-header flex justify-between items-center h-16 px-4 bg-indigo-200 backdrop-blur-md shadow-sm">
          <div class="flex items-center">
            <RouterLink to={{ name: 'Design' }} class="flex items-center">
              <ArrowLeftOutlined class="mr-2" />
              返回
            </RouterLink>
            <h1 class="text-lg font-medium mx-8">设计项目名称</h1>
            <div class="flex gap-2">
              <Tooltip title="撤销">
                <Button
                  type="text"
                  class="glass-button"
                  disabled={!this.canUndo}
                  onClick={this.handleUndo}
                >
                  <UndoOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="重做">
                <Button
                  type="text"
                  class="glass-button"
                  disabled={!this.canRedo}
                  onClick={this.handleRedo}
                >
                  <RedoOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="保存">
                <Button type="text" class="glass-button" onClick={this.handleSave}> 
                  <SaveOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="导出">
                <Button type="text" class="glass-button" onClick={this.handleExport}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="预览">
                <Button type="text" class="glass-button" onClick={this.handlePreview}>
                  <EyeOutlined />
                </Button>
              </Tooltip>
            </div>
          </div>
          <div class="flex items-center">
            <TeamOutlined class="mr-2" />
            <Avatar.Group>
              {this.collaborators.map((user) => (
                <Tooltip key={user.id} title={`${user.name}${user.online ? ' (在线)' : ''}`}>
                  <Avatar src={user.avatar} class={user.online ? 'ring-2 ring-green-400' : ''} />
                </Tooltip>
              ))}
            </Avatar.Group>
            <Button type="text" class="ml-4">
              <ShareAltOutlined class="mr-1" />
              邀请
            </Button>
          </div>
        </header>
        <main class="editor-main flex flex-1 overflow-hidden">
          <aside class="component-sider glass-sider w-[280px] border-r border-gray-200">
            <ComponentBlock />
          </aside>
          <div class="canvas-content flex-1 overflow-auto">
            <DragDropCanvas />
          </div>
          <aside class="property-sider w-[300px] border-l border-gray-200 bg-gray-100">
            {this.selectedComponent && (
              <PropertyPanel component={this.selectedComponent} />
            )}
          </aside>
        </main>
      </div>
    )
  }
})
