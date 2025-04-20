import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { Tabs } from 'ant-design-vue'
import type { TabsProps } from 'ant-design-vue'
import { usePropertyPanel } from './hooks/usePropertyPanel'
import BasePropConfig from './components/BasePropConfig'
import DataConfig from './components/DataConfig'
import EventConfig from './components/EventConfig'
import StyleConfig from './components/StyleConfig'
import type { Component, PropValue, DataSource, EventHandler, StyleValue } from '@/types/component'
import type { TabKey } from './types'
import './style.css'

const { TabPane } = Tabs

// 组件属性接口
export interface PropertyPanelProps {
  component: Component | null
  onChange?: (component: Component) => void
}

// 组件更新器接口
interface ComponentUpdate {
  props?: Record<string, PropValue>
  dataSource?: DataSource
  events?: EventHandler[]
  style?: StyleValue
}

export const PropertyPanel = defineComponent({
  name: 'PropertyPanel',
  components: {},
  props: {
    component: {
      type: [Object, null] as PropType<Component | null>,
      required: true,
    },
    // onChange: {
    //   type: Function as PropType<(component: Component) => void>,
    //   required: true
    // }
  },

  setup(props: PropertyPanelProps) {
    const { activeTab } =
      usePropertyPanel()

    // Tab切换处理
    const handleTabChange = (key: TabsProps['activeKey']) => {
      if (typeof key === 'string') {
        activeTab.value = key as TabKey
      }
    }

    // 更新组件
    const updateComponent = (updates: ComponentUpdate) => {
      if (!props.component) return
      // props.onChange({
      //   ...props.component,
      //   ...updates
      // })
    }

    // 处理属性更新
    const handlePropertyChange = (key: string, value: PropValue) => {
      updateComponent({
        props: {
          ...(props.component?.props || {}),
          [key]: value,
        },
      })
    }

    // 处理数据源更新
    const handleDataSourceChange = (dataSource: DataSource) => {
      updateComponent({ dataSource })
    }

    // 处理事件更新
    const handleEventsChange = (component: Component) => {
      if (component.events) {
        updateComponent({ events: component.events })
      }
    }

    // 处理样式更新
    const handleStyleUpdate = (component: Component) => {
      if (component.style) {
        updateComponent({ style: component.style })
      }
    }

    return {
      activeTab,
      handleTabChange,
      handlePropertyChange,
      handleDataSourceChange,
      handleEventsChange,
      handleStyleUpdate,
    }
  },
  render() {
    if (!this.component) {
      return (
        <div class="property-panel property-panel--empty">
          <p>请选择一个组件进行配置</p>
        </div>
      )
    }
    return (
      <div class="property-panel">
        <div class="property-panel-header">
          <h3 class="component-name">{this.component.type}</h3>
        </div>

        <Tabs
          v-model:activeKey={this.activeTab}
          onChange={this.handleTabChange}
          class="property-panel-tabs"
          animated={false}
        >
          <TabPane key="props" tab="属性">
            <BasePropConfig component={this.component} onChange={this.handlePropertyChange} />
          </TabPane>

          <TabPane key="data" tab="数据">
            <DataConfig component={this.component} onChange={this.handleDataSourceChange} />
          </TabPane>

          <TabPane key="event" tab="事件">
            <EventConfig component={this.component} onChange={this.handleEventsChange} />
          </TabPane>

          <TabPane key="style" tab="样式">
            <StyleConfig component={this.component} onChange={this.handleStyleUpdate} />
          </TabPane>
        </Tabs>
      </div>
    )
  },
})

export default PropertyPanel
