<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import {
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import relativeTime from 'dayjs/plugin/relativeTime'

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
  name: 'Logs',
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
        details: '系统初始化��成，所有服务正常运行',
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
      {
        id: '4',
        level: LogLevel.DEBUG,
        message: 'API调用追踪',
        timestamp: '2024-03-21 11:30:00',
        details: 'GET /api/users 响应时间: 150ms',
        source: 'api-gateway',
        ip: '192.168.1.3',
        userId: 'user123',
        duration: 150,
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
    const columns = [
      {
        title: '时间',
        dataIndex: 'timestamp',
        width: 180,
        sorter: (a: LogItem, b: LogItem) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      },
      {
        title: '级别',
        dataIndex: 'level',
        width: 100,
        filters: Object.entries(LogLevel).map(([key, value]) => ({
          text: levelConfig[value].text,
          value,
        })),
        onFilter: (value: string, record: LogItem) => record.level === value,
      },
      {
        title: '来源',
        dataIndex: 'source',
        width: 120,
      },
      {
        title: '消息',
        dataIndex: 'message',
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
      },
    ]

    // 计算过滤后的日志
    const filteredLogs = computed(() => {
      return logs.value
      // .filter((log) => {
      // const matchesSearch = log.message.toLowerCase().includes(searchText.value.toLowerCase())
      // const matchesLevel =
      //   selectedLevel.value.length === 0 || selectedLevel.value.includes(log.level)
      // const matchesDate =
      //   dayjs(log.timestamp).isAfter(dateRange.value[0]) &&
      //   dayjs(log.timestamp).isBefore(dateRange.value[1])
      // return matchesSearch && matchesLevel && matchesDate
      // })
    })

    // 刷新日志数据
    const refreshLogs = async () => {
      loading.value = true
      try {
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // TODO: 实际项目中这里应该调用后端 API
        message.success('日志刷新成功')
      } catch (error) {
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
        content: '此操作将清空所有已选择的日志记录，是否继续��',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          loading.value = true
          try {
            // 模拟 API 调用
            await new Promise((resolve) => setTimeout(resolve, 1000))
            // TODO: 实际项目中这里应该调用后端 API
            logs.value = logs.value.filter((log) => !selectedRowKeys.value.includes(log.id))
            selectedRowKeys.value = []
            message.success('日志清空成功')
          } catch (error) {
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

    // 表格行选择配置
    const rowSelection = {
      selectedRowKeys: selectedRowKeys.value,
      onChange: (selectedKeys: string[]) => {
        selectedRowKeys.value = selectedKeys
      },
    }

    // 初始化
    onMounted(() => {
      refreshLogs()
    })

    return {
      loading,
      searchText,
      selectedLevel,
      selectedLog,
      dateRange,
      selectedRowKeys,
      pagination,
      logs,
      levelConfig,
      columns,
      filteredLogs,
      rowSelection,
      refreshLogs,
      exportLogs,
      clearLogs,
      showLogDetail,
      LogLevel,
      drawerVisible,
      dayjs,
    }
  },
})
</script>

<template>
  <div class="p-6">
    <!-- 顶部统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <a-card hoverable class="stat-card stat-card-info">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg text-gray-600 mb-2">总日志数</div>
            <div class="text-3xl font-bold mb-2">{{ filteredLogs.length }}</div>
            <div class="text-sm text-gray-500">
              今日新增: {{ logs.filter((log) => dayjs(log.timestamp).isToday()).length }}
            </div>
          </div>
          <div class="text-4xl text-info-300">
            <FileTextOutlined />
          </div>
        </div>
      </a-card>

      <a-card hoverable class="stat-card stat-card-success">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg text-gray-600 mb-2">正常信息</div>
            <div class="text-3xl font-bold text-success mb-2">
              {{ logs.filter((log) => log.level === LogLevel.INFO).length }}
            </div>
            <div class="text-sm text-gray-500">
              占比:
              {{
                (
                  (logs.filter((log) => log.level === LogLevel.INFO).length / logs.length) *
                  100
                ).toFixed(1)
              }}%
            </div>
          </div>
          <div class="text-4xl text-success-300">
            <CheckCircleOutlined />
          </div>
        </div>
      </a-card>

      <a-card hoverable class="stat-card stat-card-warning">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg text-gray-600 mb-2">警告信息</div>
            <div class="text-3xl font-bold text-warning mb-2">
              {{ logs.filter((log) => log.level === LogLevel.WARNING).length }}
            </div>
            <div class="text-sm text-gray-500">
              占比:
              {{
                (
                  (logs.filter((log) => log.level === LogLevel.WARNING).length / logs.length) *
                  100
                ).toFixed(1)
              }}%
            </div>
          </div>
          <div class="text-4xl text-warning-300">
            <WarningOutlined />
          </div>
        </div>
      </a-card>

      <a-card hoverable class="stat-card stat-card-error">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg text-gray-600 mb-2">错误信息</div>
            <div class="text-3xl font-bold text-error mb-2">
              {{ logs.filter((log) => log.level === LogLevel.ERROR).length }}
            </div>
            <div class="text-sm text-gray-500">
              占比:
              {{
                (
                  (logs.filter((log) => log.level === LogLevel.ERROR).length / logs.length) *
                  100
                ).toFixed(1)
              }}%
            </div>
          </div>
          <div class="text-4xl text-error-300">
            <CloseCircleOutlined />
          </div>
        </div>
      </a-card>
    </div>

    <!-- 操作栏 -->
    <div class="bg-white p-4 mb-6 rounded-lg shadow-sm">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <a-range-picker
            v-model:value="dateRange"
            class="w-[250px]"
            allowClear
            show-time
            :disabled-date="(current: dayjs.Dayjs) => current && current > dayjs().endOf('day')"
          >
            <template #prefix>
              <CalendarOutlined />
            </template>
          </a-range-picker>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索日志内容"
            class="w-[250px]"
            allowClear
            @search="refreshLogs"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input-search>
          <a-select
            v-model:value="selectedLevel"
            mode="multiple"
            style="min-width: 200px"
            placeholder="日志级别"
            allowClear
          >
            <a-select-option
              v-for="[key, value] in Object.entries(LogLevel)"
              :key="value"
              :value="value"
            >
              <a-tag :color="levelConfig[value].color">
                {{ levelConfig[value].text }}
              </a-tag>
            </a-select-option>
          </a-select>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <a-button type="primary" @click="refreshLogs" :loading="loading">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
          <a-button @click="exportLogs" :disabled="!filteredLogs.length">
            <template #icon><DownloadOutlined /></template>
            导出
          </a-button>
          <a-button danger @click="clearLogs" :disabled="!selectedRowKeys.length">
            <template #icon><DeleteOutlined /></template>
            清空
          </a-button>
        </div>
      </div>
    </div>

    <!-- 日志表格 -->
    <div class="shadow-sm">
      <a-table
        :row-selection="rowSelection"
        :columns="columns"
        :data-source="filteredLogs"
        :loading="loading"
        row-key="id"
        :pagination="{
          ...pagination,
          total: filteredLogs.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number) => `共 ${total} 条`,
        }"
        bordered
        size="middle"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'level'">
            <a-tag :color="levelConfig[text as LogLevelType].color">
              {{ levelConfig[text as LogLevelType].text }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'message'">
            <a @click="showLogDetail(record)" class="text-primary hover:text-primary-dark">
              {{ text }}
            </a>
          </template>
          <template v-else-if="column.dataIndex === 'duration'">
            <a-tag :color="text > 1000 ? 'red' : text > 500 ? 'orange' : 'green'">
              {{ text ? `${text}ms` : '-' }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'timestamp'">
            <span :title="text">{{ dayjs(text).fromNow() }}</span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 日志详情抽屉 -->
    <a-drawer
      v-model:visible="drawerVisible"
      title="日志详情"
      :width="600"
      @close="selectedLog = null"
      class="log-drawer"
    >
      <template v-if="selectedLog">
        <a-descriptions bordered :column="1">
          <a-descriptions-item label="时间">
            <div class="flex flex-col">
              <span>{{ selectedLog.timestamp }}</span>
              <span class="text-gray-500 text-sm">{{
                dayjs(selectedLog.timestamp).fromNow()
              }}</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="级别">
            <a-tag :color="levelConfig[selectedLog.level].color">
              {{ levelConfig[selectedLog.level].text }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="来源">
            {{ selectedLog.source }}
          </a-descriptions-item>
          <a-descriptions-item label="IP地址">
            {{ selectedLog.ip }}
          </a-descriptions-item>
          <a-descriptions-item label="用户">
            {{ selectedLog.userId }}
          </a-descriptions-item>
          <a-descriptions-item label="耗时">
            <a-tag
              :color="
                selectedLog.duration && selectedLog.duration > 1000
                  ? 'red'
                  : selectedLog.duration && selectedLog.duration > 500
                    ? 'orange'
                    : 'green'
              "
            >
              {{ selectedLog.duration ? `${selectedLog.duration}ms` : '-' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="消息">
            {{ selectedLog.message }}
          </a-descriptions-item>
          <a-descriptions-item label="详细信息">
            <div class="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg font-mono text-sm">
              {{ selectedLog.details }}
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-drawer>
  </div>
</template>

<style scoped>
.stat-card {
  @apply transition-all duration-300;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.stat-card:hover {
  @apply transform -translate-y-1;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-card-info {
  border-top: 4px solid var(--ant-info-color);
}

.stat-card-success {
  border-top: 4px solid var(--ant-success-color);
}

.stat-card-warning {
  border-top: 4px solid var(--ant-warning-color);
}

.stat-card-error {
  border-top: 4px solid var(--ant-error-color);
}

.text-info-300 {
  color: var(--ant-info-color-deprecated-bg);
}

.text-success-300 {
  color: var(--ant-success-color-deprecated-bg);
}

.text-warning-300 {
  color: var(--ant-warning-color-deprecated-bg);
}

.text-error-300 {
  color: var(--ant-error-color-deprecated-bg);
}

.text-primary {
  color: var(--ant-primary-color);
}

.text-primary:hover {
  color: var(--ant-primary-color-hover);
}

:deep(.ant-table) {
  background: white;
}

:deep(.ant-descriptions-item-label) {
  width: 100px;
  background-color: #fafafa;
}

:deep(.ant-drawer-body) {
  padding: 24px;
}

:deep(.ant-descriptions) {
  background-color: white;
}

:deep(.ant-descriptions-item-content) {
  background-color: white;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stat-card {
    @apply mb-4;
  }

  .text-3xl {
    @apply text-2xl;
  }

  .text-4xl {
    @apply text-3xl;
  }
}
</style>
