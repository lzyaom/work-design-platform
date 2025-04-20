import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { PropertyPanel } from '../index'
import type { Component } from '@/types/component'

describe('PropertyPanel', () => {
  const mockComponent: Component = {
    id: 'test-button',
    type: 'Button',
    props: {
      text: 'Test Button',
      type: 'primary'
    }
  }

  const createWrapper = (props = {}) => {
    return mount(PropertyPanel, {
      props: {
        component: mockComponent,
        onChange: vi.fn(),
        ...props
      }
    })
  }

  it('renders empty state when no component selected', () => {
    const wrapper = createWrapper({ component: null })
    expect(wrapper.find('.property-panel--empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('请选择一个组件')
  })

  it('renders component info when component selected', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.component-name').text()).toContain('Button')
    expect(wrapper.find('.component-id').text()).toBe('test-button')
  })

  it('updates component props correctly', async () => {
    const onChange = vi.fn()
    const wrapper = createWrapper({ onChange })

    const input = wrapper.findComponent({ name: 'BasePropConfig' })
    await input.vm.$emit('change', 'text', 'Updated Button')

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({
        text: 'Updated Button'
      })
    }))
  })

  it('switches tabs correctly', async () => {
    const wrapper = createWrapper()
    
    const tabs = wrapper.findAll('.ant-tabs-tab')
    await tabs[1].trigger('click')

    expect(wrapper.find('.ant-tabs-tab-active').text()).toBe('数据')
  })

  it('handles data source changes', async () => {
    const onChange = vi.fn()
    const wrapper = createWrapper({ onChange })

    const dataConfig = wrapper.findComponent({ name: 'DataConfig' })
    await dataConfig.vm.$emit('change', {
      id: 'test-source',
      type: 'static',
      config: { data: { test: true } }
    })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      dataSource: expect.objectContaining({
        id: 'test-source'
      })
    }))
  })

  it('handles event changes', async () => {
    const onChange = vi.fn()
    const wrapper = createWrapper({ onChange })

    const eventConfig = wrapper.findComponent({ name: 'EventConfig' })
    await eventConfig.vm.$emit('change', {
      events: [{
        type: 'click',
        name: 'onClick',
        handler: 'console.log("clicked")'
      }]
    })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      events: expect.arrayContaining([
        expect.objectContaining({
          type: 'click',
          name: 'onClick'
        })
      ])
    }))
  })

  it('handles style changes', async () => {
    const onChange = vi.fn()
    const wrapper = createWrapper({ onChange })

    const styleConfig = wrapper.findComponent({ name: 'StyleConfig' })
    await styleConfig.vm.$emit('change', {
      style: {
        width: '100px',
        height: '40px'
      }
    })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      style: expect.objectContaining({
        width: '100px',
        height: '40px'
      })
    }))
  })
})