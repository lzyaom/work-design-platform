import { ref } from 'vue'
import { useDesignStore } from '@/stores/design'
import { message } from 'ant-design-vue'
import type { Component } from '@/types/component'

// WebSocket 连接状态
export const connectionStatus = ref<'connecting' | 'connected' | 'disconnected'>('disconnected')

// 在线用户列表
export interface OnlineUser {
  id: string
  name: string
  avatar: string
  cursor: { x: number; y: number }
  selection: string | null
}

export const onlineUsers = ref<OnlineUser[]>([])

// 操作类型
export enum OperationType {
  ADD_COMPONENT = 'ADD_COMPONENT',
  UPDATE_COMPONENT = 'UPDATE_COMPONENT',
  DELETE_COMPONENT = 'DELETE_COMPONENT',
  MOVE_COMPONENT = 'MOVE_COMPONENT',
  SELECT_COMPONENT = 'SELECT_COMPONENT',
  CLEAR_SELECTION = 'CLEAR_SELECTION',
  CURSOR_MOVE = 'CURSOR_MOVE',
}

// 操作接口
export interface Operation {
  type: OperationType
  userId: string
  timestamp: number
  payload: {
    component?: Component
    componentId?: string
    direction?: 'up' | 'down'
    cursor?: { x: number; y: number }
    user?: OnlineUser
  }
}

// 操作历史
const operationHistory: Operation[] = []

// 最后一次操作时间戳
let lastOperationTimestamp = 0

// WebSocket 实例
let ws: WebSocket | null = null

// 重连次数
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_INTERVAL = 3000

// 初始化 WebSocket 连接
export function initWebSocket(
  designId: string,
  userId: string,
  userName: string,
  userAvatar: string,
) {
  const wsUrl = `${process.env.VUE_APP_WS_URL}/design/${designId}`

  const connect = () => {
    connectionStatus.value = 'connecting'
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      connectionStatus.value = 'connected'
      reconnectAttempts = 0

      // 发送用户信息
      sendOperation({
        type: OperationType.CURSOR_MOVE,
        userId,
        timestamp: Date.now(),
        payload: {
          user: {
            id: userId,
            name: userName,
            avatar: userAvatar,
            cursor: { x: 0, y: 0 },
            selection: null,
          },
        },
      })
    }

    ws.onmessage = (event) => {
      try {
        const operation: Operation = JSON.parse(event.data)
        handleOperation(operation)
      } catch (error) {
        console.error('处理消息错误:', error)
      }
    }

    ws.onclose = () => {
      connectionStatus.value = 'disconnected'
      handleDisconnect()
    }

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
      connectionStatus.value = 'disconnected'
    }
  }

  // 处理断开连接
  const handleDisconnect = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++
      setTimeout(connect, RECONNECT_INTERVAL)
    } else {
      message.error('连接失败，请刷新页面重试')
    }
  }

  connect()
}

// 发送操作
export function sendOperation(operation: Operation) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(operation))
    operationHistory.push(operation)
    lastOperationTimestamp = operation.timestamp
  }
}

// 处理操作
function handleOperation(operation: Operation): void {
  const store = useDesignStore()

  // 忽略过期的操作
  if (operation.timestamp <= lastOperationTimestamp) {
    return
  }

  // 更新在线用户列表
  if (operation.type === OperationType.CURSOR_MOVE) {
    if (operation.payload.user && operation.payload.cursor) {
      const userIndex = onlineUsers.value.findIndex(
        (user) => user.id === operation.payload.user?.id,
      )

      if (userIndex === -1 && operation.payload.user) {
        onlineUsers.value.push({
          ...operation.payload.user,
          cursor: operation.payload.cursor,
          selection: null,
        })
      } else if (operation.payload.cursor) {
        onlineUsers.value[userIndex].cursor = operation.payload.cursor
      }
    }
    return
  }

  const handleClearSelection = () => {
    const clearIndex = onlineUsers.value.findIndex((user) => user.id === operation.userId)
    if (clearIndex !== -1) {
      onlineUsers.value[clearIndex].selection = null
    }
  }
  // 处理组件操作
  try {
    switch (operation.type) {
      case OperationType.ADD_COMPONENT:
        if (operation.payload.component) {
          store.addComponent(operation.payload.component)
        }
        break

      case OperationType.UPDATE_COMPONENT:
        if (operation.payload.component) {
          store.updateComponent(operation.payload.component)
        }
        break

      case OperationType.DELETE_COMPONENT:
        if (operation.payload.componentId) {
          store.deleteComponent(operation.payload.componentId)
        }
        break

      case OperationType.MOVE_COMPONENT:
        if (operation.payload.componentId && operation.payload.direction) {
          store.moveComponent(operation.payload.componentId, operation.payload.direction)
        }
        break

      case OperationType.SELECT_COMPONENT:
        if (operation.payload.componentId) {
          const userIndex = onlineUsers.value.findIndex((user) => user.id === operation.userId)
          if (userIndex !== -1) {
            onlineUsers.value[userIndex].selection = operation.payload.componentId
          }
        }
        break

      case OperationType.CLEAR_SELECTION:
        handleClearSelection()
        break
    }

    lastOperationTimestamp = operation.timestamp
    operationHistory.push(operation)
  } catch (error) {
    console.error('处理操作错误:', error)
    message.error('操作处理失败')
  }
}

// 处理冲突
// function resolveConflict(operation: Operation): boolean {
//   // 检查是否有冲突的操作
//   const conflictingOperations = operationHistory.filter(
//     (op) =>
//       op.timestamp > operation.timestamp &&
//       op.type === operation.type &&
//       op.payload.componentId === operation.payload.componentId,
//   )

//   if (conflictingOperations.length === 0) {
//     return true
//   }

//   // 根据操作类型处理冲突
//   switch (operation.type) {
//     case OperationType.UPDATE_COMPONENT:
//       // 合并属性更新
//       const mergedComponent = conflictingOperations.reduce(
//         (result, op) => ({
//           ...result,
//           ...op.payload.component,
//         }),
//         operation.payload.component,
//       )
//       operation.payload.component = mergedComponent
//       return true

//     case OperationType.DELETE_COMPONENT:
//       // 如果组件已被删除，忽略操作
//       return !conflictingOperations.some((op) => op.type === OperationType.DELETE_COMPONENT)

//     case OperationType.MOVE_COMPONENT:
//       // 使用最新的移动操作
//       return operation.timestamp > conflictingOperations[0].timestamp

//     default:
//       return true
//   }
// }

// 更新光标位置
export function updateCursor(userId: string, x: number, y: number): void {
  const operation: Operation = {
    type: OperationType.CURSOR_MOVE,
    userId,
    timestamp: Date.now(),
    payload: {
      cursor: { x, y },
    },
  }
  handleOperation(operation)
}

// 清理连接
export function cleanup(): void {
  if (ws) {
    ws.close()
    ws = null
  }
  connectionStatus.value = 'disconnected'
  onlineUsers.value = []
  operationHistory.length = 0
  lastOperationTimestamp = 0
  reconnectAttempts = 0
}
