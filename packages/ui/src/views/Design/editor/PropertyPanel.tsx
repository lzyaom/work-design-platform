import { defineComponent, ref, watch, type PropType } from 'vue'
import { Tabs, Form, Input, InputNumber, Select, Switch } from 'ant-design-vue'

import type { Component, ComponentStyle } from '@/types/component'
import './PropertyPanel.css'

export default defineComponent({
  name: 'PropertyPanel',
  props: {
    component: {
      type: Object as PropType<Component>,
      default: null,
    },
    onUpdate: {
      type: Function as PropType<(component: Component) => void>,
      required: true,
    },
  },
  setup(props) {
    const activeTab = ref('style')
    const formRef = ref()

    // 监听组件变化
    watch(
      () => props.component,
      (newComponent) => {
        if (newComponent) {
          formRef.value?.setFieldsValue({
            ...newComponent.styles,
            ...newComponent.props,
          })
        }
      },
      { immediate: true },
    )

    // 处理样式更新
    const handleStyleChange = (changedValues: ComponentStyle) => {
      if (!props.component) return

      const updatedComponent = {
        ...props.component,
        style: {
          ...props.component.styles,
          ...changedValues,
        },
      }
      props.onUpdate(updatedComponent)
    }

    // 处理属性更新
    const handlePropsChange = (changedValues: Component['props']) => {
      if (!props.component) return

      const updatedComponent = {
        ...props.component,
        props: {
          ...props.component.props,
          ...changedValues,
        },
      }
      props.onUpdate(updatedComponent)
    }

    // 渲染样式配置
    const renderStyleConfig = () => {
      if (!props.component) return null

      return (
        <Form
          ref={formRef}
          layout="vertical"
          onValuesChange={handleStyleChange}
          class="property-form"
        >
          <Form.Item label="宽度" name="width">
            <InputNumber class="w-full" min={0} addonAfter="px" />
          </Form.Item>
          <Form.Item label="高度" name="height">
            <InputNumber class="w-full" min={0} addonAfter="px" />
          </Form.Item>
          <Form.Item label="字体大小" name="fontSize">
            <InputNumber class="w-full" min={0} addonAfter="px" />
          </Form.Item>
          <Form.Item label="背景颜色" name="backgroundColor">
            <Input type="color" class="w-full" />
          </Form.Item>
          <Form.Item label="文字颜色" name="color">
            <Input type="color" class="w-full" />
          </Form.Item>
          <Form.Item label="边框" name="border">
            <Input />
          </Form.Item>
          <Form.Item label="圆角" name="borderRadius">
            <InputNumber class="w-full" min={0} addonAfter="px" />
          </Form.Item>
          <Form.Item label="透明度" name="opacity">
            <InputNumber class="w-full" min={0} max={1} step={0.1} />
          </Form.Item>
          <Form.Item label="动画" name="animation">
            <Select>
              <Select.Option value="none">无</Select.Option>
              <Select.Option value="fade">淡入淡出</Select.Option>
              <Select.Option value="slide">滑动</Select.Option>
              <Select.Option value="bounce">弹跳</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      )
    }

    // 渲染逻辑配置
    const renderLogicConfig = () => {
      if (!props.component) return null

      return (
        <Form
          ref={formRef}
          layout="vertical"
          onValuesChange={handlePropsChange}
          class="property-form"
        >
          {/* 基础属性配置 */}
          <Form.Item label="名称" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="标题" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="是否可见" name="visible">
            <Switch />
          </Form.Item>
          <Form.Item label="是否禁用" name="disabled">
            <Switch />
          </Form.Item>

          {/* 事件配置 */}
          <div class="event-config">
            <h3 class="text-sm font-medium mb-2">事件配置</h3>
            <Form.Item label="点击事件" name="onClick">
              <Select>
                <Select.Option value="">无</Select.Option>
                <Select.Option value="openUrl">打开链接</Select.Option>
                <Select.Option value="showMessage">显示消息</Select.Option>
                <Select.Option value="customFunction">自定义函数</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="鼠标悬停事件" name="onHover">
              <Select>
                <Select.Option value="">无</Select.Option>
                <Select.Option value="showTooltip">显示提示</Select.Option>
                <Select.Option value="changeStyle">改变样式</Select.Option>
                <Select.Option value="customFunction">自定义函数</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      )
    }

    return () => (
      <div class="property-panel">
        <Tabs v-model:activeKey={activeTab.value} class="property-tabs">
          <Tabs.TabPane key="style" tab="样式">
            {renderStyleConfig()}
          </Tabs.TabPane>
          <Tabs.TabPane key="logic" tab="逻辑">
            {renderLogicConfig()}
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  },
})
