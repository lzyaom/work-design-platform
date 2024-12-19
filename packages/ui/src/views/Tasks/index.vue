<script lang="tsx">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { debounce } from 'lodash-es'

// 任务状态枚举
const TaskStatus = {
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped',
} as const

type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus]

// 优先级枚举
const Priority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

type PriorityType = (typeof Priority)[keyof typeof Priority]

// 任务类型定义
interface Task {
  key: string
  name: string
  status: TaskStatusType
  priority: PriorityType
  duration: string
  startTime: string
  cpu: string
  memory: string
  progress: number
  error?: string
  retryCount: number
  lastError?: string
  lastErrorTime?: string
}

// 日志类型定义
interface TaskLog {
  id: string
  taskId: string
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  content: string
}

// 错误类型定义
interface TaskError extends Error {
  code?: string
  data?: any
  retry?: boolean
  critical?: boolean
}

// 状态存储键
const STORAGE_KEYS = {
  TASKS: 'tasks',
  FILTERS: 'task_filters',
  PAGINATION: 'task_pagination',
} as const

// 状态管理
const useTaskStore = () => {
  // 基础状态
  const state = ref({
    loading: false,
    loadingTask: false,
    loadingLogs: false,
    error: null as TaskError | null,
    tasks: [] as Task[],
    logs: [] as TaskLog[],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  })

  // 持久化状态
  const persistState = () => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.value.tasks))
    localStorage.setItem(STORAGE_KEYS.PAGINATION, JSON.stringify(state.value.pagination))
  }

  // 恢复状态
  const restoreState = () => {
    try {
      const tasks = localStorage.getItem(STORAGE_KEYS.TASKS)
      const pagination = localStorage.getItem(STORAGE_KEYS.PAGINATION)
      if (tasks) state.value.tasks = JSON.parse(tasks)
      if (pagination) state.value.pagination = JSON.parse(pagination)
    } catch (error) {
      console.error('Failed to restore state:', error)
    }
  }

  // 监听状态变化
  watch(
    () => [state.value.tasks, state.value.pagination],
    () => {
      persistState()
    },
    { deep: true },
  )

  return {
    state,
    persistState,
    restoreState,
  }
}

// 任务历史记录类型定义
interface TaskHistory {
  id: string
  taskId: string
  startTime: string
  endTime: string
  duration: string
  status: TaskStatusType
  result: 'success' | 'failed'
  errorMessage?: string
}

// 任务统计类型定义
interface TaskStats {
  total: number
  running: number
  completed: number
  failed: number
  avgDuration: string
  successRate: number
}

