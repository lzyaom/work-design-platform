<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import {
  FileOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  UserOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  FilterOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import type { SelectProps } from 'ant-design-vue'

// 加载状态
const loading = ref(true)

// 时间范围
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(6, 'day'), dayjs()])

// 图表类型
const chartType = ref<'line' | 'bar' | 'area'>('line')

// 主题配置
const theme = ref({
  programFiles: '#1890ff',
  designProjects: '#722ed1',
  currentTasks: '#52c41a',
  users: '#faad14',
})

// 模拟数据，实际项目中应该从 API 获取
const stats = ref({
  programFiles: {
    total: 12,
    weekChange: 20,
    data: [5, 8, 10, 9, 11, 12, 12],
  },
  designProjects: {
    total: 5,
    weekChange: -10,
    data: [2, 3, 4, 4, 5, 5, 5],
  },
  currentTasks: {
    total: 8,
    weekChange: 15,
    data: [3, 4, 5, 6, 7, 7, 8],
  },
  users: {
    total: 25,
    weekChange: 30,
    data: [10, 15, 18, 20, 22, 24, 25],
  },
})

// 初始化图表
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // 实际项目中这里应该调用后端 API，传入时间范围参数
    // const response = await api.getStats({
    //   startDate: dateRange.value[0].format('YYYY-MM-DD'),
    //   endDate: dateRange.value[1].format('YYYY-MM-DD'),
    // })
    loading.value = false
  } catch (error) {
    console.error('Failed to refresh data:', error)
    loading.value = false
  }
}

// 图表配置选项
const chartConfig = ref({
  smooth: true, // 平滑曲线
  stack: false, // 堆叠显示
  showSymbol: true, // 显示数据点
  showLabel: false, // 显示数据标签
  showMarkLine: false, // 显示标记线
})

// 数据筛选选项
const filterOptions = ref({
  showProgramFiles: true,
  showDesignProjects: true,
  showCurrentTasks: true,
  showUsers: true,
})

// 计算筛选后的数据系列
const filteredSeries = computed(() => {
  const series = []
  if (filterOptions.value.showProgramFiles) {
    series.push({
      name: '编程文件',
      type: chartType.value === 'area' ? 'line' : chartType.value,
      data: stats.value.programFiles.data,
      itemStyle: { color: theme.value.programFiles },
      smooth: chartConfig.value.smooth,
      stack: chartConfig.value.stack ? 'total' : undefined,
      showSymbol: chartConfig.value.showSymbol,
      label: { show: chartConfig.value.showLabel },
      ...(chartType.value === 'area' ? { areaStyle: {} } : {}),
      ...(chartConfig.value.showMarkLine
        ? {
            markLine: {
              data: [{ type: 'average', name: '平均值' }],
            },
          }
        : {}),
    })
  }
  if (filterOptions.value.showDesignProjects) {
    series.push({
      name: '设计项目',
      type: chartType.value,
      data: stats.value.designProjects.data,
      itemStyle: { color: theme.value.designProjects },
    })
  }
  if (filterOptions.value.showCurrentTasks) {
    series.push({
      name: '当前任务',
      type: chartType.value,
      data: stats.value.currentTasks.data,
      itemStyle: { color: theme.value.currentTasks },
    })
  }
  if (filterOptions.value.showUsers) {
    series.push({
      name: '用户数量',
      type: chartType.value,
      data: stats.value.users.data,
      itemStyle: { color: theme.value.users },
    })
  }
  return series
})

// 导出格式选项
const exportFormat = ref<'csv' | 'excel' | 'json'>('csv')

// 优化的导出数据函数
const exportData = () => {
  const data = {
    exportTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    timeRange: {
      start: dateRange.value[0].format('YYYY-MM-DD'),
      end: dateRange.value[1].format('YYYY-MM-DD'),
    },
    data: stats.value.programFiles.data.map((_, index) => ({
      date: dateRange.value[0].add(index, 'day').format('YYYY-MM-DD'),
      programFiles: stats.value.programFiles.data[index],
      designProjects: stats.value.designProjects.data[index],
      currentTasks: stats.value.currentTasks.data[index],
      users: stats.value.users.data[index],
    })),
  }

  switch (exportFormat.value) {
    case 'csv':
      const csvRows = [
        ['导出时间', data.exportTime],
        ['时间范围', `${data.timeRange.start} 至 ${data.timeRange.end}`],
        [''],
        ['日期', '编程文件', '设计项目', '当前任务', '用户数量'],
        ...data.data.map((row) => [
          row.date,
          row.programFiles,
          row.designProjects,
          row.currentTasks,
          row.users,
        ]),
      ]
      const csvContent = csvRows.map((row) => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `统计数据_${dayjs().format('YYYY-MM-DD')}.csv`
      link.click()
      break
    case 'json':
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const jsonLink = document.createElement('a')
      jsonLink.href = URL.createObjectURL(jsonBlob)
      jsonLink.download = `统计数据_${dayjs().format('YYYY-MM-DD')}.json`
      jsonLink.click()
      break
    // 可以添加更多导出格式支持
  }
}

onMounted(async () => {
  await refreshData()
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    updateChart()
  }
})

