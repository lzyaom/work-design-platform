import { defineComponent, ref, computed } from 'vue'
import type { PropType } from 'vue'
import { Form, Select, Input, Button, Modal } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { DataConfigProps } from '../types'
import type { DataSource, DataBinding } from '@/types/component'
import MonacoEditor from '@/components/MonacoEditor'
import './style.css'

const { Item: FormItem } = Form

// 组件状态接口
interface ComponentState {
  dataSource: DataSource
  dataBindings: DataBinding[]
}

export const DataConfig = defineComponent({
  name: 'DataConfig',

  props: {
    component: {
      type: Object as PropType<DataConfigProps['component']>,
      required: true
    },
    onChange: {
      type: Function as PropType<DataConfigProps['onChange']>,
      required: true
    }
  },

  setup(props) {
    const showTransformModal = ref(false)
    const currentBinding = ref<DataBinding | null>(null)
    const transformCode = ref('')

    // 组件状态计算属性
    const state = computed<ComponentState>(() => ({
      dataSource: props.component.dataSource || {
        id: `${props.component.id}_source`,
        type: 'static',
        config: {}
      },
      dataBindings: props.component.dataBindings || []
    }))

    // 更新组件状态
    const updateState = (newState: Partial<ComponentState>) => {
      props.onChange({
        ...state.value.dataSource,
        ...newState
      })
    }

    // 处理数据源类型变更
    const handleSourceTypeChange = (value: SelectProps['value']) => {
      if (value === 'static' || value === 'api' || value === 'component') {
        updateState({
          dataSource: {
            ...state.value.dataSource,
            type: value,
            config: {}
          }
        })
      }
    }

    // 处理数据源配置变更
    const handleSourceConfigChange = (key: string, value: any) => {
      updateState({
        dataSource: {
          ...state.value.dataSource,
          config: {
            ...state.value.dataSource.config,
            [key]: value
          }
        }
      })
    }

    // 处理数据绑定更新
    const updateBindings = (bindings: DataBinding[]) => {
      updateState({ dataBindings: bindings })
    }

    // 显示转换函数编辑器
    const showTransformEditor = (binding: DataBinding) => {
      currentBinding.value = binding
      transformCode.value = binding.transform || `function transform(value) {\n  return value\n}`
      showTransformModal.value = true
    }

    // 保存转换函数
    const saveTransform = () => {
      if (!currentBinding.value) return
      
      const bindings = [...state.value.dataBindings]
      const index = bindings.findIndex(b => 
        b.targetProperty === currentBinding.value?.targetProperty
      )

      if (index > -1) {
        bindings[index] = {
          ...bindings[index],
          transform: transformCode.value
        }
        updateBindings(bindings)
      }

      showTransformModal.value = false
      currentBinding.value = null
      transformCode.value = ''
    }

    // 添加数据绑定
    const addBinding = () => {
      const bindings = [...state.value.dataBindings]
      bindings.push({
        targetProperty: '',
        sourceId: state.value.dataSource.id,
        sourcePath: ''
      })
      updateBindings(bindings)
    }

    // 删除数据绑定
    const removeBinding = (index: number) => {
      const bindings = [...state.value.dataBindings]
      bindings.splice(index, 1)
      updateBindings(bindings)
    }

    // 更新绑定配置
    const updateBinding = (index: number, key: keyof DataBinding, value: string) => {
      const bindings = [...state.value.dataBindings]
      bindings[index] = {
        ...bindings[index],
        [key]: value
      }
      updateBindings(bindings)
    }

    return () => (
      <div class="data-config">
        <Form layout="vertical">
          {/* 数据源配置 */}
          <FormItem label="数据源类型">
            <Select
              value={state.value.dataSource.type}
              onChange={handleSourceTypeChange}
            >
              <Select.Option value="static">静态数据</Select.Option>
              <Select.Option value="api">API接口</Select.Option>
              <Select.Option value="component">组件数据</Select.Option>
            </Select>
          </FormItem>

          {/* 数据源具体配置 */}
          {state.value.dataSource.type === 'api' && (
            <>
              <FormItem label="API地址">
                <Input
                  value={state.value.dataSource.config.api?.url || ''}
                  onChange={e => handleSourceConfigChange('api.url', e.target.value || '')}
                />
              </FormItem>
              <FormItem label="请求方法">
                <Select
                  value={state.value.dataSource.config.api?.method || 'GET'}
                  onChange={val => handleSourceConfigChange('api.method', val)}
                >
                  <Select.Option value="GET">GET</Select.Option>
                  <Select.Option value="POST">POST</Select.Option>
                  <Select.Option value="PUT">PUT</Select.Option>
                  <Select.Option value="DELETE">DELETE</Select.Option>
                </Select>
              </FormItem>
            </>
          )}

          {state.value.dataSource.type === 'static' && (
            <FormItem label="静态数据">
              <Input.TextArea
                value={JSON.stringify(state.value.dataSource.config.static?.data || {}, null, 2)}
                onChange={e => {
                  try {
                    const data = JSON.parse(e.target.value || '{}')
                    handleSourceConfigChange('static.data', data)
                  } catch {}
                }}
                rows={4}
              />
            </FormItem>
          )}

          {state.value.dataSource.type === 'component' && (
            <>
              <FormItem label="组件ID">
                <Input
                  value={state.value.dataSource.config.component?.id || ''}
                  onChange={e => handleSourceConfigChange('component.id', e.target.value || '')}
                />
              </FormItem>
              <FormItem label="属性路径">
                <Input
                  value={state.value.dataSource.config.component?.property || ''}
                  onChange={e => handleSourceConfigChange('component.property', e.target.value || '')}
                />
              </FormItem>
            </>
          )}

          {/* 数据绑定配置 */}
          <div class="data-bindings">
            <div class="data-bindings-header">
              <h4>数据绑定</h4>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={addBinding}
              >
                添加绑定
              </Button>
            </div>

            {state.value.dataBindings.map((binding, index) => (
              <div key={index} class="data-binding-item">
                <Input
                  class="target-property"
                  placeholder="目标属性"
                  value={binding.targetProperty}
                  onChange={e => updateBinding(index, 'targetProperty', e.target.value || '')}
                />
                <Input
                  class="source-path"
                  placeholder="数据路径"
                  value={binding.sourcePath}
                  onChange={e => updateBinding(index, 'sourcePath', e.target.value || '')}
                />
                <div class="binding-actions">
                  <Button
                    type="link"
                    onClick={() => showTransformEditor(binding)}
                  >
                    转换函数
                  </Button>
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeBinding(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Form>

        {/* 转换函数编辑器 */}
        <Modal
          title="编辑转换函数"
          open={showTransformModal.value}
          onOk={saveTransform}
          onCancel={() => {
            showTransformModal.value = false
            currentBinding.value = null
            transformCode.value = ''
          }}
          width={800}
        >
          <MonacoEditor
            modelValue={transformCode.value}
            onChange={val => transformCode.value = val}
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
        </Modal>
      </div>
    )
  }
})

export default DataConfig