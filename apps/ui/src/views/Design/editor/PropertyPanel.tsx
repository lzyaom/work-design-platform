import { defineComponent, ref, computed, watch } from 'vue'
import { Form, Input, InputNumber, Select, Tabs, Switch, Button, Tooltip, Modal } from 'ant-design-vue'
import type { SwitchProps } from 'ant-design-vue'
import { CodeOutlined, LinkOutlined } from '@ant-design/icons-vue'
import MonacoEditor from '@/components/MonacoEditor'
import type { SelectProps, InputNumberProps } from 'ant-design-vue'
import type { CSSProperties } from 'vue'
import { useDesignStore } from '@/stores/design'
import { componentSchemas } from './core/componentSchemas'
import type { ComponentType, EventType } from './core/componentSchemas'
import type { Component, DataSource, DataBinding, EventHandler } from '@/types/component'
import type { editor } from 'monaco-editor'

const { TabPane } = Tabs
const { Item: FormItem } = Form

interface PropSchema {
  type: string
  title?: string
  enum?: string[]
}

export default defineComponent({
  name: 'PropertyPanel',
  
  setup() {
    const designStore = useDesignStore()
    const activeTab = ref('style')
    const showCodeEditor = ref(false)
    const currentEditingEvent = ref<EventHandler | null>(null)
    
    // 编辑器配置
    const editorOptions: editor.IStandaloneEditorConstructionOptions = {
      fontSize: 14,
      tabSize: 2,
      suggestOnTriggerCharacters: true,
      snippetSuggestions: 'inline',
      wordWrap: 'off',
      contextmenu: true
    }

    // 计算当前选中的组件
    const selectedComponent = computed(() => designStore.selectedComponent)

    // 计算当前组件的schema
    const componentSchema = computed(() => {
      if (!selectedComponent.value) return null
      return componentSchemas[selectedComponent.value.type as ComponentType]
    })

    // 处理数据源配置
    const handleDataSourceChange = (source: DataSource) => {
      const component = selectedComponent.value
      if (!component) return

      designStore.updateComponent({
        ...component,
        dataSource: source
      })
    }

    // 处理数据绑定配置
    const handleDataBindingChange = (binding: DataBinding) => {
      const component = selectedComponent.value
      if (!component) return

      const bindings = [...(component.dataBindings || [])]
      const index = bindings.findIndex(b => b.targetProperty === binding.targetProperty)
      
      if (index > -1) {
        bindings[index] = binding
      } else {
        bindings.push(binding)
      }

      designStore.updateComponent({
        ...component,
        dataBindings: bindings
      })
    }

    // 处理事件编辑
    const handleEditEvent = (event: EventHandler) => {
      currentEditingEvent.value = event
      showCodeEditor.value = true
    }

    // 保存事件代码
    const handleSaveEvent = () => {
      const component = selectedComponent.value
      if (!component || !currentEditingEvent.value) return
      
      const events = [...(component.events || [])]
      const eventIndex = events.findIndex(e => 
        e.type === currentEditingEvent.value?.type && 
        e.name === currentEditingEvent.value?.name
      )

      if (eventIndex > -1) {
        events[eventIndex] = currentEditingEvent.value
      } else {
        events.push(currentEditingEvent.value)
      }

      designStore.updateComponent({
        ...component,
        events
      })

      showCodeEditor.value = false
      currentEditingEvent.value = null
    }

    // 处理选择框变更
    const handleSelectChange = (value: SelectProps['value']) => {
      return String(value)
    }

    // 处理数字输入框变更
    const handleNumberChange = (value: InputNumberProps['value']) => {
      return typeof value === 'number' ? value : undefined
    }

    // 处理属性更新
    const handlePropChange = (key: string, value: unknown) => {
      const component = selectedComponent.value
      if (!component) return

      designStore.updateComponent({
        ...component,
        props: {
          ...component.props,
          [key]: value
        }
      })
    }

    // 处理开关变更
    const handleSwitchChange = (checked: SwitchProps['checked']) => {
      return checked
    }

    return () => {
      const component = selectedComponent.value
      if (!component) return null

      return (
        <div class="property-panel h-full overflow-y-auto">
          <Tabs v-model:activeKey={activeTab.value}>
            {/* 组件属性配置 */}
            <TabPane key="props" tab="组件属性">
              <Form layout="horizontal">
                {componentSchema.value?.properties.props?.properties &&
                  Object.entries(componentSchema.value.properties.props.properties).map(
                    ([key, prop]) => {
                      const typedProp = prop as PropSchema
                      return (
                        <FormItem key={key} label={typedProp.title || key}>
                          {typedProp.type === 'string' && typedProp.enum ? (
                            <Select
                              value={component.props?.[key] as string}
                              onChange={(value) => handleSelectChange(value)}
                            >
                              {typedProp.enum.map((option) => (
                                <Select.Option key={option} value={option}>
                                  {option}
                                </Select.Option>
                              ))}
                            </Select>
                          ) : typedProp.type === 'boolean' ? (
                            <Switch
                              checked={!!component.props?.[key]}
                              onChange={(_checked: SwitchProps['checked']) => {
                                const newValue = !component.props?.[key]
                                handlePropChange(key, newValue)
                              }}
                            />
                          ) : typedProp.type === 'number' ? (
                            <InputNumber
                              value={component.props?.[key] as number}
                              onChange={(value) => handleNumberChange(value)}
                            />
                          ) : (
                            <Input
                              value={component.props?.[key] as string}
                              onChange={(e: Event) =>
                                (e.target as HTMLInputElement).value
                              }
                            />
                          )}
                        </FormItem>
                      )
                    }
                  )}
              </Form>
            </TabPane>

            {/* 数据配置 */}
            <TabPane key="data" tab="数据配置">
              <Form layout="vertical">
                {/* 数据源配置 */}
                <FormItem label="数据源配置">
                  <Select
                    value={component.dataSource?.type}
                    onChange={(value) => handleDataSourceChange({
                      id: `${component.id}_source`,
                      type: value as DataSource['type'],
                      config: {}
                    })}
                  >
                    <Select.Option value="api">API接口</Select.Option>
                    <Select.Option value="static">静态数据</Select.Option>
                    <Select.Option value="component">组件数据</Select.Option>
                  </Select>
                </FormItem>

                {/* 数据绑定配置 */}
                <FormItem label="数据绑定">
                  <div class="flex items-center space-x-2">
                    <Input
                      placeholder="目标属性"
                      value={component.dataBindings?.[0]?.targetProperty}
                      onChange={(e: Event) => handleDataBindingChange({
                        targetProperty: (e.target as HTMLInputElement).value,
                        sourceId: component.dataBindings?.[0]?.sourceId || '',
                        sourcePath: component.dataBindings?.[0]?.sourcePath || ''
                      })}
                    />
                    <LinkOutlined />
                    <Input
                      placeholder="数据来源"
                      value={component.dataBindings?.[0]?.sourcePath}
                      onChange={(e: Event) => handleDataBindingChange({
                        targetProperty: component.dataBindings?.[0]?.targetProperty || '',
                        sourceId: component.dataBindings?.[0]?.sourceId || '',
                        sourcePath: (e.target as HTMLInputElement).value
                      })}
                    />
                  </div>
                </FormItem>
              </Form>
            </TabPane>

            {/* 事件配置 */}
            <TabPane key="event" tab="事件配置">
              <Form layout="vertical">
                {/* 事件列表 */}
                {(component.events || []).map((event, index) => (
                  <FormItem key={index} label={event.name || `事件${index + 1}`}>
                    <div class="flex items-center space-x-2">
                      <Select value={event.type}>
                        <Select.Option value="click">点击</Select.Option>
                        <Select.Option value="change">变更</Select.Option>
                        <Select.Option value="input">输入</Select.Option>
                      </Select>
                      <Input value={event.description} placeholder="事件描述" />
                      <Tooltip title="编辑事件处理器">
                        <Button
                          type="link"
                          icon={<CodeOutlined />}
                          onClick={() => handleEditEvent(event)}
                        />
                      </Tooltip>
                    </div>
                  </FormItem>
                ))}

                {/* 添加事件按钮 */}
                <Button
                  type="dashed"
                  block
                  onClick={() => handleEditEvent({
                    type: 'click' as EventType,
                    name: `event_${Date.now()}`,
                    handler: 'function(event) {\n  // 在这里编写事件处理逻辑\n}'
                  })}
                >
                  添加事件
                </Button>
              </Form>
            </TabPane>

            {/* 样式配置 */}
            <TabPane key="style" tab="样式配置">
              <Form layout="horizontal">
                {/* 原有的样式配置部分保持不变 */}
              </Form>
            </TabPane>
          </Tabs>

          {/* 代码编辑器弹窗 */}
          <Modal
            title="编辑事件处理器"
            open={showCodeEditor.value}
            onOk={handleSaveEvent}
            onCancel={() => {
              showCodeEditor.value = false
              currentEditingEvent.value = null
            }}
            width={800}
          >
            <MonacoEditor
              modelValue={currentEditingEvent.value?.handler}
              language="javascript"
              theme="vs-dark"
              height="400px"
              options={{
                ...editorOptions,
                minimap: { enabled: false },
                lineNumbers: 'on',
                folding: true,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
              onChange={(value) => {
                if (currentEditingEvent.value) {
                  currentEditingEvent.value.handler = value
                }
              }}
            />
          </Modal>
        </div>
      )
    }
  }
})
