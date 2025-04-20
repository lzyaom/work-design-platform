import { defineComponent, ref, computed } from 'vue'
import type { PropType } from 'vue'
import { Form, Input, Select, Button, Modal, Tooltip } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import type { DefaultOptionType } from 'ant-design-vue/es/select'
import { PlusOutlined, DeleteOutlined, CodeOutlined } from '@ant-design/icons-vue'
import MonacoEditor from '@/components/MonacoEditor'
import type { EventConfigProps } from '../types'
import type { Component, EventHandler, EventType } from '@/types/component'
import './EventConfig.css'

const { Item: FormItem } = Form

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: '点击', value: 'click' },
  { label: '变更', value: 'change' },
  { label: '输入', value: 'input' },
  { label: '焦点', value: 'focus' },
  { label: '失焦', value: 'blur' },
  { label: '挂载', value: 'mounted' },
  { label: '更新', value: 'updated' },
  { label: '自定义', value: 'custom' }
]

export const EventConfig = defineComponent({
  name: 'EventConfig',

  props: {
    component: {
      type: Object as PropType<EventConfigProps['component']>,
      required: true
    },
    onChange: {
      type: Function as PropType<(component: Component) => void>,
      required: true
    }
  },

  setup(props) {
    const showEventEditor = ref(false)
    const currentEvent = ref<EventHandler | null>(null)
    const eventCode = ref('')

    // 事件列表
    const events = computed(() => props.component.events || [])

    // 显示事件编辑器
    const showEditor = (event: EventHandler) => {
      currentEvent.value = event
      eventCode.value = event.handler || `function handler(event) {\n  // 在这里编写事件处理逻辑\n}`
      showEventEditor.value = true
    }

    // 保存事件处理器
    const saveEvent = () => {
      if (!currentEvent.value) return

      const eventList = [...events.value]
      const index = eventList.findIndex(e => 
        e.type === currentEvent.value?.type && 
        e.name === currentEvent.value?.name
      )

      if (index > -1) {
        eventList[index] = {
          ...eventList[index],
          handler: eventCode.value
        }
      } else {
        eventList.push({
          ...currentEvent.value,
          handler: eventCode.value
        })
      }

      props.onChange({
        ...props.component,
        events: eventList
      })

      showEventEditor.value = false
      currentEvent.value = null
      eventCode.value = ''
    }

    // 添加新事件
    const addEvent = () => {
      const newEvent: EventHandler = {
        type: 'click',
        name: `event_${Date.now()}`,
        description: '',
        handler: `function handler(event) {\n  // 在这里编写事件处理逻辑\n}`,
        dependencies: []
      }
      showEditor(newEvent)
    }

    // 删除事件
    const removeEvent = (index: number) => {
      const eventList = [...events.value]
      eventList.splice(index, 1)
      props.onChange({
        ...props.component,
        events: eventList
      })
    }

    // 更新事件配置
    const updateEvent = (index: number, key: keyof EventHandler, value: string) => {
      const eventList = [...events.value]
      eventList[index] = {
        ...eventList[index],
        [key]: value
      }
      props.onChange({
        ...props.component,
        events: eventList
      })
    }

    // 处理事件类型变更
    const handleEventTypeChange = (
      index: number,
      value: SelectProps['value'],
      option: DefaultOptionType | DefaultOptionType[]
    ) => {
      if (typeof value === 'string' && EVENT_TYPES.some(t => t.value === value)) {
        updateEvent(index, 'type', value as EventType)
      }
    }

    return () => (
      <div class="event-config">
        {/* 事件列表 */}
        <div class="events-header">
          <h4>事件处理器</h4>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addEvent}
          >
            添加事件
          </Button>
        </div>

        <div class="events-list">
          {events.value.map((event, index) => (
            <div key={index} class="event-item">
              <div class="event-info">
                <Select
                  class="event-type"
                  value={event.type}
                  onChange={(value, option) => handleEventTypeChange(index, value, option)}
                >
                  {EVENT_TYPES.map(type => (
                    <Select.Option key={type.value} value={type.value}>
                      {type.label}
                    </Select.Option>
                  ))}
                </Select>
                <Input
                  class="event-name"
                  value={event.name}
                  onChange={e => {
                    const value = e.target.value || ''
                    updateEvent(index, 'name', value)
                  }}
                  placeholder="事件名称"
                />
              </div>
              
              <div class="event-desc">
                <Input
                  value={event.description}
                  onChange={e => {
                    const value = e.target.value || ''
                    updateEvent(index, 'description', value)
                  }}
                  placeholder="事件描述"
                />
              </div>

              <div class="event-actions">
                <Tooltip title="编辑处理器">
                  <Button
                    type="link"
                    icon={<CodeOutlined />}
                    onClick={() => showEditor(event)}
                  />
                </Tooltip>
                <Tooltip title="删除事件">
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeEvent(index)}
                  />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>

        {/* 事件编辑器 */}
        <Modal
          title="编辑事件处理器"
          open={showEventEditor.value}
          onOk={saveEvent}
          onCancel={() => {
            showEventEditor.value = false
            currentEvent.value = null
            eventCode.value = ''
          }}
          width={800}
          destroyOnClose
        >
          <div class="event-editor">
            <MonacoEditor
              modelValue={eventCode.value}
              onChange={val => eventCode.value = val}
              language="javascript"
              theme="vs-dark"
              height="400px"
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                folding: true,
                automaticLayout: true
              }}
            />
          </div>
        </Modal>
      </div>
    )
  }
})

export default EventConfig