export default defineComponent({
  name: 'Tasks',
  setup() {
    // 优先级颜色映射
    const priorityColors = {
      [Priority.HIGH]: '#f5222d',
      [Priority.MEDIUM]: '#faad14',
      [Priority.LOW]: '#52c41a',
    }

    // 使用状态管理
    const { state, restoreState } = useTaskStore()

    // 搜索和筛选状态
    const filters = ref({
      searchText: '',
      status: [] as TaskStatusType[],
      priority: [] as PriorityType[],
    })

    // 弹框状态
    const modals = ref({
      taskDetail: false,
      createTask: false,
      taskLogs: false,
      taskHistory: false,
    })

    // 当前选中的任务
    const currentTask = ref<Task | null>(null)

    // 表单实例和数据
    const formRef = ref<FormInstance>()
    const taskForm = ref({
      name: '',
      priority: Priority.MEDIUM as PriorityType,
      command: '',
      args: '',
      description: '',
    })

    // 性能优化：防抖搜索
    const debouncedSearch = debounce(() => {
      fetchTasks()
    }, 300)

    // 监听搜索和筛选条件变化
    watch(
      [() => filters.value.searchText, () => filters.value.status, () => filters.value.priority],
      () => {
        debouncedSearch()
      },
    )

    // 获取任务列表
    const fetchTasks = async () => {
      try {
        state.value.loading = true
        state.value.error = null
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // TODO: 实际项目中这里应该调用后端 API
        state.value.tasks = [
          {
            key: '1',
            name: '图像处理程序',
            status: TaskStatus.RUNNING,
            priority: Priority.HIGH,
            duration: '02:30:15',
            startTime: '2024-01-20 10:30:00',
            cpu: '45%',
            memory: '1.2GB',
            progress: 0,
            retryCount: 0,
          },
          {
            key: '2',
            name: '数据分析任务',
            status: TaskStatus.PAUSED,
            priority: Priority.MEDIUM,
            duration: '01:15:30',
            startTime: '2024-01-20 11:00:00',
            cpu: '30%',
            memory: '800MB',
            progress: 0,
            retryCount: 0,
          },
          {
            key: '3',
            name: '文件同步程序',
            status: TaskStatus.STOPPED,
            priority: Priority.LOW,
            duration: '00:45:20',
            startTime: '2024-01-20 09:15:00',
            cpu: '0%',
            memory: '0MB',
            progress: 0,
            retryCount: 0,
          },
        ]
      } catch (error) {
        state.value.error = error as TaskError
        message.error('获取任务列表失败')
      } finally {
        state.value.loading = false
      }
    }

    // 获取任务日志
    const fetchTaskLogs = async (taskId: string) => {
      try {
        state.value.loadingLogs = true
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 500))
        // TODO: 实际项目中这里应该调用后端 API
        state.value.logs = [
          { id: '1', taskId: '1', time: '2024-01-20 10:30:00', type: 'info', content: '任务启动' },
          {
            id: '2',
            taskId: '1',
            time: '2024-01-20 10:30:05',
            type: 'success',
            content: '初始化完成',
          },
          {
            id: '3',
            taskId: '1',
            time: '2024-01-20 10:35:00',
            type: 'warning',
            content: 'CPU使用率超过80%',
          },
          {
            id: '4',
            taskId: '1',
            time: '2024-01-20 10:40:00',
            type: 'error',
            content: '内存不足警告',
          },
        ]
      } catch (error) {
        message.error('获取任务日志失败')
      } finally {
        state.value.loadingLogs = false
      }
    }

    // 任务进度监控
    const taskMonitor = ref<number | null>(null)
    const startMonitoring = (taskId: string) => {
      stopMonitoring() // 停止之前的监控
      taskMonitor.value = window.setInterval(() => {
        updateTaskProgress(taskId)
      }, 1000)
    }

    const stopMonitoring = () => {
      if (taskMonitor.value) {
        window.clearInterval(taskMonitor.value)
        taskMonitor.value = null
      }
    }

    // 更新任务进度
    const updateTaskProgress = async (taskId: string) => {
      try {
        // 模拟 API 调用
        const progress = Math.random() * 100
        const task = state.value.tasks.find((t) => t.key === taskId)
        if (task) {
          task.progress = Math.min(Math.round(progress), 100)
          if (task.progress >= 100) {
            stopMonitoring()
            task.status = TaskStatus.STOPPED
            message.success('任务执行完成')
          }
        }
      } catch (error) {
        handleError(error as TaskError)
      }
    }

    // 错误处理
    const handleError = (error: TaskError) => {
      state.value.error = error
      if (error.critical) {
        message.error({
          content: '发生严重错误，请刷新页面重试',
          duration: 0,
        })
      } else if (error.retry) {
        message.warning({
          content: '操作失败，正在重试...',
          duration: 2,
        })
        // 自动重试逻辑
        setTimeout(() => {
          // 重试相关操作
        }, 2000)
      } else {
        message.error(error.message)
      }
    }

    // 处理任务操作
    const handleTaskOperation = async (operation: 'start' | 'pause' | 'stop', task: Task) => {
      try {
        state.value.loadingTask = true
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 500))
        const taskIndex = state.value.tasks.findIndex((t) => t.key === task.key)
        if (taskIndex !== -1) {
          const updatedTask = { ...state.value.tasks[taskIndex] }
          switch (operation) {
            case 'start':
              updatedTask.status = TaskStatus.RUNNING
              startMonitoring(task.key)
              break
            case 'pause':
              updatedTask.status = TaskStatus.PAUSED
              stopMonitoring()
              break
            case 'stop':
              updatedTask.status = TaskStatus.STOPPED
              stopMonitoring()
              break
          }
          state.value.tasks[taskIndex] = updatedTask
          message.success(
            `任务${operation === 'start' ? '启动' : operation === 'pause' ? '暂停' : '停止'}成功`,
          )
        }
      } catch (error) {
        handleError(error as TaskError)
      } finally {
        state.value.loadingTask = false
      }
    }

    // 创建任务
    const handleCreateTask = async () => {
      try {
        await formRef.value?.validate()
        state.value.loading = true
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // TODO: 实际项目中这里应该调用后端 API
        const newTask: Task = {
          key: String(state.value.tasks.length + 1),
          name: taskForm.value.name,
          status: TaskStatus.RUNNING,
          priority: taskForm.value.priority,
          duration: '00:00:00',
          startTime: new Date().toLocaleString(),
          cpu: '0%',
          memory: '0MB',
          progress: 0,
          retryCount: 0,
        }
        state.value.tasks.push(newTask)
        modals.value.createTask = false
        resetForm()
        message.success('创建任务成功')
      } catch (error) {
        if (error instanceof Error) {
          message.error(error.message)
        } else {
          message.error('创建任务失败')
        }
      } finally {
        state.value.loading = false
      }
    }

    // 重置表单
    const resetForm = () => {
      taskForm.value = {
        name: '',
        priority: Priority.MEDIUM,
        command: '',
        args: '',
        description: '',
      }
      formRef.value?.resetFields()
    }

    // 查看任务详情
    const viewTaskDetail = (task: Task) => {
      currentTask.value = task
      modals.value.taskDetail = true
    }

    // 查看任务日志
    const viewTaskLogs = async (task: Task) => {
      currentTask.value = task
      modals.value.taskLogs = true
      await fetchTaskLogs(task.key)
    }

    // 生命周期钩子
    onMounted(() => {
      restoreState()
      fetchTasks()
    })

    onUnmounted(() => {
      stopMonitoring()
      debouncedSearch.cancel()
    })

    // 计算属性：过滤后的任务列表
    const filteredTasks = computed(() => {
      return state.value.tasks.filter((task) => {
        const matchesSearch = task.name
          .toLowerCase()
          .includes(filters.value.searchText.toLowerCase())
        const matchesStatus =
          filters.value.status.length === 0 || filters.value.status.includes(task.status)
        const matchesPriority =
          filters.value.priority.length === 0 || filters.value.priority.includes(task.priority)
        return matchesSearch && matchesStatus && matchesPriority
      })
    })

    // 表格列定义
    const columns: TableColumnsType = [
      {
        title: '程序名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        customRender: ({ text }: { text: TaskStatusType }) => {
          const statusMap = {
            [TaskStatus.RUNNING]: { color: '#52c41a', text: '运行中' },
            [TaskStatus.PAUSED]: { color: '#faad14', text: '已暂停' },
            [TaskStatus.STOPPED]: { color: '#ff4d4f', text: '已停止' },
          }
          return <a-tag color={statusMap[text].color}>{statusMap[text].text}</a-tag>
        },
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 100,
        customRender: ({ text }: { text: PriorityType }) => {
          const priorityMap = {
            [Priority.HIGH]: '高',
            [Priority.MEDIUM]: '中',
            [Priority.LOW]: '低',
          }
          return <a-tag color={priorityColors[text]}>{priorityMap[text]}</a-tag>
        },
      },
      {
        title: '运行时长',
        dataIndex: 'duration',
        key: 'duration',
        width: 120,
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        key: 'startTime',
        width: 180,
      },
      {
        title: 'CPU占用',
        dataIndex: 'cpu',
        key: 'cpu',
        width: 100,
      },
      {
        title: '内存占用',
        dataIndex: 'memory',
        key: 'memory',
        width: 100,
      },
      {
        title: '执行进度',
        dataIndex: 'progress',
        key: 'progress',
        width: 200,
        customRender: ({ text, record }: { text: number; record: Task }) => (
          <div>
            <a-progress
              percent={text || 0}
              status={
                record.status === TaskStatus.RUNNING
                  ? 'active'
                  : record.status === TaskStatus.PAUSED
                    ? 'normal'
                    : record.error
                      ? 'exception'
                      : 'success'
              }
              size="small"
            />
            {record.error && (
              <a-tooltip title={record.lastError}>
                <InfoCircleOutlined class="ml-2 text-red-500" />
              </a-tooltip>
            )}
          </div>
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 280,
        fixed: 'right',
        customRender: ({ record }: { record: Task }) => (
          <div class="flex gap-2">
            {record.status === TaskStatus.PAUSED && (
              <a-button
                type="primary"
                size="small"
                onClick={() => handleTaskOperation('start', record)}
              >
                {{
                  icon: () => <PlayCircleOutlined />,
                  default: () => '继续',
                }}
              </a-button>
            )}
            {record.status === TaskStatus.RUNNING && (
              <a-button
                type="primary"
                size="small"
                onClick={() => handleTaskOperation('pause', record)}
              >
                {{
                  icon: () => <PauseCircleOutlined />,
                  default: () => '暂停',
                }}
              </a-button>
            )}
            {record.status !== TaskStatus.STOPPED && (
              <a-button danger size="small" onClick={() => handleTaskOperation('stop', record)}>
                {{
                  icon: () => <StopOutlined />,
                  default: () => '停止',
                }}
              </a-button>
            )}
            <a-button size="small" onClick={() => viewTaskDetail(record)}>
              {{
                icon: () => <EyeOutlined />,
                default: () => '详情',
              }}
            </a-button>
            <a-button size="small" onClick={() => viewTaskLogs(record)}>
              {{
                icon: () => <FileTextOutlined />,
                default: () => '日志',
              }}
            </a-button>
          </div>
        ),
      },
    ]

    // 任务详情弹框更新
    const renderTaskDetail = (task: Task) => (
      <a-descriptions bordered>
        <a-descriptions-item label="程序名称" span={3}>
          {task.name}
        </a-descriptions-item>
        <a-descriptions-item label="运行状态">
          <a-tag color={task.status === TaskStatus.RUNNING ? '#52c41a' : '#ff4d4f'}>
            {task.status === TaskStatus.RUNNING ? '运行中' : '已停止'}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="优先级">
          <a-tag color={priorityColors[task.priority]}>
            {task.priority === Priority.HIGH
              ? '高'
              : task.priority === Priority.MEDIUM
                ? '中'
                : '低'}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="运行时长">{task.duration}</a-descriptions-item>
        <a-descriptions-item label="CPU占用" span={2}>
          <a-progress
            percent={Number(task.cpu.replace('%', ''))}
            status={Number(task.cpu.replace('%', '')) > 80 ? 'exception' : 'normal'}
          />
        </a-descriptions-item>
        <a-descriptions-item label="内存占用" span={2}>
          <a-progress
            percent={Number(task.memory.replace(/[A-Za-z%]/g, ''))}
            status={Number(task.memory.replace(/[A-Za-z%]/g, '')) > 80 ? 'exception' : 'normal'}
          />
        </a-descriptions-item>
        <a-descriptions-item label="执行进度" span={3}>
          <a-progress
            percent={task.progress || 0}
            status={
              task.status === TaskStatus.RUNNING
                ? 'active'
                : task.status === TaskStatus.PAUSED
                  ? 'normal'
                  : task.error
                    ? 'exception'
                    : 'success'
            }
          />
        </a-descriptions-item>
        {task.error && (
          <a-descriptions-item label="错误信息" span={3}>
            <a-alert
              message={task.lastError}
              type="error"
              showIcon
              description={`最后错误时间: ${task.lastErrorTime}`}
            />
          </a-descriptions-item>
        )}
      </a-descriptions>
    )

    // 任务历史记录状态
    const taskHistory = ref<TaskHistory[]>([])
    const loadingHistory = ref(false)

    // 任务统计状态
    const taskStats = ref<TaskStats>({
      total: 0,
      running: 0,
      completed: 0,
      failed: 0,
      avgDuration: '00:00:00',
      successRate: 0,
    })

    // 选中的任务
    const selectedTaskKeys = ref<string[]>([])

    // 获取任务历史记录
    const fetchTaskHistory = async (taskId: string) => {
      try {
        loadingHistory.value = true
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 500))
        taskHistory.value = [
          {
            id: '1',
            taskId,
            startTime: '2024-01-20 10:30:00',
            endTime: '2024-01-20 11:30:00',
            duration: '01:00:00',
            status: TaskStatus.STOPPED,
            result: 'success',
          },
          {
            id: '2',
            taskId,
            startTime: '2024-01-19 14:00:00',
            endTime: '2024-01-19 14:30:00',
            duration: '00:30:00',
            status: TaskStatus.STOPPED,
            result: 'failed',
            errorMessage: '内存不足',
          },
        ]
      } catch (error) {
        message.error('获取任务历史记录失败')
      } finally {
        loadingHistory.value = false
      }
    }

    // 更新任务统计
    const updateTaskStats = () => {
      const total = state.value.tasks.length
      const running = state.value.tasks.filter((t) => t.status === TaskStatus.RUNNING).length
      const completed = state.value.tasks.filter(
        (t) => t.status === TaskStatus.STOPPED && !t.error,
      ).length
      const failed = state.value.tasks.filter((t) => t.error).length

      // 计算平均运行时长
      const durations = state.value.tasks
        .filter((t) => t.duration)
        .map((t) => {
          const [hours, minutes, seconds] = t.duration.split(':').map(Number)
          return hours * 3600 + minutes * 60 + seconds
        })
      const avgSeconds = durations.length
        ? Math.floor(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0
      const avgHours = Math.floor(avgSeconds / 3600)
      const avgMinutes = Math.floor((avgSeconds % 3600) / 60)
      const avgSecondsRemainder = avgSeconds % 60

      taskStats.value = {
        total,
        running,
        completed,
        failed,
        avgDuration: `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}:${avgSecondsRemainder.toString().padStart(2, '0')}`,
        successRate: total ? Math.round((completed / total) * 100) : 0,
      }
    }

    // 批量操作任务
    const batchOperation = async (operation: 'start' | 'pause' | 'stop') => {
      if (!selectedTaskKeys.value.length) {
        message.warning('请选择要操作的任务')
        return
      }

      try {
        state.value.loading = true
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 1000))

        for (const key of selectedTaskKeys.value) {
          const task = state.value.tasks.find((t) => t.key === key)
          if (task) {
            switch (operation) {
              case 'start':
                if (task.status === TaskStatus.PAUSED) {
                  task.status = TaskStatus.RUNNING
                  startMonitoring(task.key)
                }
                break
              case 'pause':
                if (task.status === TaskStatus.RUNNING) {
                  task.status = TaskStatus.PAUSED
                  stopMonitoring()
                }
                break
              case 'stop':
                if (task.status !== TaskStatus.STOPPED) {
                  task.status = TaskStatus.STOPPED
                  stopMonitoring()
                }
                break
            }
          }
        }

        message.success(
          `批量${operation === 'start' ? '启动' : operation === 'pause' ? '暂停' : '停止'}成功`,
        )
        selectedTaskKeys.value = []
        updateTaskStats()
      } catch (error) {
        handleError(error as TaskError)
      } finally {
        state.value.loading = false
      }
    }

    // 监听任务状态变化
    watch(
      () => state.value.tasks,
      () => {
        updateTaskStats()
      },
      { deep: true },
    )

    return () => (
      <div class="p-6">
        {/* 错误提示 */}
        {state.value.error && (
          <a-alert
            message="错误"
            description={state.value.error.message}
            type="error"
            showIcon
            class="mb-4"
          />
        )}

        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-medium">任务管理</h2>
          <a-button
            type="primary"
            onClick={() => (modals.value.createTask = true)}
            loading={state.value.loading}
          >
            {{
              icon: () => <PlusOutlined />,
              default: () => '新建任务',
            }}
          </a-button>
        </div>

        {/* 搜索筛选 */}
        <div class="bg-white p-4 mb-4 rounded-lg shadow-sm">
          <div class="flex flex-wrap gap-4">
            <a-input-search
              v-model:value={filters.value.searchText}
              placeholder="搜索程序名称"
              style="width: 250px"
              allowClear
              loading={state.value.loading}
            >
              {{
                prefix: () => <SearchOutlined />,
              }}
            </a-input-search>

            <a-select
              v-model:value={filters.value.status}
              mode="multiple"
              style="min-width: 200px"
              placeholder="状态筛选"
              allowClear
            >
              <a-select-option value={TaskStatus.RUNNING}>运行中</a-select-option>
              <a-select-option value={TaskStatus.PAUSED}>已暂停</a-select-option>
              <a-select-option value={TaskStatus.STOPPED}>已停止</a-select-option>
            </a-select>

            <a-select
              v-model:value={filters.value.priority}
              mode="multiple"
              style="min-width: 200px"
              placeholder="优先级筛选"
              allowClear
            >
              <a-select-option value={Priority.HIGH}>高优先级</a-select-option>
              <a-select-option value={Priority.MEDIUM}>中优先级</a-select-option>
              <a-select-option value={Priority.LOW}>低优先级</a-select-option>
            </a-select>
          </div>
        </div>

        {/* 任务统计卡片 */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <a-card hoverable class="stat-card stat-card-primary">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg text-gray-600 mb-2">总任务数</div>
                <div class="text-3xl font-bold mb-4">{taskStats.value.total}</div>
              </div>
              <div class="text-4xl text-primary-300">
                <FileTextOutlined />
              </div>
            </div>
            <div class="mt-2">
              <div class="flex justify-between mb-1">
                <span>成功率</span>
                <span>{taskStats.value.successRate}%</span>
              </div>
              <a-progress
                percent={100}
                success={{ percent: taskStats.value.successRate }}
                strokeColor={{
                  from: '#108ee9',
                  to: '#87d068',
                }}
                showInfo={false}
                strokeWidth={8}
                class="custom-progress"
              />
            </div>
          </a-card>

          <a-card hoverable class="stat-card stat-card-success">
            <div class="grid grid-cols-2 gap-4">
              <div class="stat-item">
                <div class="text-lg text-gray-600 mb-2">运行中</div>
                <div class="text-3xl font-bold text-success">{taskStats.value.running}</div>
                <div class="text-sm text-gray-500 mt-2">活跃任务</div>
              </div>
              <div class="stat-item">
                <div class="text-lg text-gray-600 mb-2">已完成</div>
                <div class="text-3xl font-bold text-primary">{taskStats.value.completed}</div>
                <div class="text-sm text-gray-500 mt-2">成功任务</div>
              </div>
            </div>
          </a-card>

          <a-card hoverable class="stat-card stat-card-warning">
            <div class="grid grid-cols-2 gap-4">
              <div class="stat-item">
                <div class="text-lg text-gray-600 mb-2">失败数</div>
                <div class="text-3xl font-bold text-error">{taskStats.value.failed}</div>
                <div class="text-sm text-gray-500 mt-2">异常任务</div>
              </div>
              <div class="stat-item">
                <div class="text-lg text-gray-600 mb-2">平均耗时</div>
                <div class="text-3xl font-bold text-warning">{taskStats.value.avgDuration}</div>
                <div class="text-sm text-gray-500 mt-2">执行时长</div>
              </div>
            </div>
          </a-card>
        </div>

        {/* 批量操作按钮 */}
        <div class="mb-4">
          <a-space>
            <a-button
              type="primary"
              onClick={() => batchOperation('start')}
              disabled={!selectedTaskKeys.value.length}
              loading={state.value.loading}
            >
              批量启动
            </a-button>
            <a-button
              onClick={() => batchOperation('pause')}
              disabled={!selectedTaskKeys.value.length}
              loading={state.value.loading}
            >
              批量暂停
            </a-button>
            <a-button
              danger
              onClick={() => batchOperation('stop')}
              disabled={!selectedTaskKeys.value.length}
              loading={state.value.loading}
            >
              批量停止
            </a-button>
          </a-space>
        </div>

        {/* 任务列表添加选择功能 */}
        <a-table
          rowSelection={{
            selectedRowKeys: selectedTaskKeys.value,
            onChange: (selectedRowKeys: string[]) => {
              selectedTaskKeys.value = selectedRowKeys
            },
          }}
          loading={state.value.loading}
          columns={columns}
          dataSource={filteredTasks.value}
          pagination={{
            ...state.value.pagination,
            onChange: (page: number, pageSize: number) => {
              state.value.pagination.current = page
              state.value.pagination.pageSize = pageSize
              fetchTasks()
            },
          }}
          bordered
          size="middle"
          scroll={{ x: 1300 }}
        />

        {/* 任务详情弹框 */}
        <a-modal
          v-model:visible={modals.value.taskDetail}
          title="任务详情"
          footer={null}
          width={800}
        >
          {currentTask.value && renderTaskDetail(currentTask.value)}
        </a-modal>

        {/* 创建任务弹框 */}
        <a-modal
          v-model:visible={modals.value.createTask}
          title="创建任务"
          onOk={handleCreateTask}
          confirmLoading={state.value.loading}
          width={800}
        >
          <a-form
            ref={formRef}
            model={taskForm.value}
            rules={{
              name: [{ required: true, message: '请输入程序名称' }],
              command: [{ required: true, message: '请输入执行命令' }],
            }}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <a-form-item label="程序名称" name="name">
              <a-input v-model:value={taskForm.value.name} placeholder="请输入程序名称" />
            </a-form-item>
            <a-form-item label="优先级" name="priority">
              <a-radio-group v-model:value={taskForm.value.priority}>
                <a-radio-button value={Priority.HIGH}>高</a-radio-button>
                <a-radio-button value={Priority.MEDIUM}>中</a-radio-button>
                <a-radio-button value={Priority.LOW}>低</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="执行命令" name="command">
              <a-input v-model:value={taskForm.value.command} placeholder="请输入执行命令" />
            </a-form-item>
            <a-form-item label="命令参数" name="args">
              <a-input v-model:value={taskForm.value.args} placeholder="请输入命令参数" />
            </a-form-item>
            <a-form-item label="任务描述" name="description">
              <a-textarea
                v-model:value={taskForm.value.description}
                rows={4}
                placeholder="请输入任务描述"
              />
            </a-form-item>
          </a-form>
        </a-modal>

        {/* 任务日志弹框 */}
        <a-modal v-model:visible={modals.value.taskLogs} title="任务日志" footer={null} width={800}>
          {currentTask.value && (
            <div class="bg-black text-white p-4 rounded-lg font-mono text-sm h-96 overflow-auto">
              {state.value.logs.map((log, index) => (
                <div key={index} class="mb-2">
                  <span class="text-gray-400">{log.time}</span>
                  <span
                    class={{
                      'text-green-400': log.type === 'success',
                      'text-yellow-400': log.type === 'warning',
                      'text-red-400': log.type === 'error',
                      'text-blue-400': log.type === 'info',
                    }}
                  >
                    [{log.type.toUpperCase()}]
                  </span>
                  <span class="ml-2">{log.content}</span>
                </div>
              ))}
            </div>
          )}
        </a-modal>

        {/* 任务历史记录弹框 */}
        <a-modal
          v-model:visible={modals.value.taskHistory}
          title="执行历史"
          footer={null}
          width={800}
        >
          <a-table
            loading={loadingHistory.value}
            dataSource={taskHistory.value}
            columns={[
              {
                title: '开始时间',
                dataIndex: 'startTime',
                key: 'startTime',
              },
              {
                title: '结束时间',
                dataIndex: 'endTime',
                key: 'endTime',
              },
              {
                title: '执行时长',
                dataIndex: 'duration',
                key: 'duration',
              },
              {
                title: '执行结果',
                dataIndex: 'result',
                key: 'result',
                customRender: ({ text }: { text: string }) => (
                  <a-tag color={text === 'success' ? '#52c41a' : '#ff4d4f'}>
                    {text === 'success' ? '成功' : '失败'}
                  </a-tag>
                ),
              },
              {
                title: '错误信息',
                dataIndex: 'errorMessage',
                key: 'errorMessage',
                customRender: ({ text }: { text: string }) => text || '-',
              },
            ]}
            pagination={false}
            size="small"
          />
        </a-modal>
      </div>
    )
  },
})
</script>

