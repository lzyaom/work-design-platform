import { defineComponent, ref } from 'vue'
import {
  LayoutOutlined,
  FormOutlined,
  TableOutlined,
  BarChartOutlined,
  BoxPlotOutlined,
  CloseOutlined,
  LineChartOutlined,
  DotChartOutlined,
  CloudServerOutlined,
} from '@ant-design/icons-vue'
import { Tooltip } from 'ant-design-vue'
import './ComponentPalette.css'

interface ComponentItem {
  type: string
  title: string
  icon:
    | string
    | typeof FormOutlined
    | typeof LayoutOutlined
    | typeof TableOutlined
    | typeof BarChartOutlined
    | typeof LineChartOutlined
    | typeof DotChartOutlined
  preview?: string
}

interface CategoryItem {
  key: string
  title: string
  icon:
    | typeof FormOutlined
    | typeof LayoutOutlined
    | typeof TableOutlined
    | typeof BarChartOutlined
    | typeof BoxPlotOutlined
    | typeof CloudServerOutlined
  components: ComponentItem[]
}

export default defineComponent({
  name: 'ComponentPalette',
  setup() {
    const selectedCategory = ref<string | null>(null)
    const draggingComponent = ref<string | null>(null)

    // 组件分类
    const componentCategories: CategoryItem[] = [
      {
        key: 'basic',
        title: '基础组件',
        icon: FormOutlined,
        components: [
          {
            type: 'button',
            title: '按钮',
            icon: 'button-icon.svg',
            preview: 'button-preview.png',
          },
          {
            type: 'input',
            title: '输入框',
            icon: 'input-icon.svg',
            preview: 'input-preview.png',
          },
          {
            type: 'select',
            title: '下拉选择',
            icon: 'select-icon.svg',
            preview: 'select-preview.png',
          },
          {
            type: 'radio',
            title: '单选框',
            icon: 'radio-icon.svg',
            preview: 'radio-preview.png',
          },
          {
            type: 'checkbox',
            title: '复选框',
            icon: 'checkbox-icon.svg',
            preview: 'checkbox-preview.png',
          },
          {
            type: 'switch',
            title: '开关',
            icon: 'switch-icon.svg',
            preview: 'switch-preview.png',
          },
          {
            type: 'slider',
            title: '滑块',
            icon: 'slider-icon.svg',
            preview: 'slider-preview.png',
          },
          {
            type: 'rate',
            title: '评分',
            icon: 'rate-icon.svg',
            preview: 'rate-preview.png',
          },
          {
            type: 'upload',
            title: '上传',
            icon: 'upload-icon.svg',
            preview: 'upload-preview.png',
          },
        ],
      },
      {
        key: 'container',
        title: '容器组件',
        icon: LayoutOutlined,
        components: [
          {
            type: 'grid',
            title: '栅格布局',
            icon: 'grid-icon.svg',
            preview: 'grid-preview.png',
          },
          {
            type: 'card',
            title: '卡片',
            icon: 'card-icon.svg',
            preview: 'card-preview.png',
          },
          {
            type: 'tabs',
            title: '标签页',
            icon: 'tabs-icon.svg',
            preview: 'tabs-preview.png',
          },
          {
            type: 'collapse',
            title: '折叠面板',
            icon: 'collapse-icon.svg',
            preview: 'collapse-preview.png',
          },
          {
            type: 'modal',
            title: '对话框',
            icon: 'modal-icon.svg',
            preview: 'modal-preview.png',
          },
          {
            type: 'drawer',
            title: '抽屉',
            icon: 'drawer-icon.svg',
            preview: 'drawer-preview.png',
          },
          {
            type: 'divider',
            title: '分割线',
            icon: 'divider-icon.svg',
            preview: 'divider-preview.png',
          },
          {
            type: 'space',
            title: '间距',
            icon: 'space-icon.svg',
            preview: 'space-preview.png',
          },
        ],
      },
      {
        key: 'data',
        title: '数据组件',
        icon: TableOutlined,
        components: [
          {
            type: 'table',
            title: '表格',
            icon: 'table-icon.svg',
            preview: 'table-preview.png',
          },
          {
            type: 'list',
            title: '列表',
            icon: 'list-icon.svg',
            preview: 'list-preview.png',
          },
          {
            type: 'tree',
            title: '树形控件',
            icon: 'tree-icon.svg',
            preview: 'tree-preview.png',
          },
          {
            type: 'descriptions',
            title: '描述列表',
            icon: 'descriptions-icon.svg',
            preview: 'descriptions-preview.png',
          },
          {
            type: 'statistic',
            title: '统计数值',
            icon: 'statistic-icon.svg',
            preview: 'statistic-preview.png',
          },
          {
            type: 'timeline',
            title: '时间轴',
            icon: 'timeline-icon.svg',
            preview: 'timeline-preview.png',
          },
          {
            type: 'calendar',
            title: '日历',
            icon: 'calendar-icon.svg',
            preview: 'calendar-preview.png',
          },
          {
            type: 'carousel',
            title: '轮播图',
            icon: 'carousel-icon.svg',
            preview: 'carousel-preview.png',
          },
        ],
      },
      {
        key: 'chart',
        title: '图表组件',
        icon: BarChartOutlined,
        components: [
          {
            type: 'line-chart',
            title: '折线图',
            icon: LineChartOutlined,
            preview: 'line-chart-preview.png',
          },
          {
            type: 'bar-chart',
            title: '柱状图',
            icon: BarChartOutlined,
            preview: 'bar-chart-preview.png',
          },
          {
            type: 'pie-chart',
            title: '饼图',
            icon: DotChartOutlined,
            preview: 'pie-chart-preview.png',
          },
        ],
      },
      {
        key: '3d',
        title: '3D组件',
        icon: BoxPlotOutlined,
        components: [
          {
            type: '3d-model',
            title: '3D模型',
            icon: 'model-icon.svg',
            preview: 'model-preview.png',
          },
          {
            type: '3d-scene',
            title: '3D场景',
            icon: 'scene-icon.svg',
            preview: 'scene-preview.png',
          },
        ],
      },
      {
        key: 'third-party',
        title: '第三方组件',
        icon: CloudServerOutlined,
        components: [
          {
            type: 'map',
            title: '地图',
            icon: 'map-icon.svg',
            preview: 'map-preview.png',
          },
          {
            type: 'video',
            title: '视频播放器',
            icon: 'video-icon.svg',
            preview: 'video-preview.png',
          },
        ],
      },
    ]

    // 处理分类点击
    const handleCategoryClick = (key: string) => {
      selectedCategory.value = selectedCategory.value === key ? null : key
    }

    // 处理组件拖拽开始
    const handleDragStart = (e: DragEvent, component: ComponentItem) => {
      if (!e.dataTransfer) return

      const componentData = {
        type: component.type,
        title: component.title,
        icon: component.icon,
      }
      draggingComponent.value = component.type
      e.dataTransfer.setData('component-data', JSON.stringify(componentData))
      e.dataTransfer.effectAllowed = 'copy'
      // 设置拖拽时的视觉效果
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('dragging')
      }
    }

    // 处理组件拖拽结束
    const handleDragEnd = (e: DragEvent) => {
      draggingComponent.value = null
      if (e.target instanceof HTMLElement) {
        e.target.classList.remove('dragging')
      }
    }

    return () => (
      <div class="component-palette">
        <div class="category-icons">
          {componentCategories.map((category) => (
            <Tooltip key={category.key} title={category.title} placement="right">
              <div
                class={`category-icon ${selectedCategory.value === category.key ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.key)}
              >
                <category.icon />
              </div>
            </Tooltip>
          ))}
        </div>
        {selectedCategory.value && (
          <div class="component-drawer">
            <div class="drawer-header">
              <h3>{componentCategories.find((c) => c.key === selectedCategory.value)?.title}</h3>
              <CloseOutlined class="close-icon" onClick={() => (selectedCategory.value = null)} />
            </div>
            <div class="component-grid">
              {componentCategories
                .find((category) => category.key === selectedCategory.value)
                ?.components.map((component) => (
                  <div
                    key={component.type}
                    class={`component-card ${draggingComponent.value === component.type ? 'dragging' : ''}`}
                    draggable
                    onDragstart={(e: DragEvent) => handleDragStart(e, component)}
                    onDragend={handleDragEnd}
                  >
                    <div class="component-item">
                      {typeof component.icon === 'string' ? (
                        <img src={component.icon} alt={component.title} class="w-8 h-8" />
                      ) : (
                        <component.icon class="text-2xl" />
                      )}
                      <span>{component.title}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  },
})