// 监听时间范围变化
watch(dateRange, () => {
  refreshData()
})

// 监听图表类型变化
watch(chartType, () => {
  updateChart()
})

// 更新图表配置
const updateChart = () => {
  if (!chart) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: any[]) {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((param) => {
          result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['编程文件', '设计项目', '当前任务', '用户数量'],
      selectedMode: true,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: { title: '保存图片' },
        dataZoom: { title: '缩放' },
        restore: { title: '重置' },
        magicType: {
          type: ['line', 'bar', 'stack'],
          title: {
            line: '切换为折线图',
            bar: '切换为柱状图',
            stack: '切换为堆叠',
          },
        },
      },
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 7 }, (_, i) => dateRange.value[0].add(i, 'day').format('MM-DD')),
      axisLabel: {
        rotate: 0,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: filteredSeries.value,
  }

  chart.setOption(option)
}

// 监听图表配置变化
watch([chartConfig, filterOptions], () => {
  updateChart()
})

// 监听窗口大小变化
window.addEventListener('resize', () => {
  chart?.resize()
})
</script>

<template>
  <div class="p-4">
    <!-- 顶部控制栏 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <h2 class="text-lg font-medium">数据概览</h2>
      <div class="flex flex-wrap items-center gap-4">
        <!-- 时间范围选择 -->
        <a-range-picker
          v-model:value="dateRange"
          :disabled-date="(current: any) => current && current > dayjs().endOf('day')"
          :default-value="[dayjs().subtract(6, 'day'), dayjs()]"
        />
        <!-- 导出选项 -->
        <a-dropdown-button @click="exportData">
          <template #icon><DownloadOutlined /></template>
          导出数据
          <template #overlay>
            <a-menu
              :selectedKeys="[exportFormat]"
              @select="({ key }: Record<string, any>) => (exportFormat = key)"
            >
              <a-menu-item key="csv">CSV 格式</a-menu-item>
              <a-menu-item key="json">JSON 格式</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown-button>
        <!-- 刷新按钮 -->
        <a-button type="primary" :loading="loading" @click="refreshData">
          <template #icon><ReloadOutlined /></template>
          刷新数据
        </a-button>
      </div>
    </div>

    <a-spin :spinning="loading">
      <!-- 统计卡片部分保持不变 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- 编程文件统计 -->
        <a-card hoverable>
          <template #cover>
            <div class="bg-blue-50 p-4 flex justify-center">
              <FileOutlined class="text-4xl text-blue-500" />
            </div>
          </template>
          <a-statistic
            title="编程文件"
            :value="stats.programFiles.total"
            :value-style="{ color: '#1890ff' }"
            :precision="0"
          >
            <template #suffix>个</template>
          </a-statistic>
          <div class="mt-2 text-sm">
            周同比
            <a-badge
              :status="stats.programFiles.weekChange >= 0 ? 'success' : 'error'"
              :text="
                (stats.programFiles.weekChange >= 0 ? '+' : '') +
                stats.programFiles.weekChange +
                '%'
              "
            />
          </div>
        </a-card>

        <!-- 设计项目统计 -->
        <a-card hoverable>
          <template #cover>
            <div class="bg-purple-50 p-4 flex justify-center">
              <ProjectOutlined class="text-4xl text-purple-500" />
            </div>
          </template>
          <a-statistic
            title="设计项目"
            :value="stats.designProjects.total"
            :value-style="{ color: '#722ed1' }"
            :precision="0"
          >
            <template #suffix>个</template>
          </a-statistic>
          <div class="mt-2 text-sm">
            周同比
            <a-badge
              :status="stats.designProjects.weekChange >= 0 ? 'success' : 'error'"
              :text="
                (stats.designProjects.weekChange >= 0 ? '+' : '') +
                stats.designProjects.weekChange +
                '%'
              "
            />
          </div>
        </a-card>

        <!-- 当前任务统计 -->
        <a-card hoverable>
          <template #cover>
            <div class="bg-green-50 p-4 flex justify-center">
              <CheckSquareOutlined class="text-4xl text-green-500" />
            </div>
          </template>
          <a-statistic
            title="当前任务"
            :value="stats.currentTasks.total"
            :value-style="{ color: '#52c41a' }"
            :precision="0"
          >
            <template #suffix>个</template>
          </a-statistic>
          <div class="mt-2 text-sm">
            周同比
            <a-badge
              :status="stats.currentTasks.weekChange >= 0 ? 'success' : 'error'"
              :text="
                (stats.currentTasks.weekChange >= 0 ? '+' : '') +
                stats.currentTasks.weekChange +
                '%'
              "
            />
          </div>
        </a-card>

        <!-- 用户统计 -->
        <a-card hoverable>
          <template #cover>
            <div class="bg-orange-50 p-4 flex justify-center">
              <UserOutlined class="text-4xl text-orange-500" />
            </div>
          </template>
          <a-statistic
            title="用户数量"
            :value="stats.users.total"
            :value-style="{ color: '#faad14' }"
            :precision="0"
          >
            <template #suffix>人</template>
          </a-statistic>
          <div class="mt-2 text-sm">
            周同比
            <a-badge
              :status="stats.users.weekChange >= 0 ? 'success' : 'error'"
              :text="(stats.users.weekChange >= 0 ? '+' : '') + stats.users.weekChange + '%'"
            />
          </div>
        </a-card>
      </div>

      <!-- 趋势图表 -->
      <a-card class="mt-6">
        <template #title>
          <div class="flex items-center justify-between flex-wrap gap-4">
            <span class="flex items-center">
              近期趋势
              <a-tooltip title="点击图例可以切换显示/隐藏">
                <InfoCircleOutlined class="ml-2 text-gray-400" />
              </a-tooltip>
            </span>
            <div class="flex items-center gap-4">
              <!-- 数据筛选 -->
              <a-dropdown>
                <a-button>
                  <template #icon><FilterOutlined /></template>
                  数据筛选
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a-checkbox v-model:checked="filterOptions.showProgramFiles"
                        >编程文件</a-checkbox
                      >
                    </a-menu-item>
                    <a-menu-item>
                      <a-checkbox v-model:checked="filterOptions.showDesignProjects"
                        >设计项目</a-checkbox
                      >
                    </a-menu-item>
                    <a-menu-item>
                      <a-checkbox v-model:checked="filterOptions.showCurrentTasks"
                        >当前任务</a-checkbox
                      >
                    </a-menu-item>
                    <a-menu-item>
                      <a-checkbox v-model:checked="filterOptions.showUsers">用户数量</a-checkbox>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <!-- 图表配置 -->
              <a-dropdown>
                <a-button>
                  <template #icon><SettingOutlined /></template>
                  图表配置
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a-checkbox v-model:checked="chartConfig.smooth">平滑曲线</a-checkbox>
                    </a-menu-item>
                    <a-menu-item>
                      <a-checkbox v-model:checked="chartConfig.stack">堆叠显示</a-checkbox>
                    </a-menu-item>
                    <a-menu-item>
                      <a-checkbox v-model:checked="chartConfig.showSymbol">显示数据点</a-checkbox>
                    </a-menu-item>
                    <a-menu-item>
                      <a-checkbox v-model:checked="chartConfig.showLabel">显示数据标签</a-checkbox>
                    </a-menu-item>
                    <a-menu-item>
                      <a-checkbox v-model:checked="chartConfig.showMarkLine">显示平均线</a-checkbox>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <!-- 图表类型切换 -->
              <a-radio-group v-model:value="chartType" button-style="solid">
                <a-radio-button value="line">
                  <template #icon><LineChartOutlined /></template>
                  折线图
                </a-radio-button>
                <a-radio-button value="bar">
                  <template #icon><BarChartOutlined /></template>
                  柱状图
                </a-radio-button>
                <a-radio-button value="area">
                  <template #icon><AreaChartOutlined /></template>
                  面积图
                </a-radio-button>
              </a-radio-group>
            </div>
          </div>
        </template>
        <div ref="chartRef" style="height: 400px"></div>
      </a-card>
    </a-spin>
  </div>
</template>

<style scoped>
.ant-card {
  transition: all 0.3s;
}

.ant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.ant-statistic-content) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .flex-wrap {
    flex-wrap: wrap;
  }

  .gap-4 {
    gap: 1rem;
  }
}
</style>
