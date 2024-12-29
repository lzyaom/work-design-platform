import { defineComponent, ref, computed, watch } from 'vue'
import { Form, Input, InputNumber, Select, Tabs, Card, Button } from 'ant-design-vue'
import {
  FontSizeOutlined,
  BgColorsOutlined,
  BorderOutlined,
  LayoutOutlined,
  CodeOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import { useDesignStore } from '@/stores/design'
import './PropertyPanel.css'
import type { ComponentProps, ComponentStyle } from '@/types/component'

const { TabPane } = Tabs
const { Item: FormItem } = Form

export default defineComponent({
  name: 'PropertyPanel',
  setup() {
    const designStore = useDesignStore()
    const activeTab = ref('style')
    const formRef = ref()

    // 计算当前选中的组件
    const selectedComponent = computed(() => designStore.selectedComponent)

    // 样式配置
    const styleConfig = ref<ComponentStyle>({
      // 字体样式
      fontSize: '14px',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
      lineHeight: '1.5',
      letterSpacing: '0',

      // 背景样式
      backgroundColor: 'transparent',
      backgroundImage: '',
      backgroundSize: 'cover',
      backgroundPosition: 'center',

      // 边框样式
      borderWidth: '0',
      borderStyle: 'solid',
      borderColor: '#000000',
      borderRadius: '0',

      // 布局样式
      width: 'auto',
      height: 'auto',
      margin: '0',
      padding: '0',
      position: 'relative',
      display: 'block',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    })

    // 逻辑配置
    const logicConfig = ref({
      // 数据绑定
      dataSource: '',
      dataPath: '',
      defaultValue: '',

      // 事件处理
      events: [
        {
          type: 'click',
          handler: '',
        },
      ],

      // API 配置
      apis: [
        {
          method: 'GET',
          url: '',
          params: {},
          headers: {},
        },
      ],

      // 动画效果
      animations: [
        {
          type: 'fade',
          duration: 300,
          delay: 0,
        },
      ],
    })

    // 监听选中组件变化
    watch(
      () => selectedComponent.value,
      (newComponent) => {
        if (newComponent) {
          // 更新样式配置
          styleConfig.value = {
            ...styleConfig.value,
            ...newComponent.style,
          } as ComponentStyle

          // 更新逻辑配置
          if (newComponent.props) {
            logicConfig.value = {
              ...logicConfig.value,
              ...newComponent.props,
            }
          }
        }
      },
    )

    // 处理样式更新
    const handleStyleChange = (key: keyof ComponentStyle, value: string | number) => {
      if (!selectedComponent.value) return

      const newStyle: ComponentStyle = {
        ...selectedComponent.value.style,
        [key]: value,
      }

      designStore.updateComponent({
        ...selectedComponent.value,
        style: newStyle,
      })
    }

    // 处理逻辑更新
    const handleLogicChange = (key: keyof ComponentProps, value: string | number | boolean) => {
      if (!selectedComponent.value) return

      const newProps = {
        ...selectedComponent.value.props,
        [key]: value,
      }

      designStore.updateComponent({
        ...selectedComponent.value,
        props: newProps,
      })
    }

    // 添加事件处理器
    const addEventHandler = () => {
      logicConfig.value.events.push({
        type: 'click',
        handler: '',
      })
    }

    // 删除事件处理器
    const removeEventHandler = (index: number) => {
      logicConfig.value.events.splice(index, 1)
    }

    // 添加 API 配置
    const addApiConfig = () => {
      logicConfig.value.apis.push({
        method: 'GET',
        url: '',
        params: {},
        headers: {},
      })
    }

    // 删除 API 配置
    const removeApiConfig = (index: number) => {
      logicConfig.value.apis.splice(index, 1)
    }

    // 添加动画效果
    const addAnimation = () => {
      logicConfig.value.animations.push({
        type: 'fade',
        duration: 300,
        delay: 0,
      })
    }

    // 删除动画效果
    const removeAnimation = (index: number) => {
      logicConfig.value.animations.splice(index, 1)
    }

    return () => (
      <div class="property-panel">
        <Card class="property-card">
          {!selectedComponent.value ? (
            <div class="empty-tip">请选择一个组件进行配置</div>
          ) : (
            <Tabs v-model:activeKey={activeTab.value}>
              <TabPane key="style" tab="样式配置">
                <Form ref={formRef} layout="vertical">
                  {/* 字体样式配置 */}
                  <Card
                    size="small"
                    title={
                      <span>
                        <FontSizeOutlined /> 字体样式
                      </span>
                    }
                    class="mb-4"
                  >
                    <FormItem label="字体大小">
                      <InputNumber
                        v-model:value={styleConfig.value.fontSize}
                        addon-after="px"
                        onChange={(value) => handleStyleChange('fontSize', value + 'px')}
                      />
                    </FormItem>
                    <FormItem label="字体粗细">
                      <Select
                        v-model:value={styleConfig.value.fontWeight}
                        onChange={(value) => handleStyleChange('fontWeight', value as string)}
                      >
                        <Select.Option value="normal">正常</Select.Option>
                        <Select.Option value="bold">粗体</Select.Option>
                        <Select.Option value="lighter">细体</Select.Option>
                      </Select>
                    </FormItem>
                    <FormItem label="字体颜色">
                      <Input
                        v-model:value={styleConfig.value.color}
                        onChange={(e) => handleStyleChange('color', e.target.value as string)}
                      />
                    </FormItem>
                  </Card>

                  {/* 背景样式配置 */}
                  <Card
                    size="small"
                    title={
                      <span>
                        <BgColorsOutlined /> 背景样式
                      </span>
                    }
                    class="mb-4"
                  >
                    <FormItem label="背景颜色">
                      <Input
                        v-model:value={styleConfig.value.backgroundColor}
                        onChange={(e) =>
                          handleStyleChange('backgroundColor', e.target.value as string)
                        }
                      />
                    </FormItem>
                    <FormItem label="背景图片">
                      <Input
                        v-model:value={styleConfig.value.backgroundImage}
                        onChange={(e) =>
                          handleStyleChange('backgroundImage', e.target.value as string)
                        }
                        placeholder="输入图片URL"
                      />
                    </FormItem>
                  </Card>

                  {/* 边框样式配置 */}
                  <Card
                    size="small"
                    title={
                      <span>
                        <BorderOutlined /> 边框样式
                      </span>
                    }
                    class="mb-4"
                  >
                    <FormItem label="边框宽度">
                      <InputNumber
                        v-model:value={styleConfig.value.borderWidth}
                        addon-after="px"
                        onChange={(value) => handleStyleChange('borderWidth', value + 'px')}
                      />
                    </FormItem>
                    <FormItem label="边框样式">
                      <Select
                        v-model:value={styleConfig.value.borderStyle}
                        onChange={(value) => handleStyleChange('borderStyle', value as string)}
                      >
                        <Select.Option value="solid">实线</Select.Option>
                        <Select.Option value="dashed">虚线</Select.Option>
                        <Select.Option value="dotted">点线</Select.Option>
                      </Select>
                    </FormItem>
                    <FormItem label="边框颜色">
                      <Input
                        v-model:value={styleConfig.value.borderColor}
                        onChange={(e) => handleStyleChange('borderColor', e.target.value as string)}
                      />
                    </FormItem>
                    <FormItem label="圆角">
                      <InputNumber
                        v-model:value={styleConfig.value.borderRadius}
                        addon-after="px"
                        onChange={(value) => handleStyleChange('borderRadius', value + 'px')}
                      />
                    </FormItem>
                  </Card>

                  {/* 布局样式配置 */}
                  <Card
                    size="small"
                    title={
                      <span>
                        <LayoutOutlined /> 布局样式
                      </span>
                    }
                  >
                    <FormItem label="宽度">
                      <InputNumber
                        v-model:value={styleConfig.value.width}
                        addon-after="px"
                        onChange={(value) => handleStyleChange('width', value + 'px')}
                      />
                    </FormItem>
                    <FormItem label="高度">
                      <InputNumber
                        v-model:value={styleConfig.value.height}
                        addon-after="px"
                        onChange={(value) => handleStyleChange('height', value + 'px')}
                      />
                    </FormItem>
                    <FormItem label="外边距">
                      <Input
                        v-model:value={styleConfig.value.margin}
                        onChange={(e) => handleStyleChange('margin', e.target.value as string)}
                        placeholder="上 右 下 左"
                      />
                    </FormItem>
                    <FormItem label="内边距">
                      <Input
                        v-model:value={styleConfig.value.padding}
                        onChange={(e) => handleStyleChange('padding', e.target.value as string)}
                        placeholder="上 右 下 左"
                      />
                    </FormItem>
                  </Card>
                </Form>
              </TabPane>

              <TabPane key="logic" tab="逻辑配置">
                <Form layout="vertical">
                  {/* 数据配置 */}
                  <Card
                    size="small"
                    title={
                      <span>
                        <CodeOutlined /> 数据配置
                      </span>
                    }
                    class="mb-4"
                  >
                    <FormItem label="数据源">
                      <Input
                        v-model:value={logicConfig.value.dataSource}
                        onChange={(e) => handleLogicChange('dataSource', e.target.value as string)}
                        placeholder="数据源名称"
                      />
                    </FormItem>
                    <FormItem label="数据路径">
                      <Input
                        v-model:value={logicConfig.value.dataPath}
                        onChange={(e) => handleLogicChange('dataPath', e.target.value as string)}
                        placeholder="数据访问路径"
                      />
                    </FormItem>
                    <FormItem label="默认值">
                      <Input
                        v-model:value={logicConfig.value.defaultValue}
                        onChange={(e) =>
                          handleLogicChange('defaultValue', e.target.value as string)
                        }
                        placeholder="默认值"
                      />
                    </FormItem>
                  </Card>

                  {/* 事件配置 */}
                  <Card
                    size="small"
                    title={
                      <span>
                        <ThunderboltOutlined /> 事件配置
                      </span>
                    }
                    class="mb-4"
                    extra={
                      <Button type="link" onClick={addEventHandler}>
                        <PlusOutlined /> 添加事件
                      </Button>
                    }
                  >
                    {logicConfig.value.events.map((event, index) => (
                      <div key={index} class="event-item">
                        <FormItem label="事件类型">
                          <Select
                            v-model:value={event.type}
                            onChange={(value) =>
                              handleLogicChange(`events[${index}].type`, value as string)
                            }
                          >
                            <Select.Option value="click">点击</Select.Option>
                            <Select.Option value="change">变更</Select.Option>
                            <Select.Option value="focus">聚焦</Select.Option>
                            <Select.Option value="blur">失焦</Select.Option>
                          </Select>
                        </FormItem>
                        <FormItem label="处理函数">
                          <Input.TextArea
                            v-model:value={event.handler}
                            onChange={(e) =>
                              handleLogicChange(
                                `events[${index}].handler`,
                                e.target.value as string,
                              )
                            }
                            placeholder="输入处理函数代码"
                            rows={4}
                          />
                        </FormItem>
                        <Button
                          type="text"
                          danger
                          onClick={() => removeEventHandler(index)}
                          class="remove-btn"
                        >
                          <DeleteOutlined /> 删除
                        </Button>
                      </div>
                    ))}
                  </Card>

                  {/* API 配置 */}
                  <Card
                    size="small"
                    title={
                      <span>
                        <ApiOutlined /> API 配置
                      </span>
                    }
                    class="mb-4"
                    extra={
                      <Button type="link" onClick={addApiConfig}>
                        <PlusOutlined /> 添加 API
                      </Button>
                    }
                  >
                    {logicConfig.value.apis.map((api, index) => (
                      <div key={index} class="api-item">
                        <FormItem label="请求方法">
                          <Select
                            v-model:value={api.method}
                            onChange={(value) =>
                              handleLogicChange(`apis[${index}].method`, value as string)
                            }
                          >
                            <Select.Option value="GET">GET</Select.Option>
                            <Select.Option value="POST">POST</Select.Option>
                            <Select.Option value="PUT">PUT</Select.Option>
                            <Select.Option value="DELETE">DELETE</Select.Option>
                          </Select>
                        </FormItem>
                        <FormItem label="请求地址">
                          <Input
                            v-model:value={api.url}
                            onChange={(e) =>
                              handleLogicChange(`apis[${index}].url`, e.target.value as string)
                            }
                            placeholder="输入 API 地址"
                          />
                        </FormItem>
                        <Button
                          type="text"
                          danger
                          onClick={() => removeApiConfig(index)}
                          class="remove-btn"
                        >
                          <DeleteOutlined /> 删除
                        </Button>
                      </div>
                    ))}
                  </Card>

                  {/* 动画配置 */}
                  <Card
                    size="small"
                    title="动画配置"
                    extra={
                      <Button type="link" onClick={addAnimation}>
                        <PlusOutlined /> 添加动画
                      </Button>
                    }
                  >
                    {logicConfig.value.animations.map((animation, index) => (
                      <div key={index} class="animation-item">
                        <FormItem label="动画类型">
                          <Select
                            v-model:value={animation.type}
                            onChange={(value) =>
                              handleLogicChange(`animations[${index}].type`, value as string)
                            }
                          >
                            <Select.Option value="fade">淡入淡出</Select.Option>
                            <Select.Option value="slide">滑动</Select.Option>
                            <Select.Option value="zoom">缩放</Select.Option>
                          </Select>
                        </FormItem>
                        <FormItem label="持续时间">
                          <InputNumber
                            v-model:value={animation.duration}
                            addon-after="ms"
                            onChange={(value) =>
                              handleLogicChange(`animations[${index}].duration`, value)
                            }
                          />
                        </FormItem>
                        <FormItem label="延迟时间">
                          <InputNumber
                            v-model:value={animation.delay}
                            addon-after="ms"
                            onChange={(value) =>
                              handleLogicChange(`animations[${index}].delay`, value)
                            }
                          />
                        </FormItem>
                        <Button
                          type="text"
                          danger
                          onClick={() => removeAnimation(index)}
                          class="remove-btn"
                        >
                          <DeleteOutlined /> 删除
                        </Button>
                      </div>
                    ))}
                  </Card>
                </Form>
              </TabPane>
            </Tabs>
          )}
        </Card>
      </div>
    )
  },
})
