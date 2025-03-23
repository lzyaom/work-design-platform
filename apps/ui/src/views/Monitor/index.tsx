import { defineComponent, ref, onMounted, onUnmounted, cloneVNode } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
import { Card, Progress, Statistic, Alert, Button, Drawer, Table, Tag } from 'ant-design-vue'
import {
  DashboardOutlined,
  DatabaseOutlined,
  HddOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'

interface ProcessItem {
  pid: number
  name: string
  cpu: number
  memory: number
  status: 'running' | 'sleeping' | 'stopped'
}

interface NetworkInterface {
  name: string
  ip: string
  status: 'up' | 'down'
}

interface NetworkConnection {
  local: string
  remote: string
  protocol: 'TCP' | 'UDP'
  state: 'ESTABLISHED' | 'LISTENING'
}

export default defineComponent({
  name: 'MonitorManagement',
  setup() {
    // 模拟数据
    const cpuUsage = ref(0)
    const cpuLoad = ref(0)
    const memoryUsage = ref(0)
    const memoryLoad = ref(0)
    const diskUsage = ref(0)
    const diskLoad = ref(0)
    const uploadSpeed = ref(0)
    const downloadSpeed = ref(0)
    const processCount = ref(0)
    const processCpuLoad = ref(0)
    const processMemoryLoad = ref(0)
    const processDiskLoad = ref(0)

    // 告警阈值
    const thresholds = {
      cpu: 80,
      memory: 85,
      disk: 90,
    }

    // 加载状态
    const loading = ref(false)
    let timer: ReturnType<typeof setInterval>

    // 更新数据
    const updateData = async () => {
      loading.value = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 600))

        cpuUsage.value = Math.floor(Math.random() * 100)
        cpuLoad.value = Math.floor(Math.random() * 100)
        memoryUsage.value = Math.floor(Math.random() * 100)
        memoryLoad.value = Math.floor(Math.random() * 100)
        diskUsage.value = Math.floor(Math.random() * 100)
        diskLoad.value = Math.floor(Math.random() * 100)
        uploadSpeed.value = Math.floor(Math.random() * 1000)
        downloadSpeed.value = Math.floor(Math.random() * 1000)
        processCount.value = Math.floor(Math.random() * 100 + 50)
        processCpuLoad.value = Math.floor(Math.random() * 100)
        processMemoryLoad.value = Math.floor(Math.random() * 100)
        processDiskLoad.value = Math.floor(Math.random() * 100)

        if (processDrawerVisible.value) {
          updateProcessList()
        }
        if (networkDrawerVisible.value) {
          updateNetworkConnections()
        }
      } finally {
        loading.value = false
      }
    }

    // 手动刷新
    const handleRefresh = () => {
      updateData()
    }

    onMounted(() => {
      updateData()
      timer = setInterval(updateData, 30000)
    })

    onUnmounted(() => {
      clearInterval(timer)
    })

    // 进程列表
    const processList = ref<ProcessItem[]>([])
    const processColumns: TableColumnsType = [
      {
        title: 'PID',
        dataIndex: 'pid',
        width: 100,
      },
      {
        title: '进程名',
        dataIndex: 'name',
      },
      {
        title: 'CPU使用率',
        dataIndex: 'cpu',
        width: 120,
        customRender: ({ text }) => (
          <Tag color={text > 50 ? 'error' : text > 30 ? 'warning' : 'success'}>{text}%</Tag>
        ),
      },
      {
        title: '内存使用',
        dataIndex: 'memory',
        width: 120,
        customRender: ({ text }) => (
          <Tag color={text > 500 ? 'error' : text > 200 ? 'warning' : 'success'}>{text}MB</Tag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        customRender: ({ text }) => (
          <Tag color={text === 'running' ? 'success' : text === 'sleeping' ? 'warning' : 'default'}>
            {
              { running: '运行中', sleeping: '休眠', stopped: '已停止' }[
                text as ProcessItem['status']
              ]
            }
          </Tag>
        ),
      },
    ]

    // 网络详情
    const networkDetails = ref<{
      interfaces: NetworkInterface[]
      connections: NetworkConnection[]
    }>({
      interfaces: [
        { name: 'eth0', ip: '192.168.1.100', status: 'up' },
        { name: 'wlan0', ip: '192.168.1.101', status: 'down' },
      ],
      connections: [],
    })

    const networkColumns: TableColumnsType = [
      {
        title: '本地地址',
        dataIndex: 'local',
        width: 180,
      },
      {
        title: '远程地址',
        dataIndex: 'remote',
        width: 180,
      },
      {
        title: '协议',
        dataIndex: 'protocol',
        width: 100,
        customRender: ({ text }) => <Tag color={text === 'TCP' ? 'blue' : 'green'}>{text}</Tag>,
      },
      {
        title: '状态',
        dataIndex: 'state',
        width: 120,
        customRender: ({ text }) => (
          <Tag color={text === 'ESTABLISHED' ? 'success' : 'default'}>{text}</Tag>
        ),
      },
    ]

    // 抽屉控制
    const processDrawerVisible = ref(false)
    const networkDrawerVisible = ref(false)

    // 更新进程列表
    const updateProcessList = () => {
      processList.value = Array.from({ length: 20 }, () => ({
        pid: Math.floor(Math.random() * 10000),
        name: ['node', 'nginx', 'mysql', 'redis', 'python', 'java'][Math.floor(Math.random() * 6)],
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 1000),
        status: ['running', 'sleeping', 'stopped'][
          Math.floor(Math.random() * 3)
        ] as ProcessItem['status'],
      }))
    }

    // 更新网络连接
    const updateNetworkConnections = () => {
      networkDetails.value.connections = Array.from({ length: 10 }, () => ({
        local: `192.168.1.${Math.floor(Math.random() * 255)}:${Math.floor(Math.random() * 65535)}`,
        remote: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(
          Math.random() * 255,
        )}.${Math.floor(Math.random() * 255)}:${Math.floor(Math.random() * 65535)}`,
        protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
        state: Math.random() > 0.3 ? 'ESTABLISHED' : 'LISTENING',
      }))
    }

    // 显示进程详情
    const showProcessDetails = () => {
      updateProcessList()
      processDrawerVisible.value = true
    }

    // 显示网络详情
    const showNetworkDetails = () => {
      updateNetworkConnections()
      networkDrawerVisible.value = true
    }

    // 渲染监控卡片
    const renderMonitorCard = (
      title: string,
      icon: JSX.Element,
      content: JSX.Element,
      onDetail?: () => void,
      className?: string,
    ) => {
      return (
        <Card class={`shadow-sm hover:shadow-md transition-shadow ${className || ''}`}>
          <div class="flex items-center justify-between mb-4">
            <div class="inline-flex items-center">
              <div class="flex-shrink-0 flex items-center justify-center w-12 h-12">
                {cloneVNode(icon, { class: 'text-2xl' })}
              </div>
              <span class="text-lg font-medium ml-2">{title}</span>
            </div>
            {onDetail && (
              <Button type="link" class="flex items-center p-0" onClick={onDetail}>
                <EyeOutlined />
                <span class="ml-1">详情</span>
              </Button>
            )}
          </div>
          {content}
        </Card>
      )
    }

    return () => (
      <div class="p-6">
        {/* 顶部操作栏 */}
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-medium">系统监控</h2>
          <Button
            type="primary"
            class="flex items-center"
            loading={loading.value}
            onClick={handleRefresh}
          >
            <ReloadOutlined />
            <span class="ml-1">刷新</span>
          </Button>
        </div>

        {/* 告警信息 */}
        {(cpuUsage.value > thresholds.cpu ||
          memoryUsage.value > thresholds.memory ||
          diskUsage.value > thresholds.disk) && (
          <Alert
            type="warning"
            showIcon
            class="mb-6 alert-warning"
            message={<div class="font-medium">系统告警</div>}
            description={
              <div class="space-y-2">
                {cpuUsage.value > thresholds.cpu && (
                  <div>
                    CPU使用率超过{thresholds.cpu}%，当前{cpuUsage.value}%
                  </div>
                )}
                {memoryUsage.value > thresholds.memory && (
                  <div>
                    内存使用率超过{thresholds.memory}%，当前{memoryUsage.value}%
                  </div>
                )}
                {diskUsage.value > thresholds.disk && (
                  <div>
                    磁盘使用率超过{thresholds.disk}%，当前{diskUsage.value}%
                  </div>
                )}
              </div>
            }
          />
        )}

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CPU监控 */}
          {renderMonitorCard(
            'CPU监控',
            <DashboardOutlined class="text-2xl text-blue-500 mr-2" />,
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Statistic
                  title="CPU使用率"
                  value={cpuUsage.value}
                  valueStyle={{ color: cpuUsage.value > thresholds.cpu ? '#cf1322' : '#3f8600' }}
                  suffix="%"
                />
                <Progress
                  percent={cpuUsage.value}
                  strokeColor={cpuUsage.value > thresholds.cpu ? '#cf1322' : '#3f8600'}
                />
              </div>
              <div>
                <Statistic
                  title="CPU负载"
                  value={cpuLoad.value}
                  valueStyle={{ color: cpuLoad.value > thresholds.cpu ? '#cf1322' : '#3f8600' }}
                  suffix="%"
                />
                <Progress
                  percent={cpuLoad.value}
                  strokeColor={cpuLoad.value > thresholds.cpu ? '#cf1322' : '#3f8600'}
                />
              </div>
            </div>,
          )}

          {/* 内存监控 */}
          {renderMonitorCard(
            '内存监控',
            <DatabaseOutlined class="text-2xl text-green-500 mr-2" />,
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Statistic
                  title="内存使用率"
                  value={memoryUsage.value}
                  valueStyle={{
                    color: memoryUsage.value > thresholds.memory ? '#cf1322' : '#3f8600',
                  }}
                  suffix="%"
                />
                <Progress
                  percent={memoryUsage.value}
                  strokeColor={memoryUsage.value > thresholds.memory ? '#cf1322' : '#3f8600'}
                />
              </div>
              <div>
                <Statistic
                  title="内存负载"
                  value={memoryLoad.value}
                  valueStyle={{
                    color: memoryLoad.value > thresholds.memory ? '#cf1322' : '#3f8600',
                  }}
                  suffix="%"
                />
                <Progress
                  percent={memoryLoad.value}
                  strokeColor={memoryLoad.value > thresholds.memory ? '#cf1322' : '#3f8600'}
                />
              </div>
            </div>,
          )}

          {/* 磁盘监控 */}
          {renderMonitorCard(
            '磁盘监控',
            <HddOutlined class="text-2xl text-purple-500 mr-2" />,
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Statistic
                  title="磁盘使用率"
                  value={diskUsage.value}
                  valueStyle={{ color: diskUsage.value > thresholds.disk ? '#cf1322' : '#3f8600' }}
                  suffix="%"
                />
                <Progress
                  percent={diskUsage.value}
                  strokeColor={diskUsage.value > thresholds.disk ? '#cf1322' : '#3f8600'}
                />
              </div>
              <div>
                <Statistic
                  title="磁盘负载"
                  value={diskLoad.value}
                  valueStyle={{ color: diskLoad.value > thresholds.disk ? '#cf1322' : '#3f8600' }}
                  suffix="%"
                />
                <Progress
                  percent={diskLoad.value}
                  strokeColor={diskLoad.value > thresholds.disk ? '#cf1322' : '#3f8600'}
                />
              </div>
            </div>,
          )}

          {/* 网络监控 */}
          {renderMonitorCard(
            '网络监控',
            <div class="flex items-center">
              <CloudUploadOutlined class="text-2xl text-orange-500 mr-2" />
              <CloudDownloadOutlined class="text-2xl text-cyan-500 mr-2" />
            </div>,
            <div class="grid grid-cols-2 gap-4">
              <Statistic
                title="上传速度"
                value={uploadSpeed.value}
                precision={2}
                suffix="KB/s"
                valueStyle={{ color: '#3f8600' }}
              />
              <Statistic
                title="下载速度"
                value={downloadSpeed.value}
                precision={2}
                suffix="KB/s"
                valueStyle={{ color: '#3f8600' }}
              />
            </div>,
            showNetworkDetails,
          )}

          {/* 进程监控 */}
          {renderMonitorCard(
            '进程监控',
            <AppstoreOutlined class="text-2xl text-indigo-500 mr-2" />,
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Statistic title="进程数" value={processCount.value} />
              <div>
                <Statistic
                  title="CPU负载"
                  value={processCpuLoad.value}
                  valueStyle={{
                    color: processCpuLoad.value > thresholds.cpu ? '#cf1322' : '#3f8600',
                  }}
                  suffix="%"
                />
                <Progress
                  percent={processCpuLoad.value}
                  strokeColor={processCpuLoad.value > thresholds.cpu ? '#cf1322' : '#3f8600'}
                  size="small"
                />
              </div>
              <div>
                <Statistic
                  title="内存负载"
                  value={processMemoryLoad.value}
                  valueStyle={{
                    color: processMemoryLoad.value > thresholds.memory ? '#cf1322' : '#3f8600',
                  }}
                  suffix="%"
                />
                <Progress
                  percent={processMemoryLoad.value}
                  strokeColor={processMemoryLoad.value > thresholds.memory ? '#cf1322' : '#3f8600'}
                  size="small"
                />
              </div>
              <div>
                <Statistic
                  title="磁盘负载"
                  value={processDiskLoad.value}
                  valueStyle={{
                    color: processDiskLoad.value > thresholds.disk ? '#cf1322' : '#3f8600',
                  }}
                  suffix="%"
                />
                <Progress
                  percent={processDiskLoad.value}
                  strokeColor={processDiskLoad.value > thresholds.disk ? '#cf1322' : '#3f8600'}
                  size="small"
                />
              </div>
            </div>,
            showProcessDetails,
            'col-span-1 md:col-span-2 lg:col-span-2',
          )}
        </div>

        {/* 进程详情抽屉 */}
        <Drawer
          title="进程详情"
          placement="right"
          width={800}
          visible={processDrawerVisible.value}
          onClose={() => (processDrawerVisible.value = false)}
        >
          <Table
            columns={processColumns}
            dataSource={processList.value}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 400 }}
          />
        </Drawer>

        {/* 网络详情抽屉 */}
        <Drawer
          title="网络详情"
          placement="right"
          width={800}
          visible={networkDrawerVisible.value}
          onClose={() => (networkDrawerVisible.value = false)}
        >
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium mb-4">网络接口</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {networkDetails.value.interfaces.map((iface) => (
                  <Card size="small" key={iface.name}>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <span class="font-medium">{iface.name}</span>
                        <Tag color={iface.status === 'up' ? 'success' : 'error'}>
                          {iface.status === 'up' ? '已连接' : '未连接'}
                        </Tag>
                      </div>
                      <div class="text-gray-500">IP: {iface.ip}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-4">网络连接</h3>
              <Table
                columns={networkColumns}
                dataSource={networkDetails.value.connections}
                pagination={{ pageSize: 5 }}
                scroll={{ y: 300 }}
              />
            </div>
          </div>
        </Drawer>
      </div>
    )
  },
})
