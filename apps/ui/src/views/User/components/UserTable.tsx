import { defineComponent, computed } from 'vue'
import { Table, Tag, Avatar, Space, Button, Popconfirm, Spin, Pagination } from 'ant-design-vue'
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import type { Key, SorterResult, FilterValue } from 'ant-design-vue/es/table/interface'
import {
  CheckCircleOutlined,
  StopOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { User, UserRole } from '@/types/user'

const roleColorMap: Record<UserRole, string> = {
  admin: 'red',
  user: 'blue',
  guest: 'gray',
}

export const UserTable = defineComponent({
  name: 'UserTable',
  props: {
    dataSource: {
      type: Array as () => User[],
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    selectedRowKeys: {
      type: Array as () => Key[],
      default: () => [],
    },
    pagination: {
      type: Object as () => TablePaginationConfig,
      required: true,
    },
  },
  emits: ['update:selected-row-keys', 'delete', 'edit', 'toggle-status', 'change'],
  setup(props, { emit }) {
    const columns = computed<TableColumnsType>(() => [
      {
        title: '用户信息',
        dataIndex: 'username',
        width: 180,
        customRender: ({ record }) => (
          <Space>
            <Avatar src={(record as User).avatar} />
            <span>{(record as User).username}</span>
          </Space>
        ),
      },
      {
        title: '角色',
        dataIndex: 'role',
        width: 80,
        customRender: ({ text }) => <Tag color={roleColorMap[text as UserRole]}>{text}</Tag>,
      },
      {
        title: '性别',
        dataIndex: 'gender',
        width: 80,
      },
      {
        title: 'IP地址',
        dataIndex: 'ipAddress',
        width: 100,
      },
      {
        title: '最后登录',
        dataIndex: 'lastLoginTime',
        width: 180,
        sorter: (a, b) => dayjs(a.lastLoginTime).unix() - dayjs(b.lastLoginTime).unix(),
        showSorterTooltip: false,
      },
      {
        title: '在线状态',
        dataIndex: 'isOnline',
        width: 100,
        customRender: ({ text }) => (
          <Tag color={text ? 'success' : 'default'}>{text ? '在线' : '离线'}</Tag>
        ),
      },
      {
        title: '账户状态',
        dataIndex: 'status',
        width: 100,
        customRender: ({ text }) => (
          <Tag color={text === 'enabled' ? 'success' : 'error'}>
            {text === 'enabled' ? '启用' : '禁用'}
          </Tag>
        ),
      },
      {
        title: '注册时间',
        dataIndex: 'registrationDate',
        width: 180,
        sorter: (a, b) => dayjs(a.registrationDate).unix() - dayjs(b.registrationDate).unix(),
        showSorterTooltip: false,
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        customRender: ({ record }) => {
          const user = record as User
          return (
            <Space>
              <Button type="link" onClick={() => emit('edit', user)} size="small">
                <EditOutlined />
                编辑
              </Button>
              <Popconfirm
                title="提示"
                description={`${user.status === 'enabled' ? '禁用后用户将无法登录' : '启用后用户将可以登录'}，确定修改吗？`}
                placement="bottom"
                okText="确定"
                cancelText="取消"
                onConfirm={() =>
                  emit('toggle-status', user.id, user.status === 'enabled' ? 'disabled' : 'enabled')
                }
              >
                <Button type="link" size="small">
                  {user.status === 'enabled' ? (
                    <>
                      <CheckCircleOutlined />
                      禁用
                    </>
                  ) : (
                    <>
                      <StopOutlined />
                      启用
                    </>
                  )}
                </Button>
              </Popconfirm>
              <Popconfirm
                title="提示"
                description="确定要删除该用户吗？"
                placement="bottom"
                okText="确定"
                cancelText="取消"
                onConfirm={() => emit('delete', user.id)}
              >
                <Button type="link" danger size="small">
                  <DeleteOutlined />
                  删除
                </Button>
              </Popconfirm>
            </Space>
          )
        },
      },
    ])

    const handleTableChange = (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<User> | SorterResult<User>[],
    ) => {
      emit('change', { pagination, filters, sorter })
    }

    return () => (
      <Spin spinning={props.loading} tip="加载中...">
        <Table
          rowSelection={{
            selectedRowKeys: props.selectedRowKeys,
            onChange: (selectedKeys: Key[]) => {
              emit('update:selected-row-keys', selectedKeys as Key[])
            },
          }}
          columns={columns.value}
          dataSource={props.dataSource}
          loading={false}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1200 }}
          bordered
          onChange={handleTableChange}
        />
        <Pagination
          class="p-4 rounded-bl-lg rounded-br-lg bg-white text-right"
          {...props.pagination}
        ></Pagination>
      </Spin>
    )
  },
})
