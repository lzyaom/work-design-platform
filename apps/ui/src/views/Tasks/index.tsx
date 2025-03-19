import { defineComponent, ref, onMounted } from 'vue'
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Radio,
  Descriptions,
  Progress,
  Alert,
  message,
  Pagination,
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/table/interface'

// 任务状态枚举
enum TaskStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  PAUSED = 'paused',
}

// 优先级枚举
enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// 优先级颜色映射
const priorityColors = {
  [Priority.HIGH]: '#f5222d',
  [Priority.MEDIUM]: '#faad14',
  [Priority.LOW]: '#52c41a',
}

// 任务接口定义
interface Task {
  id: string
  name: string
  status: TaskStatus
  priority: Priority
  duration: string
  cpu: string
  memory: string
  progress: number
  error?: boolean
  lastError?: string
  lastErrorTime?: string
  command?: string
  args?: string
  description?: string
}

// 任务历史记录接口
interface TaskHistory {
  id: string
  startTime: string
  endTime: string
  duration: string
  result: 'success' | 'failed'
  errorMessage?: string
}

// 任务统计接口
interface TaskStats {
  total: number
  running: number
  completed: number
  failed: number
  avgDuration: string
  successRate: number
}

export default defineComponent({
  name: 'TaskManagement',
  setup() {
    // 状态定义
    const state = ref({
      loading: false,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 20,
      },
      logs: [] as Array<{
        time: string
        type: 'success' | 'warning' | 'error' | 'info'
        content: string
      }>,
    })

    // 模态框状态
    const modals = ref({
      taskDetail: false,
      createTask: false,
      taskLogs: false,
      taskHistory: false,
    })

    // 表单状态
    const taskForm = ref({
      name: '',
      priority: Priority.MEDIUM,
      command: '',
      args: '',
      description: '',
    })

    // 当前选中的任务
    const currentTask = ref<Task | null>(null)

    // 任务列表
    const tasks = ref<Task[]>([
      {
        id: '1',
        name: 'Node服务',
        status: TaskStatus.RUNNING,
        priority: Priority.HIGH,
        duration: '2h 30m',
        cpu: '45%',
        memory: '512MB',
        progress: 75,
      },
      {
        id: '2',
        name: 'MySQL备份',
        status: TaskStatus.STOPPED,
        priority: Priority.MEDIUM,
        duration: '1h 15m',
        cpu: '30%',
        memory: '256MB',
        progress: 100,
      },
      {
        id: '3',
        name: '日志清理',
        status: TaskStatus.PAUSED,
        priority: Priority.LOW,
        duration: '45m',
        cpu: '15%',
        memory: '128MB',
        progress: 50,
        error: true,
        lastError: '磁盘空间不足',
        lastErrorTime: '2024-03-21 15:30:00',
      },
    ])

    // 过滤后的任务列表
    const filteredTasks = ref(tasks.value)

    // 表格列定义
    const columns: TableColumnsType = [
      {
        title: '程序名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '运行状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        sorter: (a: Task, b: Task) => a.status.localeCompare(b.status),
        showSorterTooltip: false,
        customRender: ({ text }: { text: TaskStatus }) => (
          <Tag color={text === TaskStatus.RUNNING ? '#52c41a' : '#ff4d4f'}>
            {text === TaskStatus.RUNNING ? '运行中' : '已停止'}
          </Tag>
        ),
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 100,
        sorter: (a: Task, b: Task) => a.priority.localeCompare(b.priority),
        showSorterTooltip: false,
        customRender: ({ text }: { text: Priority }) => (
          <Tag color={priorityColors[text]}>
            {text === Priority.HIGH ? '高' : text === Priority.MEDIUM ? '中' : '低'}
          </Tag>
        ),
      },
      {
        title: '运行时长',
        dataIndex: 'duration',
        key: 'duration',
        width: 100,
      },
      // {
      //   title: 'CPU占用',
      //   dataIndex: 'cpu',
      //   key: 'cpu',
      //   width: 150,
      //   customRender: ({ text }: { text: string; record: Task }) => (
      //     <Progress
      //       percent={Number(text.replace('%', ''))}
      //       status={Number(text.replace('%', '')) > 80 ? 'exception' : 'normal'}
      //       size="small"
      //     />
      //   ),
      // },
      // {
      //   title: '内存占用',
      //   dataIndex: 'memory',
      //   key: 'memory',
      //   width: 150,
      //   customRender: ({ text }: { text: string; record: Task }) => (
      //     <Progress
      //       percent={Number(text.replace(/[A-Za-z%]/g, ''))}
      //       status={Number(text.replace(/[A-Za-z%]/g, '')) > 80 ? 'exception' : 'normal'}
      //       size="small"
      //     />
      //   ),
      // },
      {
        title: '执行进度',
        dataIndex: 'progress',
        key: 'progress',
        width: 150,
        customRender: ({ text, record }: { text: number; record: Task }) => (
          <Progress
            percent={text}
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
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        customRender: ({ record }: { record: Task }) => (
          <Space>
            <Button type="link" onClick={() => showTaskDetail(record)}>
              详情
            </Button>
            <Button type="link" onClick={() => showTaskLogs(record)}>
              日志
            </Button>
            <Button type="link" onClick={() => showTaskHistory(record)}>
              历史
            </Button>
            {record.status === TaskStatus.RUNNING ? (
              <Button type="link" danger onClick={() => handleTaskOperation(record, 'stop')}>
                停止
              </Button>
            ) : (
              <Button type="link" onClick={() => handleTaskOperation(record, 'start')}>
                启动
              </Button>
            )}
          </Space>
        ),
      },
    ]

    // 任务历史记录
    const taskHistory = ref<TaskHistory[]>([])
    const loadingHistory = ref(false)

    // 任务统计
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

    // 显示任务详情
    const showTaskDetail = (task: Task) => {
      currentTask.value = task
      modals.value.taskDetail = true
    }

    // 显示任务日志
    const showTaskLogs = (task: Task) => {
      currentTask.value = task
      modals.value.taskLogs = true
      // 模拟加载日志
      state.value.logs = [
        {
          time: '2024-03-21 15:30:00',
          type: 'info',
          content: '任务启动',
        },
        {
          time: '2024-03-21 15:30:01',
          type: 'success',
          content: '初始化完成',
        },
        {
          time: '2024-03-21 15:30:02',
          type: 'warning',
          content: '内存使用率超过80%',
        },
      ]
    }

    // 显示任务历史
    const showTaskHistory = async (task: Task) => {
      currentTask.value = task
      modals.value.taskHistory = true
      loadingHistory.value = true
      try {
        // 模拟加载历史记录
        await new Promise((resolve) => setTimeout(resolve, 1000))
        taskHistory.value = [
          {
            id: '1',
            startTime: '2024-03-21 10:00:00',
            endTime: '2024-03-21 11:00:00',
            duration: '1h',
            result: 'success',
          },
          {
            id: '2',
            startTime: '2024-03-21 12:00:00',
            endTime: '2024-03-21 12:30:00',
            duration: '30m',
            result: 'failed',
            errorMessage: '内存不足',
          },
        ]
      } finally {
        loadingHistory.value = false
      }
    }

    // 处理任务操作
    const handleTaskOperation = async (task: Task, operation: 'start' | 'stop' | 'pause') => {
      state.value.loading = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const index = tasks.value.findIndex((t) => t.id === task.id)
        if (index !== -1) {
          tasks.value[index] = {
            ...task,
            status: operation === 'start' ? TaskStatus.RUNNING : TaskStatus.STOPPED,
          }
        }
        message.success(`任务${operation === 'start' ? '启动' : '停止'}成功`)
      } catch (error) {
        console.error(error)
        message.error(`任务${operation === 'start' ? '启动' : '停止'}失败`)
      } finally {
        state.value.loading = false
      }
    }

    // 批量操作
    const batchOperation = async (operation: 'start' | 'stop' | 'pause') => {
      if (!selectedTaskKeys.value.length) {
        message.warning('请选择要操作的任务')
        return
      }

      state.value.loading = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        tasks.value = tasks.value.map((task) => {
          if (selectedTaskKeys.value.includes(task.id)) {
            return {
              ...task,
              status: operation === 'start' ? TaskStatus.RUNNING : TaskStatus.STOPPED,
            }
          }
          return task
        })
        message.success(`批量${operation === 'start' ? '启动' : '停止'}成功`)
      } catch (error) {
        console.error(error)
        message.error(`批量${operation === 'start' ? '启动' : '停止'}失败`)
      } finally {
        state.value.loading = false
      }
    }

    // 创建任务
    const handleCreateTask = async () => {
      state.value.loading = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const newTask: Task = {
          id: String(tasks.value.length + 1),
          name: taskForm.value.name,
          status: TaskStatus.STOPPED,
          priority: taskForm.value.priority,
          duration: '0s',
          cpu: '0%',
          memory: '0MB',
          progress: 0,
          command: taskForm.value.command,
          args: taskForm.value.args,
          description: taskForm.value.description,
        }
        tasks.value.push(newTask)
        message.success('任务创建成功')
        modals.value.createTask = false
      } catch (error) {
        console.error(error)
        message.error('任务创建失败')
      } finally {
        state.value.loading = false
      }
    }

    // 渲染任务详情
    const renderTaskDetail = (task: Task) => (
      <Descriptions bordered>
        <Descriptions.Item label="程序名称" span={3}>
          {task.name}
        </Descriptions.Item>
        <Descriptions.Item label="运行状态">
          <Tag color={task.status === TaskStatus.RUNNING ? '#52c41a' : '#ff4d4f'}>
            {task.status === TaskStatus.RUNNING ? '运行中' : '已停止'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="优先级">
          <Tag color={priorityColors[task.priority]}>
            {task.priority === Priority.HIGH
              ? '高'
              : task.priority === Priority.MEDIUM
                ? '中'
                : '低'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="运行时长">{task.duration}</Descriptions.Item>
        <Descriptions.Item label="CPU占用" span={2}>
          <Progress
            percent={Number(task.cpu.replace('%', ''))}
            status={Number(task.cpu.replace('%', '')) > 80 ? 'exception' : 'normal'}
          />
        </Descriptions.Item>
        <Descriptions.Item label="内存占用">
          <Progress
            percent={Number(task.memory.replace(/[A-Za-z%]/g, ''))}
            status={Number(task.memory.replace(/[A-Za-z%]/g, '')) > 80 ? 'exception' : 'normal'}
          />
        </Descriptions.Item>
        <Descriptions.Item label="执行进度" span={3}>
          <Progress
            percent={task.progress}
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
        </Descriptions.Item>
        {task.error && (
          <Descriptions.Item label="错误信息" span={3}>
            <Alert
              message={task.lastError}
              type="error"
              showIcon
              description={`最后错误时间: ${task.lastErrorTime}`}
            />
          </Descriptions.Item>
        )}
      </Descriptions>
    )

    // 初始化
    onMounted(() => {
      // 更新任务统计
      taskStats.value = {
        total: tasks.value.length,
        running: tasks.value.filter((t) => t.status === TaskStatus.RUNNING).length,
        completed: tasks.value.filter((t) => t.progress === 100).length,
        failed: tasks.value.filter((t) => t.error).length,
        avgDuration: '1h 30m',
        successRate: 75,
      }
    })

    return () => (
      <div class="p-6">
        {/* 统计卡片 */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card
            hoverable
            class="stat-card stat-card-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-50 to-blue-100"
          >
            <div class="grid grid-cols-2 gap-4 relative">
              <div class="absolute right-2 top-0 text-4xl opacity-50">📊</div>
              <div class="stat-item">
                <div class="text-lg text-blue-600 mb-2 font-semibold">总任务数</div>
                <div class="text-4xl font-black text-blue-800">{taskStats.value.total}</div>
                <div class="text-sm text-blue-500 mt-2">📋 所有任务</div>
              </div>
              <div class="stat-item">
                <div class="text-lg text-green-600 mb-2 font-semibold">运行中</div>
                <div class="text-4xl font-black text-green-800">{taskStats.value.running}</div>
                <div class="text-sm text-green-500 mt-2">🚀 活跃任务</div>
              </div>
            </div>
          </Card>

          <Card
            hoverable
            class="stat-card stat-card-success rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-50 to-green-100"
          >
            <div class="grid grid-cols-2 gap-4 relative">
              <div class="absolute right-2 top-0 text-4xl opacity-50">✅</div>
              <div class="stat-item">
                <div class="text-lg text-purple-600 mb-2 font-semibold">已完成</div>
                <div class="text-4xl font-black text-purple-800">{taskStats.value.completed}</div>
                <div class="text-sm text-purple-500 mt-2">🎉 完成任务</div>
              </div>
              <div class="stat-item">
                <div class="text-lg text-teal-600 mb-2 font-semibold">成功率</div>
                <div class="text-4xl font-black text-teal-800">{taskStats.value.successRate}%</div>
                <div class="text-sm text-teal-500 mt-2">📈 任务成功率</div>
              </div>
            </div>
          </Card>

          <Card
            hoverable
            class="stat-card stat-card-warning rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-50 to-orange-100"
          >
            <div class="grid grid-cols-2 gap-4 relative">
              <div class="absolute right-2 top-0 text-4xl opacity-50">⚠️</div>
              <div class="stat-item">
                <div class="text-lg text-red-600 mb-2 font-semibold">失败数</div>
                <div class="text-4xl font-black text-red-800">{taskStats.value.failed}</div>
                <div class="text-sm text-red-500 mt-2">💥 异常任务</div>
              </div>
              <div class="stat-item">
                <div class="text-lg text-amber-600 mb-2 font-semibold">平均耗时</div>
                <div class="text-4xl font-black text-amber-800">{taskStats.value.avgDuration}</div>
                <div class="text-sm text-amber-500 mt-2">⏱️ 执行时长</div>
              </div>
            </div>
          </Card>
        </div>

        {/* 批量操作按钮 */}
        <div class="mb-4 space-x-4">
          <Button
            type="primary"
            onClick={() => batchOperation('start')}
            disabled={!selectedTaskKeys.value.length}
            loading={state.value.loading}
          >
            批量启动
          </Button>
          <Button
            onClick={() => batchOperation('pause')}
            disabled={!selectedTaskKeys.value.length}
            loading={state.value.loading}
          >
            批量暂停
          </Button>
          <Button
            danger
            onClick={() => batchOperation('stop')}
            disabled={!selectedTaskKeys.value.length}
            loading={state.value.loading}
          >
            批量停止
          </Button>
        </div>

        {/* 任务列表 */}
        <Table
          rowSelection={{
            selectedRowKeys: selectedTaskKeys.value,
            onChange: (selectedRowKeys: Key[]) => {
              console.log(selectedRowKeys)

              selectedTaskKeys.value = selectedRowKeys as string[]
            },
          }}
          loading={state.value.loading}
          columns={columns}
          dataSource={filteredTasks.value}
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: 1000, y: 800, scrollToFirstRowOnChange: true }}
        />

        <Pagination
          current={state.value.pagination.current}
          total={state.value.pagination.total}
          pageSize={state.value.pagination.pageSize}
          showLessItems
          showTotal={(total) => `共 ${total} 条`}
          class="py-4 rounded-b-md rounded-bl-md bg-white text-right"
          onChange={(page: number, pageSize: number) => {
            state.value.pagination.current = page
            state.value.pagination.pageSize = pageSize
          }}
        ></Pagination>

        {/* 任务详情弹框 */}
        <Modal
          v-model:open={modals.value.taskDetail}
          title="任务详情"
          footer={null}
          width={800}
          destroyOnClose
        >
          {currentTask.value && renderTaskDetail(currentTask.value)}
        </Modal>

        {/* 创建任务弹框 */}
        <Modal
          v-model:open={modals.value.createTask}
          title="创建任务"
          onOk={handleCreateTask}
          confirmLoading={state.value.loading}
          width={800}
          destroyOnClose
        >
          <Form model={taskForm.value} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <Form.Item
              label="程序名称"
              name="name"
              rules={[{ required: true, message: '请输入程序名称' }]}
            >
              <Input v-model:value={taskForm.value.name} placeholder="请输入程序名称" />
            </Form.Item>
            <Form.Item label="优先级" name="priority">
              <Radio.Group v-model:value={taskForm.value.priority}>
                <Radio.Button value={Priority.HIGH}>高</Radio.Button>
                <Radio.Button value={Priority.MEDIUM}>中</Radio.Button>
                <Radio.Button value={Priority.LOW}>低</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="执行命令"
              name="command"
              rules={[{ required: true, message: '请输入执行命令' }]}
            >
              <Input v-model:value={taskForm.value.command} placeholder="请输入执行命令" />
            </Form.Item>
            <Form.Item label="命令参数" name="args">
              <Input v-model:value={taskForm.value.args} placeholder="请输入命令参数" />
            </Form.Item>
            <Form.Item label="任务描述" name="description">
              <Input.TextArea
                v-model:value={taskForm.value.description}
                rows={4}
                placeholder="请输入任务描述"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 任务日志弹框 */}
        <Modal
          v-model:open={modals.value.taskLogs}
          title="任务日志"
          footer={null}
          width={800}
          destroyOnClose
        >
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
        </Modal>

        {/* 任务历史记录弹框 */}
        <Modal
          v-model:open={modals.value.taskHistory}
          title="执行历史"
          footer={null}
          width={800}
          destroyOnClose
        >
          <Table
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
                  <Tag color={text === 'success' ? '#52c41a' : '#ff4d4f'}>
                    {text === 'success' ? '成功' : '失败'}
                  </Tag>
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
        </Modal>
      </div>
    )
  },
})