<style scoped>
/* 基础样式 */
.ant-table {
  background: white;
  border-radius: 8px;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

.bg-black {
  background-color: #1e1e1e;
}

:deep(.ant-modal-body) {
  max-height: 80vh;
  overflow-y: auto;
}

/* 统计卡片样式 */
:deep(.stat-card) {
  transition: all 0.3s;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

:deep(.stat-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

:deep(.stat-card-primary) {
  border-top: 4px solid var(--ant-primary-color);
}

:deep(.stat-card-success) {
  border-top: 4px solid var(--ant-success-color);
}

:deep(.stat-card-warning) {
  border-top: 4px solid var(--ant-warning-color);
}

:deep(.stat-item) {
  padding: 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s;
  background: rgba(255, 255, 255, 0.5);
}

:deep(.stat-item:hover) {
  background: rgba(255, 255, 255, 0.8);
}

/* 文字颜色 */
:deep(.text-success) {
  color: var(--ant-success-color);
}

:deep(.text-primary) {
  color: var(--ant-primary-color);
}

:deep(.text-warning) {
  color: var(--ant-warning-color);
}

:deep(.text-error) {
  color: var(--ant-error-color);
}

:deep(.text-primary-300) {
  color: var(--ant-primary-3);
}

/* 进度条样式 */
:deep(.ant-progress-bg) {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-progress-status-active .ant-progress-bg) {
  position: relative;
  overflow: hidden;
}

:deep(.ant-progress-status-active .ant-progress-bg::before) {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.2) 25%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.2) 75%
  );
  animation: progress-active 2s ease infinite;
}

@keyframes progress-active {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  :deep(.stat-card) {
    margin-bottom: 1rem;
  }

  :deep(.text-3xl) {
    font-size: 1.5rem;
  }

  :deep(.text-4xl) {
    font-size: 1.875rem;
  }
}
</style>
