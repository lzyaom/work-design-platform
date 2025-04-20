import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { PropertyPanel } from '../index'
import type { Component, DataSource } from '@/types/component'

describe('PropertyPanel Performance', () => {
  // 生成大量测试数据
  const generateComponents = (count: number): Component[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `button-${i}`,
      type: 'Button',
      props: {
        text: `Button ${i}`,
        type: 'primary',
        size: 'middle',
        disabled: false,
        loading: false
      },
      style: {
        width: '120px',
        height: '32px',
        margin: '8px',
        padding: '4px 12px'
      },
      events: [
        {
          type: 'click',
          name: `onClick${i}`,
          handler: `console.log('clicked ${i}')`,
          description: '',
          dependencies: []
        }
      ],
      dataSource: {
        id: `ds-${i}`,
        type: 'static',
        config: {
          static: {
            data: { index: i }
          }
        }
      } as DataSource
    }))
  }

  // 装载组件的工具函数
  const mountPanel = (props: { component: Component | null, onChange?: (c: Component) => void }) => {
    return mount(PropertyPanel, {
      props: {
        onChange: props.onChange || vi.fn(),
        ...props
      }
    })
  }

  it('renders quickly with complex component', async () => {
    const component = generateComponents(1)[0]
    const startTime = performance.now()
    
    const wrapper = mountPanel({ component })
    const renderTime = performance.now() - startTime
    
    expect(renderTime).toBeLessThan(100) // 首次渲染应在 100ms 内完成
    expect(wrapper.find('.property-panel').exists()).toBe(true)
    expect(wrapper.findAll('.ant-tabs-tab')).toHaveLength(4)
  })

  it('updates efficiently when switching components', async () => {
    const components = generateComponents(100)
    const onChange = vi.fn()
    const wrapper = mountPanel({ 
      component: components[0], 
      onChange 
    })

    const updateTimes: number[] = []
    
    // 测试连续切换组件的性能
    for (let i = 1; i < 10; i++) {
      const startTime = performance.now()
      await wrapper.setProps({ component: components[i] })
      updateTimes.push(performance.now() - startTime)
    }

    // 平均更新时间应小于 50ms
    const avgUpdateTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length
    expect(avgUpdateTime).toBeLessThan(50)
  })

  it('handles rapid property changes efficiently', async () => {
    const component = generateComponents(1)[0]
    const onChange = vi.fn()
    const wrapper = mountPanel({ 
      component, 
      onChange 
    })

    const propConfig = wrapper.findComponent({ name: 'BasePropConfig' })
    const updateTimes: number[] = []

    // 测试快速修改属性的性能
    for (let i = 0; i < 50; i++) {
      const startTime = performance.now()
      await propConfig.vm.$emit('change', 'text', `New Text ${i}`)
      updateTimes.push(performance.now() - startTime)
    }

    // 平均更新时间应小于 16ms (60fps)
    const avgUpdateTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length
    expect(avgUpdateTime).toBeLessThan(16)
    expect(onChange).toHaveBeenCalledTimes(50)
  })

  it('handles concurrent updates correctly', async () => {
    const component = generateComponents(1)[0]
    const onChange = vi.fn()
    const wrapper = mountPanel({ 
      component, 
      onChange 
    })

    // 模拟并发更新
    await Promise.all([
      wrapper.findComponent({ name: 'BasePropConfig' }).vm.$emit('change', 'text', 'Text 1'),
      wrapper.findComponent({ name: 'StyleConfig' }).vm.$emit('change', { 
        style: { width: '200px' } 
      }),
      wrapper.findComponent({ name: 'DataConfig' }).vm.$emit('change', {
        id: 'test-ds',
        type: 'static',
        config: {
          static: {
            data: { test: true }
          }
        }
      } as DataSource)
    ])

    // 验证更新顺序和结果
    expect(onChange).toHaveBeenCalledTimes(3)
    const lastCall = onChange.mock.calls[2][0]
    
    expect(lastCall).toMatchObject({
      id: component.id,
      props: expect.objectContaining({ text: 'Text 1' }),
      style: expect.objectContaining({ width: '200px' }),
      dataSource: expect.objectContaining({ 
        type: 'static',
        config: expect.objectContaining({
          static: expect.objectContaining({
            data: expect.objectContaining({ test: true })
          })
        })
      })
    })
  })

  // Skipped in CI environment
  it.skipIf(process.env.CI)('memory usage remains stable', async () => {
    const components = generateComponents(1000)
    const wrapper = mountPanel({ component: components[0] })

    const initialMemory = process.memoryUsage().heapUsed
    let maxMemoryIncrease = 0

    // 测试内存使用情况
    for (let i = 1; i < 100; i++) {
      await wrapper.setProps({ component: components[i] })
      const currentMemory = process.memoryUsage().heapUsed
      const memoryIncrease = currentMemory - initialMemory
      maxMemoryIncrease = Math.max(maxMemoryIncrease, memoryIncrease)

      // 手动触发垃圾回收
      if (i % 10 === 0 && global.gc) {
        global.gc()
      }
    }

    // 内存增长不应超过 50MB
    expect(maxMemoryIncrease).toBeLessThan(50 * 1024 * 1024)
  })
})