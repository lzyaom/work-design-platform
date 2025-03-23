import { defineComponent, onMounted, watch, ref, reactive } from 'vue'
import {
  Table,
  Space,
  Button,
  Popconfirm,
  Pagination,
  Spin,
  Tag,
  Form,
  message,
  Select,
  DatePicker,
  Input,
} from 'ant-design-vue'
import type { FormInstance, TableColumnsType, TableProps } from 'ant-design-vue'
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import type { Key } from 'ant-design-vue/es/table/interface'
import type { ProgramFile, QueryParams, ActionPermission } from '@/types/program'
import type { ProgramFile, QueryParams, ActionPermission } from './types'
export default defineComponent({
  name: 'ProgramManage',
  setup() {
    // 加载状态
    const loading = ref(false)

    // 数据集合
    const dataSource = ref<ProgramFile[]>([])
    const total = ref(0)

    // 查询参数
    const queryParams = reactive<QueryParams>({
      language: undefined,
      dateRange: undefined,
      keyword: '',
      page: 1,
      pageSize: 10,
    })

    // 权限控制
    const permissions = reactive<ActionPermission>({
      edit: true,
      delete: true,
      compile: true,
      export: true,
    })

    // 选中的行
    const selectedRowKeys = ref<Key[]>([])

    // 状态样式映射
    const statusMap = {
      uncompiled: { text: '未编译', color: '#faad14' },
      compiling: { text: '编译中', color: '#1890ff' },
      compiled: { text: '已编译', color: '#52c41a' },
      error: { text: '错误', color: '#ff4d4f' },
    } as const

    const formRef = ref<FormInstance | null>(null)

    // 语言选项
    const languageOptions = [{ label: 'Python', value: 'Python' }]

    // 监听表单变化
    watch(
      [() => queryParams.language, () => queryParams.dateRange, () => queryParams.keyword],
      () => {
        handleSearch()
      },
    )

    // 重置表单
    const handleReset = () => {
      if (formRef.value) {
        formRef.value.resetFields()
        handleSearch()
      }
    }

    // 表格列配置
    const columns = [
      {
        title: '文件名',
        dataIndex: 'fileName',
        key: 'fileName',
        width: 200,
        fixed: 'left' as const,
      },
      {
        title: '编程语言',
        dataIndex: 'language',
        key: 'language',
        width: 120,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        minWidth: 150,
      },
      {
        title: '编译状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        customRender: ({ text }) => (
          <Tag color={statusMap[text as keyof typeof statusMap].color}>
            {statusMap[text as keyof typeof statusMap].text}
          </Tag>
        ),
      },
      {
        title: '作者',
        dataIndex: 'author',
        key: 'author',
        width: 120,
      },
      {
        title: '最后修改时间',
        dataIndex: 'lastModified',
        key: 'lastModified',
        width: 180,
        sorter: (a: ProgramFile, b: ProgramFile) =>
          dayjs(a.lastModified).unix() - dayjs(b.lastModified).unix(),
        showSorterTooltip: false,
        customRender: ({ text }) => dayjs(text as string).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        customRender: ({ record }) => (
          <Space>
            {permissions.edit && (
              <Button type="link" size="small" onClick={() => handleEdit(record)}>
                编辑
              </Button>
            )}
            {permissions.compile && record.status !== 'compiling' && (
              <Button type="link" size="small" onClick={() => handleCompile(record)}>
                编译
              </Button>
            )}
            {permissions.delete && (
              <Popconfirm title="确定要删除这个文件吗?" onConfirm={() => handleDelete(record)}>
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ] as TableColumnsType

    const handleTableChange: TableProps['onChange'] = (pagination, _filters, sorter) => {
      queryParams.page = pagination.current as number
      queryParams.pageSize = pagination.pageSize as number
      queryParams.sortField = Array.isArray(sorter) ? undefined : (sorter.field as string)
      queryParams.sortOrder = Array.isArray(sorter)
        ? undefined
        : (sorter.order as 'ascend' | 'descend')
      fetchData()
    }

    const handlePageChange = (page: number, pageSize?: number) => {
      queryParams.page = page
      if (pageSize) {
        queryParams.pageSize = pageSize
      }
      fetchData()
    }

    // 获取数据
    const fetchData = async () => {
      loading.value = true
      try {
        // TODO: 替换为实际的API调用
        // const { data, total: totalCount } = await api.program.list(queryParams)
        // dataSource.value = data
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const data = [
          {
            id: '1',
            fileName: '程序1',
            language: 'Python',
            status: 'uncompiled',
            lastModified: '2023-08-01',
            author: 'admin',
            version: '1.0',
            description: '这是一个示例程序',
          },
          {
            id: '2',
            fileName: '程序2',
            language: 'Python',
            status: 'compiled',
            lastModified: '2023-08-02',
            author: 'admin',
            version: '1.0',
            description: '这是一个示例程序',
          },
          {
            id: '3',
            fileName: '程序3',
            language: 'Python',
            status: 'error',
            lastModified: '2023-08-03',
            author: 'admin',
            version: '1.0',
            description: '这是一个示例程序',
          },
          {
            id: '4',
            fileName: '程序4',
            language: 'Python',
            status: 'compiling',
            lastModified: '2023-08-04',
            author: 'admin',
            version: '1.0',
            description: '这是一个示例程序',
          },
        ] as ProgramFile[]
        dataSource.value = data
        total.value = data.length
        // total.value = totalCount
      } catch (error) {
        message.error('获取数据失败')
        console.error('Failed to fetch data:', error)
      } finally {
        loading.value = false
      }
    }

    // 搜索处理
    const handleSearch = () => {
      queryParams.page = 1
      fetchData()
    }

    // 编译处理
    const handleCompile = async (_record: ProgramFile) => {
      try {
        // TODO: 替换为实际的API调用
        // await api.program.compile(record.id)
        message.success('开始编译')
        fetchData()
      } catch (error) {
        message.error('编译失败')
        console.error('Failed to compile:', error)
      }
    }

    // 编辑处理
    const handleEdit = (record: ProgramFile) => {
      // TODO: 实现编辑逻辑，可能需要导航到编辑页面
      console.log('Edit record:', record)
    }

    // 删除处理
    const handleDelete = async (_record: ProgramFile) => {
      try {
        // TODO: 替换为实际的API调用
        // await api.program.delete(record.id)
        message.success('删除成功')
        fetchData()
      } catch (error) {
        message.error('删除失败')
        console.error('Failed to delete:', error)
      }
    }

    // 批量删除处理
    const handleBatchDelete = async () => {
      try {
        // TODO: 替换为实际的API调用
        // await api.program.batchDelete(selectedRowKeys.value)
        message.success('批量删除成功')
        fetchData()
      } catch (error) {
        message.error('批量删除失败')
        console.error('Failed to batch delete:', error)
      } finally {
        selectedRowKeys.value = []
      }
    }

    const handleExport = () => {
      // TODO: 实现导出逻辑
      console.log('Export')
    }

    // 初始化
    onMounted(() => {
      fetchData()
    })
    return () => (
      <div class="program p-6">
        <div class="program-filter p-4 mb-4 rounded-lg shadow dark:bg-slate-900 bg-white">
          <Form
            ref={formRef}
            layout="inline"
            model={queryParams}
            class="dark:bg-slate-900 dark:text-white "
          >
            <Form.Item>
              <Select
                class="min-w-[150px]"
                v-model:value={queryParams.language}
                options={languageOptions}
                placeholder="请选择编程语言"
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <DatePicker.RangePicker
                v-model:value={queryParams.dateRange as unknown as [Dayjs, Dayjs]}
                disabledDate={(current: dayjs.Dayjs) => current && current > dayjs().endOf('day')}
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item>
              <Input v-model:value={queryParams.keyword} placeholder="请输入关键词" allowClear />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSearch}>
                  {loading.value ? '搜索中...' : '搜索'}
                </Button>
                <Button onClick={handleReset}>重置</Button>

                {permissions.delete && selectedRowKeys.value.length > 0 && (
                  <Popconfirm
                    title="提示"
                    description={`确定要删除选中的 ${selectedRowKeys.value.length} 个文件吗?`}
                    placement="bottom"
                    cancelText="取消"
                    okText="确定"
                    onConfirm={handleBatchDelete}
                  >
                    <Button type="primary" danger>
                      {{
                        icon: () => <DeleteOutlined class="align-middle" />,
                        default: () => '批量删除',
                      }}
                    </Button>
                  </Popconfirm>
                )}
                {permissions.export && selectedRowKeys.value.length > 0 && (
                  <Button type="primary" onClick={handleExport}>
                    {{
                      icon: () => <DownloadOutlined class="align-middle" />,
                      default: () => '导出',
                    }}
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </div>

        <div class="program-table">
          <Spin spinning={loading.value} tip="加载中...">
            <Table
              dataSource={dataSource.value}
              columns={columns}
              loading={false}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedRowKeys.value,
                onChange: (keys: Key[]) => {
                  selectedRowKeys.value = keys as Key[]
                },
              }}
              pagination={false as const}
              bordered
              scroll={{ x: 1200 }}
              onChange={handleTableChange}
            />
            <Pagination
              class="p-4 rounded-bl-md rounded-br-md bg-white text-right"
              total={total.value}
              current={queryParams.page}
              pageSize={queryParams.pageSize}
              showTotal={(total) => `共 ${total} 条`}
              onChange={handlePageChange}
            />
          </Spin>
        </div>
      </div>
    )
  },
})
