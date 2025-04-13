import type { Component } from '@/types/component'

export const basicComponents: Component[] = [
  {
    id: 'button',
    type: 'button',
    title: '按钮',
    icon: '',
    props: {
      text: '按钮',
      type: 'primary',
    },
    style: {
      width: '120px',
      height: '40px',
    },
  },
  {
    id: 'input',
    type: 'input',
    title: '输入框',
    icon: 'icon-input',
    props: {
      placeholder: '请输入',
    },
    style: {
      width: '200px',
    },
  },
]

export const containerComponents: Component[] = [
  {
    id: 'div',
    type: 'div',
    title: '容器',
    icon: 'icon-container',
    props: {},
    style: {
      width: '300px',
      height: '200px',
      backgroundColor: '#f5f5f5',
    },
  },
]

export const complexComponents: Component[] = [
  {
    id: 'table',
    type: 'table',
    title: '表格',
    icon: 'icon-table',
    props: {
      columns: [],
      dataSource: [],
    },
    style: {
      width: '100%',
    },
  },
]

export const chartComponents: Component[] = [
  {
    id: 'line-chart',
    type: 'line-chart',
    title: '折线图',
    icon: 'icon-line-chart',
    props: {
      data: [],
    },
    style: {
      width: '500px',
      height: '300px',
    },
  },
]

export const thirdPartyComponents: Component[] = [
  {
    id: 'map',
    type: 'map',
    title: '地图',
    icon: 'icon-map',
    props: {
      center: [116.397428, 39.90923],
      zoom: 12,
    },
    style: {
      width: '500px',
      height: '300px',
    },
  },
]
