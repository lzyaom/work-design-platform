import { defineComponent, h, ref, watch, onMounted, onUnmounted } from 'vue'
import type { Component, BaseEvent, Animation } from '@/types/component'
import { useDesignStore } from '@/stores/design'
import { validateComponent } from './componentSchemas'
import type { ComponentType } from './componentSchemas'
import { message } from 'ant-design-vue'
import type { ComponentPublicInstance } from 'vue'

// 组件注册表
const componentRegistry = new Map<string, unknown>()

// 注册组件
export function registerComponent(type: string, component: unknown): void {
  componentRegistry.set(type, component)
}

// 获取组件
export function getComponent(type: string): unknown {
  return componentRegistry.get(type)
}

// 组件渲染器
export const ComponentRenderer = defineComponent({
  name: 'ComponentRenderer',
  props: {
    component: {
      type: Object as () => Component,
      required: true,
    },
  },
  setup(props) {
    const designStore = useDesignStore()
    const componentRef = ref<ComponentPublicInstance | null>(null)
    const eventHandlers = ref<Record<string, (...args: unknown[]) => void>>({})

    // 处理组件事件
    const handleEvent = (event: string, ...args: unknown[]): void => {
      const handler = eventHandlers.value[event]
      if (handler) {
        try {
          handler(...args)
        } catch (error) {
          console.error(`事件处理错误 (${event}):`, error)
          message.error(`事件处理错误: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      }
    }

    // 更新事件处理器
    const updateEventHandlers = (): void => {
      const { events = [] } = props.component
      eventHandlers.value = {}

      events.forEach((event: BaseEvent) => {
        if (event.handler) {
          try {
            // 使用 Function 构造器创建事件处理函数
            eventHandlers.value[event.type] = new Function(
              'event',
              'component',
              'designStore',
              event.handler,
            ) as (...args: unknown[]) => void
          } catch (error) {
            console.error(`创建事件处理器错误 (${event.type}):`, error)
          }
        }
      })
    }

    // 处理数据绑定
    const handleDataBinding = (): Record<string, unknown> => {
      const { dataBindings = [] } = props.component
      const boundData: Record<string, unknown> = {}

      dataBindings.forEach((binding) => {
        try {
          const value = designStore.getData(binding.source, binding.path)
          if (binding.transform) {
            const transform = new Function('value', binding.transform)
            boundData[binding.path] = transform(value)
          } else {
            boundData[binding.path] = value
          }
        } catch (error) {
          console.error(`数据绑定错误 (${binding.source}.${binding.path}):`, error)
          boundData[binding.path] = binding.defaultValue
        }
      })

      return boundData
    }

    // // 处理 API 调用
    // const handleApiCall = async (api: any) => {
    //   try {
    //     const response = await fetch(api.url, {
    //       method: api.method,
    //       headers: {
    //         'Content-Type': 'application/json',
    //         ...api.headers,
    //       },
    //       body: api.method !== 'GET' ? JSON.stringify(api.body) : undefined,
    //     })

    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`)
    //     }

    //     return await response.json()
    //   } catch (error: any) {
    //     console.error(`API 调用错误 (${api.url}):`, error)
    //     message.error(`API 调用错误: ${error.message}`)
    //     return null
    //   }
    // }

    // 处理动画
    const handleAnimation = (animation: Animation): void => {
      if (!componentRef.value) return

      const element = componentRef.value.$el as HTMLElement
      const keyframes: Record<Animation['type'], Keyframe[]> = {
        fade: [{ opacity: 0 }, { opacity: 1 }],
        slide: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
        zoom: [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
        rotate: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        bounce: [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-20px)' },
          { transform: 'translateY(0)' },
        ],
        flip: [
          { transform: 'perspective(400px) rotateY(0)' },
          { transform: 'perspective(400px) rotateY(180deg)' },
        ],
        shake: [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(0)' },
        ],
        swing: [
          { transform: 'rotate(0)' },
          { transform: 'rotate(15deg)' },
          { transform: 'rotate(-15deg)' },
          { transform: 'rotate(0)' },
        ],
        rubberBand: [
          { transform: 'scale(1)' },
          { transform: 'scale(1.25, 0.75)' },
          { transform: 'scale(0.75, 1.25)' },
          { transform: 'scale(1)' },
        ],
        jello: [
          { transform: 'skewX(0)' },
          { transform: 'skewX(-12.5deg)' },
          { transform: 'skewX(6.25deg)' },
          { transform: 'skewX(0)' },
        ],
        tada: [
          { transform: 'scale(1)' },
          { transform: 'scale(0.9) rotate(-3deg)' },
          { transform: 'scale(1.1) rotate(3deg)' },
          { transform: 'scale(1)' },
        ],
        wobble: [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-25%) rotate(-5deg)' },
          { transform: 'translateX(20%) rotate(3deg)' },
          { transform: 'translateX(0)' },
        ],
      }

      element.animate(keyframes[animation.type], {
        duration: animation.duration,
        delay: animation.delay,
        easing: animation.easing || 'ease',
        fill: 'forwards',
      })
    }

    // 监听组件变化
    watch(
      () => props.component,
      () => {
        updateEventHandlers()
        // 验证组件配置
        if (!validateComponent(props.component, props.component.type as ComponentType)) {
          console.error('组件配置验证失败:', props.component)
          return
        }
      },
      { deep: true },
    )

    // 组件挂载时
    onMounted(() => {
      updateEventHandlers()
      // 应用初始动画
      const { animations = [] } = props.component
      animations.forEach(handleAnimation)
    })

    // 组件卸载时
    onUnmounted(() => {
      eventHandlers.value = {}
    })

    return () => {
      const { type, props: componentProps = {}, style = {} } = props.component
      const Component = getComponent(type)

      if (!Component) {
        console.error(`未找到组件类型: ${type}`)
        return null
      }

      // 合并数据绑定
      const boundData = handleDataBinding()
      const mergedProps: Record<string, unknown> = {
        ...componentProps,
        ...boundData,
        style,
        ref: componentRef,
      }

      // 添加事件监听
      Object.keys(eventHandlers.value).forEach((event) => {
        const eventName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
        mergedProps[eventName] = (e: unknown) => handleEvent(event, e, props.component, designStore)
      })

      return h(Component, mergedProps)
    }
  },
})

// 注册基础组件
import {
  Button,
  Input,
  Select,
  Card,
  Table,
  Form,
  DatePicker,
  TimePicker,
  Switch,
  Radio,
  Checkbox,
  Slider,
  Rate,
  Upload,
  Progress,
  Avatar,
  Badge,
  Tag,
  Divider,
  Space,
} from 'ant-design-vue'

registerComponent('button', Button)
registerComponent('input', Input)
registerComponent('select', Select)
registerComponent('card', Card)
registerComponent('table', Table)
registerComponent('form', Form)
registerComponent('datePicker', DatePicker)
registerComponent('timePicker', TimePicker)
registerComponent('switch', Switch)
registerComponent('radio', Radio)
registerComponent('checkbox', Checkbox)
registerComponent('slider', Slider)
registerComponent('rate', Rate)
registerComponent('upload', Upload)
registerComponent('progress', Progress)
registerComponent('avatar', Avatar)
registerComponent('badge', Badge)
registerComponent('tag', Tag)
registerComponent('divider', Divider)
registerComponent('space', Space)

// 导出渲染器组件
export default ComponentRenderer
