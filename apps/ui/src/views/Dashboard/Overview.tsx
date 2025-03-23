import { defineComponent, ref, onMounted, watch, computed } from 'vue'
import {
  Card,
  Button,
  DatePicker,
  Switch,
  Select,
  Row,
  Col,
  Statistic,
  Dropdown,
  Menu,
} from 'ant-design-vue'
import {
  FileOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  UserOutlined,
  ReloadOutlined,
  DownloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  FilterOutlined,
  SettingOutlined,
  DownOutlined,
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import './index.css'

export default defineComponent({
  name: 'DashboardOverview',
  setup() {
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

    // 模拟数据
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

    // 图表配置
    const chartRef = ref<HTMLElement | null>(null)
    let chart: echarts.ECharts | null = null

    // 图表配置选项
    const chartConfig = ref({
      smooth: true,
      stack: false,
      showSymbol: true,
      showLabel: false,
      showMarkLine: false,
    })

    // 数据筛选选项
    const filterOptions = ref({
      showProgramFiles: true,
      showDesignProjects: true,
      showCurrentTasks: true,
      showUsers: true,
    })

    // 导出格式
    const exportFormat = ref<'csv' | 'excel' | 'json'>('csv')

    // 刷新数据
    const refreshData = async () => {
      loading.value = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        loading.value = false
      } catch (error) {
        console.error('Failed to refresh data:', error)
        loading.value = false
      }
    }

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
          type: chartType.value === 'area' ? 'line' : chartType.value,
          data: stats.value.designProjects.data,
          itemStyle: { color: theme.value.designProjects },
          smooth: chartConfig.value.smooth,
          stack: chartConfig.value.stack ? 'total' : undefined,
          showSymbol: chartConfig.value.showSymbol,
          label: { show: chartConfig.value.showLabel },
          ...(chartType.value === 'area' ? { areaStyle: {} } : {}),
        })
      }
      if (filterOptions.value.showCurrentTasks) {
        series.push({
          name: '当前任务',
          type: chartType.value === 'area' ? 'line' : chartType.value,
          data: stats.value.currentTasks.data,
          itemStyle: { color: theme.value.currentTasks },
          smooth: chartConfig.value.smooth,
          stack: chartConfig.value.stack ? 'total' : undefined,
          showSymbol: chartConfig.value.showSymbol,
          label: { show: chartConfig.value.showLabel },
          ...(chartType.value === 'area' ? { areaStyle: {} } : {}),
        })
      }
      if (filterOptions.value.showUsers) {
        series.push({
          name: '用户数量',
          type: chartType.value === 'area' ? 'line' : chartType.value,
          data: stats.value.users.data,
          itemStyle: { color: theme.value.users },
          smooth: chartConfig.value.smooth,
          stack: chartConfig.value.stack ? 'total' : undefined,
          showSymbol: chartConfig.value.showSymbol,
          label: { show: chartConfig.value.showLabel },
          ...(chartType.value === 'area' ? { areaStyle: {} } : {}),
        })
      }
      return series
    })

    // 导出数据
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
      const handleCsv = () => {
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
      }

      const handleJson = () => {
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const jsonLink = document.createElement('a')
        jsonLink.href = URL.createObjectURL(jsonBlob)
        jsonLink.download = `统计数据_${dayjs().format('YYYY-MM-DD')}.json`
        jsonLink.click()
      }

      switch (exportFormat.value) {
        case 'csv':
          handleCsv()
          break
        case 'json':
          handleJson()
          break
      }
    }

    // 更新图表
    const updateChart = () => {
      if (!chart) return

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: function (
            params: { axisValue: string; marker: string; seriesName: string; value: number }[],
          ) {
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
            saveAsImage: { title: '保存为图片' },
            dataView: { title: '数据视图', lang: ['数据视图', '关闭', '刷新'] },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: Array.from({ length: 7 }, (_, i) =>
            dateRange.value[0].add(i, 'day').format('MM-DD'),
          ),
        },
        yAxis: {
          type: 'value',
        },
        series: filteredSeries.value,
      }

      chart.setOption(option)
    }

    // 监听时间范围变化
    watch(dateRange, () => {
      refreshData()
    })

    // 监听图表类型变化
    watch(chartType, () => {
      updateChart()
    })

    // 监听筛选选项变化
    watch(
      filterOptions,
      () => {
        updateChart()
      },
      { deep: true },
    )

    // 监听图表配置变化
    watch(
      chartConfig,
      () => {
        updateChart()
      },
      { deep: true },
    )

    onMounted(async () => {
      await refreshData()
      if (chartRef.value) {
        chart = echarts.init(chartRef.value)
        updateChart()
      }
    })

    // 渲染统计卡片
    const renderStatCards = () => (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable class="stat-card icon-primary">
            <Statistic
              title={
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="icon-wrapper">
                      <FileOutlined class="text-primary text-xl" />
                    </div>
                    <span class="text-gray-600">编程文件</span>
                  </div>
                  <div class="text-xs text-gray-400">
                    今日新增: +{Math.floor(Math.random() * 20)}
                  </div>
                </div>
              }
              value={stats.value.programFiles.total}
              class="number-animate"
              suffix={
                <div class="flex items-center gap-2">
                  <span
                    class={`percent-change ${stats.value.programFiles.weekChange >= 0 ? 'percent-change-positive' : 'percent-change-negative'}`}
                  >
                    {stats.value.programFiles.weekChange}%
                  </span>
                  <span class="text-xs text-gray-400">周同比</span>
                </div>
              }
            />
            <div class="mt-4 text-xs text-gray-500">
              <div class="flex justify-between items-center">
                <span>活跃文件</span>
                <span class="text-primary">{Math.floor(stats.value.programFiles.total * 0.6)}</span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span>归档文件</span>
                <span class="text-gray-400">
                  {Math.floor(stats.value.programFiles.total * 0.4)}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable class="stat-card icon-purple">
            <Statistic
              title={
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="icon-wrapper">
                      <ProjectOutlined class="text-purple text-xl" />
                    </div>
                    <span class="text-gray-600">设计项目</span>
                  </div>
                  <div class="text-xs text-gray-400">
                    进行中: {Math.floor(stats.value.designProjects.total * 0.3)}
                  </div>
                </div>
              }
              value={stats.value.designProjects.total}
              class="number-animate"
              suffix={
                <div class="flex items-center gap-2">
                  <span
                    class={`percent-change ${stats.value.designProjects.weekChange >= 0 ? 'percent-change-positive' : 'percent-change-negative'}`}
                  >
                    {stats.value.designProjects.weekChange}%
                  </span>
                  <span class="text-xs text-gray-400">周同比</span>
                </div>
              }
            />
            <div class="mt-4 text-xs text-gray-500">
              <div class="flex justify-between items-center">
                <span>已完成</span>
                <span class="text-success">
                  {Math.floor(stats.value.designProjects.total * 0.5)}
                </span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span>待审核</span>
                <span class="text-warning">
                  {Math.floor(stats.value.designProjects.total * 0.2)}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable class="stat-card icon-success">
            <Statistic
              title={
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="icon-wrapper">
                      <CheckSquareOutlined class="text-success text-xl" />
                    </div>
                    <span class="text-gray-600">当前任务</span>
                  </div>
                  <div class="text-xs text-gray-400">
                    紧急: {Math.floor(stats.value.currentTasks.total * 0.2)}
                  </div>
                </div>
              }
              value={stats.value.currentTasks.total}
              class="number-animate"
              suffix={
                <div class="flex items-center gap-2">
                  <span
                    class={`percent-change ${stats.value.currentTasks.weekChange >= 0 ? 'percent-change-positive' : 'percent-change-negative'}`}
                  >
                    {stats.value.currentTasks.weekChange}%
                  </span>
                  <span class="text-xs text-gray-400">周同比</span>
                </div>
              }
            />
            <div class="mt-4 text-xs text-gray-500">
              <div class="flex justify-between items-center">
                <span>已完成</span>
                <span class="text-success">{Math.floor(stats.value.currentTasks.total * 0.7)}</span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span>进行中</span>
                <span class="text-primary">{Math.floor(stats.value.currentTasks.total * 0.3)}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable class="stat-card icon-warning">
            <Statistic
              title={
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="icon-wrapper">
                      <UserOutlined class="text-warning text-xl" />
                    </div>
                    <span class="text-gray-600">用户数量</span>
                  </div>
                  <div class="text-xs text-gray-400">
                    在线: {Math.floor(stats.value.users.total * 0.4)}
                  </div>
                </div>
              }
              value={stats.value.users.total}
              class="number-animate"
              suffix={
                <div class="flex items-center gap-2">
                  <span
                    class={`percent-change ${stats.value.users.weekChange >= 0 ? 'percent-change-positive' : 'percent-change-negative'}`}
                  >
                    {stats.value.users.weekChange}%
                  </span>
                  <span class="text-xs text-gray-400">周同比</span>
                </div>
              }
            />
            <div class="mt-4 text-xs text-gray-500">
              <div class="flex justify-between items-center">
                <span>活跃用户</span>
                <span class="text-warning">{Math.floor(stats.value.users.total * 0.8)}</span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span>新增用户</span>
                <span class="text-success">+{Math.floor(stats.value.users.total * 0.1)}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    )

    // 渲染工具栏
    const renderToolbar = () => (
      <Card class="toolbar-card" bordered={false}>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <DatePicker.RangePicker
              v-model:value={dateRange.value}
              class="w-[250px]"
              allowClear={false}
              presets={[
                { label: '今日', value: [dayjs(), dayjs()] },
                { label: '本周', value: [dayjs().startOf('week'), dayjs()] },
                { label: '本月', value: [dayjs().startOf('month'), dayjs()] },
                {
                  label: '上月',
                  value: [
                    dayjs().subtract(1, 'month').startOf('month'),
                    dayjs().subtract(1, 'month').endOf('month'),
                  ],
                },
              ]}
            />
            <div class="chart-controls">
              <Dropdown
                trigger={['click']}
                v-slots={{
                  overlay: () => (
                    <Menu class="chart-settings-menu">
                      <Menu.ItemGroup title="图表类型">
                        <Menu.Item onClick={() => (chartType.value = 'line')}>
                          <div
                            class={`chart-type-item ${chartType.value === 'line' ? 'active' : ''}`}
                          >
                            <LineChartOutlined />
                            <span>折线图</span>
                          </div>
                        </Menu.Item>
                        <Menu.Item onClick={() => (chartType.value = 'bar')}>
                          <div
                            class={`chart-type-item ${chartType.value === 'bar' ? 'active' : ''}`}
                          >
                            <BarChartOutlined />
                            <span>柱状图</span>
                          </div>
                        </Menu.Item>
                        <Menu.Item onClick={() => (chartType.value = 'area')}>
                          <div
                            class={`chart-type-item ${chartType.value === 'area' ? 'active' : ''}`}
                          >
                            <AreaChartOutlined />
                            <span>面积图</span>
                          </div>
                        </Menu.Item>
                      </Menu.ItemGroup>
                      <Menu.Divider />
                      <Menu.ItemGroup title="图表选项">
                        <Menu.Item>
                          <div class="chart-option-item">
                            <span>平滑曲线</span>
                            <Switch
                              v-model:checked={chartConfig.value.smooth}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item>
                          <div class="chart-option-item">
                            <span>堆叠显示</span>
                            <Switch
                              v-model:checked={chartConfig.value.stack}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item>
                          <div class="chart-option-item">
                            <span>数据点</span>
                            <Switch
                              v-model:checked={chartConfig.value.showSymbol}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item>
                          <div class="chart-option-item">
                            <span>数据标签</span>
                            <Switch
                              v-model:checked={chartConfig.value.showLabel}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item>
                          <div class="chart-option-item">
                            <span>平均线</span>
                            <Switch
                              v-model:checked={chartConfig.value.showMarkLine}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                      </Menu.ItemGroup>
                    </Menu>
                  ),
                }}
              >
                <Button class="setting-btn">
                  <SettingOutlined />
                  图表设置
                  <DownOutlined />
                </Button>
              </Dropdown>
              <Dropdown
                trigger={['click']}
                v-slots={{
                  overlay: () => (
                    <Menu class="data-filter-menu">
                      <Menu.ItemGroup title="数据系列">
                        <Menu.Item>
                          <div class="data-filter-item">
                            <div class="flex items-center gap-2">
                              <div
                                class="w-3 h-3 rounded-full"
                                style={{ background: theme.value.programFiles }}
                              />
                              <span>编程文件</span>
                            </div>
                            <Switch
                              v-model:checked={filterOptions.value.showProgramFiles}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item>
                          <div class="data-filter-item">
                            <div class="flex items-center gap-2">
                              <div
                                class="w-3 h-3 rounded-full"
                                style={{ background: theme.value.designProjects }}
                              />
                              <span>设计项目</span>
                            </div>
                            <Switch
                              v-model:checked={filterOptions.value.showDesignProjects}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item>
                          <div class="data-filter-item">
                            <div class="flex items-center gap-2">
                              <div
                                class="w-3 h-3 rounded-full"
                                style={{ background: theme.value.currentTasks }}
                              />
                              <span>当前任务</span>
                            </div>
                            <Switch
                              v-model:checked={filterOptions.value.showCurrentTasks}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item>
                          <div class="data-filter-item">
                            <div class="flex items-center gap-2">
                              <div
                                class="w-3 h-3 rounded-full"
                                style={{ background: theme.value.users }}
                              />
                              <span>用户数量</span>
                            </div>
                            <Switch
                              v-model:checked={filterOptions.value.showUsers}
                              size="small"
                              class="custom-switch"
                            />
                          </div>
                        </Menu.Item>
                      </Menu.ItemGroup>
                    </Menu>
                  ),
                }}
              >
                <Button class="filter-btn">
                  <FilterOutlined />
                  数据筛选
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Select v-model:value={exportFormat.value} class="w-[100px]" size="middle" bordered>
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="json">JSON</Select.Option>
            </Select>
            <Button type="primary" ghost onClick={exportData} class="export-btn">
              <DownloadOutlined />
              导出
            </Button>
            <Button onClick={refreshData} loading={loading.value} class="refresh-btn">
              <ReloadOutlined spin={loading.value} />
              刷新
            </Button>
          </div>
        </div>
      </Card>
    )

    return () => (
      <div class="dashboard-container min-h-screen p-6">
        {renderStatCards()}
        <div class="my-6" />
        {renderToolbar()}
        <Card class="chart-container">
          <div ref={chartRef} style="width: 100%; height: 400px;" />
        </Card>
      </div>
    )
  },
})
