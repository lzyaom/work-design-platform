import { defineComponent, ref } from 'vue'
import {
  AppstoreOutlined,
  LayoutOutlined,
  BlockOutlined,
  AreaChartOutlined,
  ApiOutlined,
} from '@ant-design/icons-vue'
import { Menu } from 'ant-design-vue'
import type { MenuProps } from 'ant-design-vue'
// import { useDraggable } from '@vueuse/core'
import {
  basicComponents,
  containerComponents,
  complexComponents,
  chartComponents,
  thirdPartyComponents,
} from './config/components'
import type { Component } from '@/types/component'
import './ComponentPalette.css'

const { SubMenu } = Menu

export default defineComponent({
  name: 'ComponentPalette',
  setup() {
    const selectedKeys = ref<string[]>(['basic'])
    const openKeys = ref<string[]>(['basic'])

    // 菜单配置
    const menuItems = [
      {
        key: 'basic',
        icon: <AppstoreOutlined />,
        title: '基础组件',
        components: basicComponents,
      },
      {
        key: 'container',
        icon: <LayoutOutlined />,
        title: '容器组件',
        components: containerComponents,
      },
      {
        key: 'complex',
        icon: <BlockOutlined />,
        title: '复杂组件',
        components: complexComponents,
      },
      {
        key: 'chart',
        icon: <AreaChartOutlined />,
        title: '图表组件',
        components: chartComponents,
      },
      {
        key: 'third-party',
        icon: <ApiOutlined />,
        title: '第三方组件',
        components: thirdPartyComponents,
      },
    ]

    // 处理菜单展开/收起
    const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
      openKeys.value = keys as string[]
    }

    // 处理菜单选择
    const handleSelect: MenuProps['onSelect'] = ({ key }) => {
      selectedKeys.value = [key as string]
    }

    // 处理组件拖拽
    const handleDragStart = (e: DragEvent, component: Component) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('component', JSON.stringify(component))
        e.dataTransfer.effectAllowed = 'copy'

        // 创建拖拽预览
        const preview = document.createElement('div')
        preview.className = 'component-drag-preview'
        preview.innerHTML = `
          <div class="preview-card">
            <i class="${component.icon}"></i>
            <span>${component.title}</span>
          </div>
        `
        document.body.appendChild(preview)

        // 设置拖拽图像
        e.dataTransfer.setDragImage(preview, preview.offsetWidth / 2, preview.offsetHeight / 2)

        // 清理预览元素
        requestAnimationFrame(() => {
          document.body.removeChild(preview)
        })
      }
    }

    return () => (
      <div class="component-palette">
        <Menu
          v-model:selectedKeys={selectedKeys.value}
          v-model:openKeys={openKeys.value}
          mode="inline"
          class="component-menu"
          onOpenChange={handleOpenChange}
          onSelect={handleSelect}
        >
          {menuItems.map((item) => (
            <SubMenu
              key={item.key}
              v-slots={{
                icon: () => item.icon,
                title: () => item.title,
              }}
            >
              <div class="component-grid">
                {item.components.map((component: Component) => (
                  <div
                    key={component.type}
                    class="component-card"
                    draggable
                    onDragstart={(e: DragEvent) => handleDragStart(e, component)}
                  >
                    <div class="component-item">
                      <i class={component.icon} />
                      <span>{component.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SubMenu>
          ))}
        </Menu>
      </div>
    )
  },
})
