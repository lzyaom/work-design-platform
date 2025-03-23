import { defineComponent, ref, computed, onMounted } from 'vue'
import {
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Input,
  Select,
  DatePicker,
  Drawer,
  Descriptions,
  message,
  Pagination,
  Spin,
} from 'ant-design-vue'
import {
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { TableColumnsType } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/table/interface'

dayjs.extend(isToday)
dayjs.extend(relativeTime)

// 日志级别枚举
const LogLevel = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug',
} as const

type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel]

// 日志项接口
interface LogItem {
  id: string
  level: LogLevelType
  message: string
  timestamp: string
  details?: string
  source?: string
  ip?: string
  userId?: string
  duration?: number
}

export default defineComponent({
  name: 'LogsManagement',
  setup() {
    // 状态管理
    const loading = ref(false)
    const searchText = ref('')
    const selectedLevel = ref<LogLevelType[]>([])
    const selectedLog = ref<LogItem | null>(null)
    const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(7, 'day'), dayjs()])
    const selectedRowKeys = ref<string[]>([])
    const drawerVisible = ref(false)

    // 分页配置
    const pagination = ref({
      current: 1,
      pageSize: 10,
      total: 0,
    })

    // 模拟日志数据
    const logs = ref<LogItem[]>([
      {
        id: '1',
        level: LogLevel.INFO,
        message: '系统启动成功',
        timestamp: '2024-03-21 10:00:00',
        details: '系统初始化完成，所有服务正常运行',
        source: 'system',
        ip: '192.168.1.1',
        userId: 'admin',
        duration: 1200,
      },
      {
        id: '2',
        level: LogLevel.WARNING,
        message: '磁盘空间不足',
        timestamp: '2024-03-21 10:30:00',
        details: '当前磁盘使用率达到85%，请及时清理',
        source: 'disk-monitor',
        ip: '192.168.1.1',
        userId: 'system',
        duration: 50,
      },
      {
        id: '3',
        level: LogLevel.ERROR,
        message: '数据库连接失败',
        timestamp: '2024-03-21 11:00:00',
        details: '无法连接到主数据库，请检查网络或数据库状态',
        source: 'database',
        ip: '192.168.1.2',
        userId: 'system',
        duration: 5000,
      },
    ])

    // 日志级别配置
    const levelConfig = {
      [LogLevel.INFO]: {
        color: '#52c41a',
        text: '信息',
        icon: 'info-circle',
      },
      [LogLevel.WARNING]: {
        color: '#faad14',
        text: '警告',
        icon: 'warning',
      },
      [LogLevel.ERROR]: {
        color: '#ff4d4f',
        text: '错误',
        icon: 'close-circle',
      },
      [LogLevel.DEBUG]: {
        color: '#1890ff',
        text: '调试',
        icon: 'bug',
      },
    }

    // 表格列定义
    const columns: TableColumnsType = [
      {
        title: '时间',
        dataIndex: 'timestamp',
        width: 180,
        sorter: (a: LogItem, b: LogItem) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
        showSorterTooltip: false,
        customRender: ({ text }) => (
          <span title={text as string}>{dayjs(text as string).fromNow()}</span>
        ),
      },
      {
        title: '级别',
        dataIndex: 'level',
        width: 100,
        filters: Object.entries(LogLevel).map(([, value]) => ({
          text: levelConfig[value].text,
          value,
        })),
        onFilter: (value: string | number | boolean, record: LogItem) =>
          record.level === value.toString(),
        customRender: ({ text }) => (
          <Tag color={levelConfig[text as LogLevelType].color}>
            {levelConfig[text as LogLevelType].text}
          </Tag>
        ),
      },
      {
        title: '来源',
        dataIndex: 'source',
        width: 120,
      },
      {
        title: '消息',
        dataIndex: 'message',
        customRender: ({ text, record }) => (
          <a onClick={() => showLogDetail(record)} class="text-primary hover:text-primary-dark">
            {text}
          </a>
        ),
      },
      {
        title: 'IP地址',
        dataIndex: 'ip',
        width: 120,
      },
      {
        title: '用户',
        dataIndex: 'userId',
        width: 120,
      },
      {
        title: '耗时',
        dataIndex: 'duration',
        width: 100,
        sorter: (a: LogItem, b: LogItem) => (a.duration || 0) - (b.duration || 0),
        showSorterTooltip: false,
        customRender: ({ text }) => (
          <Tag color={text > 1000 ? 'red' : text > 500 ? 'orange' : 'green'}>
            {text ? `${text}ms` : '-'}
          </Tag>
        ),
      },
    ]

    // 计算过滤后的日志
    const filteredLogs = computed(() => {
      return logs.value
      // return logs.value.filter((log) => {
      //   const matchesSearch = log.message.toLowerCase().includes(searchText.value.toLowerCase())
      //   const matchesLevel =
      //     selectedLevel.value.length === 0 || selectedLevel.value.includes(log.level)
      //   const matchesDate =
      //     dayjs(log.timestamp).isAfter(dateRange.value[0]) &&
      //     dayjs(log.timestamp).isBefore(dateRange.value[1])
      //   return matchesSearch && matchesLevel && matchesDate
      // })
    })

    // 刷新日志数据
    const refreshLogs = async () => {
      loading.value = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        message.success('日志刷新成功')
      } catch (error) {
        console.error(error)
        message.error('刷新日志失败')
      } finally {
        loading.value = false
      }
    }

    // 导出日志
    const exportLogs = () => {
      const data = filteredLogs.value.map((log) => ({
        时间: log.timestamp,
        级别: levelConfig[log.level].text,
        来源: log.source,
        消息: log.message,
        详情: log.details,
        IP地址: log.ip,
        用户: log.userId,
        耗时: log.duration ? `${log.duration}ms` : '-',
      }))

      const csvContent =
        '时间,级别,来源,消息,详情,IP地址,用户,耗时\n' +
        data
          .map((row) =>
            Object.values(row)
              .map((val) => `"${val}"`)
              .join(','),
          )
          .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `日志导出_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`
      link.click()
      message.success('日志导出成功')
    }

    // 清空日志
    const clearLogs = () => {
      Modal.confirm({
        title: '确认清空日志？',
        content: '此操作将清空所有已选择的日志记录，是否继续？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          loading.value = true
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            logs.value = logs.value.filter((log) => !selectedRowKeys.value.includes(log.id))
            selectedRowKeys.value = []
            message.success('日志清空成功')
          } catch (error) {
            console.error(error)
            message.error('清空日志失败')
          } finally {
            loading.value = false
          }
        },
      })
    }

    // 查看日志详情
    const showLogDetail = (log: LogItem) => {
      selectedLog.value = log
      drawerVisible.value = true
    }

    // 初始化
    onMounted(() => {
      refreshLogs()
    })

    // 渲染统计卡片
    const renderStatCards = () => {
      const cards = [
        {
          title: '总日志数',
          value: filteredLogs.value.length,
          subTitle: `今日新增: ${
            logs.value.filter((log) => dayjs(log.timestamp).isToday()).length
          }`,
          icon: <FileTextOutlined />,
          type: 'info',
        },
        {
          title: '正常信息',
          value: logs.value.filter((log) => log.level === LogLevel.INFO).length,
          subTitle: `占比: ${(
            (logs.value.filter((log) => log.level === LogLevel.INFO).length / logs.value.length) *
            100
          ).toFixed(1)}%`,
          icon: <CheckCircleOutlined />,
          type: 'success',
        },
        {
          title: '警告信息',
          value: logs.value.filter((log) => log.level === LogLevel.WARNING).length,
          subTitle: `占比: ${(
            (logs.value.filter((log) => log.level === LogLevel.WARNING).length /
              logs.value.length) *
            100
          ).toFixed(1)}%`,
          icon: <WarningOutlined />,
          type: 'warning',
        },
        {
          title: '错误信息',
          value: logs.value.filter((log) => log.level === LogLevel.ERROR).length,
          subTitle: `占比: ${(
            (logs.value.filter((log) => log.level === LogLevel.ERROR).length / logs.value.length) *
            100
          ).toFixed(1)}%`,
          icon: <CloseCircleOutlined />,
          type: 'error',
        },
      ]

      return (
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {cards.map((card) => (
            <Card
              hoverable
              class={`stat-card stat-card-${card.type} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${
                card.type === 'info'
                  ? 'from-blue-50 to-blue-100'
                  : card.type === 'success'
                    ? 'from-green-50 to-green-100'
                    : card.type === 'warning'
                      ? 'from-orange-50 to-orange-100'
                      : 'from-red-50 to-red-100'
              }`}
            >
              <div class="flex items-center justify-between h-full relative">
                <div class="flex flex-col justify-center">
                  <div class="text-lg text-gray-600 mb-2 font-semibold">{card.title}</div>
                  <div
                    class={`text-4xl font-black ${
                      card.type === 'info'
                        ? 'text-blue-600'
                        : card.type === 'success'
                          ? 'text-green-600'
                          : card.type === 'warning'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                    } mb-2`}
                  >
                    {card.value}
                  </div>
                  <div class="text-sm text-gray-500">{card.subTitle}</div>
                </div>
                <div
                  class={`text-4xl ${
                    card.type === 'info'
                      ? 'text-blue-300'
                      : card.type === 'success'
                        ? 'text-green-300'
                        : card.type === 'warning'
                          ? 'text-orange-300'
                          : 'text-red-300'
                  }`}
                >
                  {card.icon}
                </div>
                <div class="absolute right-4 top-4 text-3xl opacity-50">
                  {card.type === 'info'
                    ? '📰'
                    : card.type === 'success'
                      ? '✅'
                      : card.type === 'warning'
                        ? '⚠️'
                        : '❌'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }

    // 渲染操作栏
    const renderToolbar = () => (
      <div class="bg-white p-4 mb-2 rounded-md shadow-sm">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <DatePicker.RangePicker
              v-model:value={dateRange.value}
              allowClear
              disabledDate={(current: dayjs.Dayjs) => current && current > dayjs().endOf('day')}
            ></DatePicker.RangePicker>
            <Input.Search
              v-model:value={searchText.value}
              placeholder="搜索日志内容"
              class="w-[250px]"
              allowClear
              enterButton={true}
              onSearch={refreshLogs}
            ></Input.Search>
            <Select
              v-model:value={selectedLevel.value}
              mode="multiple"
              style={{ minWidth: '200px' }}
              placeholder="日志级别"
              allowClear
            >
              {Object.entries(LogLevel).map(([, value]) => (
                <Select.Option key={value} value={value}>
                  <Tag color={levelConfig[value].color}>{levelConfig[value].text}</Tag>
                </Select.Option>
              ))}
            </Select>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <Button type="primary" loading={loading.value} onClick={refreshLogs}>
              {loading.value ? '刷新中...' : '刷新'}
            </Button>
            <Button disabled={!filteredLogs.value.length} onClick={exportLogs}>
              <DownloadOutlined />
              导出
            </Button>
            <Button danger disabled={!selectedRowKeys.value.length} onClick={clearLogs}>
              <DeleteOutlined />
              清空
            </Button>
          </div>
        </div>
      </div>
    )

    // 渲染日志详情
    const renderLogDetail = () => {
      if (!selectedLog.value) return null

      return (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="时间">
            <div class="flex flex-col">
              <span>{selectedLog.value.timestamp}</span>
              <span class="text-gray-500 text-sm">
                {dayjs(selectedLog.value.timestamp).fromNow()}
              </span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="级别">
            <Tag color={levelConfig[selectedLog.value.level].color}>
              {levelConfig[selectedLog.value.level].text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="来源">{selectedLog.value.source}</Descriptions.Item>
          <Descriptions.Item label="IP地址">{selectedLog.value.ip}</Descriptions.Item>
          <Descriptions.Item label="用户">{selectedLog.value.userId}</Descriptions.Item>
          <Descriptions.Item label="耗时">
            <Tag
              color={
                selectedLog.value.duration && selectedLog.value.duration > 1000
                  ? 'red'
                  : selectedLog.value.duration && selectedLog.value.duration > 500
                    ? 'orange'
                    : 'green'
              }
            >
              {selectedLog.value.duration ? `${selectedLog.value.duration}ms` : '-'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="消息">{selectedLog.value.message}</Descriptions.Item>
          <Descriptions.Item label="详细信息">
            <div class="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg font-mono text-sm">
              {selectedLog.value.details}
            </div>
          </Descriptions.Item>
        </Descriptions>
      )
    }

    return () => (
      <div class="p-6">
        {renderStatCards()}
        {renderToolbar()}

        <div class="shadow-sm">
          <Spin spinning={loading.value} tip="加载中...">
            <Table
              rowSelection={{
                selectedRowKeys: selectedRowKeys.value,
                onChange: (selectedKeys: Key[]) => {
                  selectedRowKeys.value = selectedKeys as string[]
                },
              }}
              columns={columns}
              dataSource={filteredLogs.value}
              loading={false}
              rowKey="id"
              pagination={false}
              bordered
              size="middle"
              scroll={{ x: 1200 }}
            />
            <Pagination
              current={pagination.value.current}
              total={pagination.value.total}
              pageSize={pagination.value.pageSize}
              showLessItems
              showTotal={(total) => `共 ${total} 条`}
              class="py-4 rounded-b-md rounded-bl-md bg-white text-right"
              onChange={(page: number, pageSize: number) => {
                pagination.value.current = page
                pagination.value.pageSize = pageSize
              }}
            ></Pagination>
          </Spin>
        </div>

        <Drawer
          v-model:open={drawerVisible.value}
          title="日志详情"
          width={600}
          onClose={() => (selectedLog.value = null)}
          class="log-drawer"
        >
          {renderLogDetail()}
        </Drawer>
      </div>
    )
  },
})
