import { defineComponent, onMounted, ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/table/interface'
import type { TablePaginationConfig } from 'ant-design-vue'
import { FilterForm } from './components/FilterForm'
import { UserTable } from './components/UserTable'
import { BatchActions } from './components/BatchActions'
import { UserForm } from './components/UserForm'
import type { User, UserQueryParams, UserStatus } from '@/types/user'

interface TableChange {
  pagination: TablePaginationConfig
}

export default defineComponent({
  name: 'UserManagement',
  setup() {
    const loading = ref(false)
    const selectedRowKeys = ref<Key[]>([])
    const showUserForm = ref(false)
    const currentUser = ref<Partial<User> | null>(null)
    const formTitle = ref('添加用户')
    const users = ref<User[]>([])

    // 分页配置
    const pagination = reactive<TablePaginationConfig>({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条记录`,
    })

    // 查询参数
    const queryParams = reactive<Partial<UserQueryParams>>({
      page: 1,
      pageSize: 10,
    })

    // 加载用户数据
    const loadUsers = async () => {
      loading.value = true
      try {
        // todo 获取用户列表接口
        // await api.getUsers(queryParams)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        users.value = [
          {
            id: '1',
            email: 'admin@example.com',
            username: 'admin',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            role: 'admin',
            gender: 'male',
            ipAddress: '127.0.0.1',
            lastLoginTime: '2023-08-27 14:30:00',
            isOnline: true,
            status: 'enabled',
            registrationDate: '2023-08-27 14:30:00',
          },
        ]
        pagination.total = 10
      } finally {
        loading.value = false
      }
    }

    // 处理查询
    const handleSearch = async (params: Partial<UserQueryParams>) => {
      queryParams.page = 1
      Object.assign(queryParams, params)
      // todo 查询接口
      // await api.queryUsers(queryParams)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      loadUsers()
    }

    // 处理表格变化
    const handleTableChange = async ({ pagination: newPagination }: TableChange) => {
      pagination.current = newPagination.current ?? 1
      pagination.pageSize = newPagination.pageSize ?? 10
      queryParams.page = pagination.current
      queryParams.pageSize = pagination.pageSize
      // todo 更新查询参数
      // await api.updateQueryParams(queryParams)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      loadUsers()
    }

    // 处理新增用户
    const handleAdd = () => {
      currentUser.value = null
      formTitle.value = '添加用户'
      showUserForm.value = true
    }

    // 处理编辑用户
    const handleEdit = (user: User) => {
      currentUser.value = { ...user }
      formTitle.value = '编辑用户'
      showUserForm.value = true
    }

    // 处理删除用户
    const handleDelete = async (_id: string) => {
      loading.value = true
      try {
        // todo 删除用户接口
        // await api.deleteUser(id)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        message.success('删除成功')
        loadUsers()
      } finally {
        loading.value = false
      }
    }

    // 处理状态切换
    const handleToggleStatus = async (_id: string, _status: UserStatus) => {
      loading.value = true
      try {
        // todo 状态切换接口
        // await api.toggleUserStatus(id, status)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        message.success('状态修改成功')
        loadUsers()
      } finally {
        loading.value = false
      }
    }

    // 处理批量删除
    const handleBatchDelete = async () => {
      loading.value = true
      try {
        // todo 批量删除接口
        // await api.batchDeleteUsers()
        await new Promise((resolve) => setTimeout(resolve, 1000))
        message.success('批量删除成功')
        selectedRowKeys.value = []
        loadUsers()
      } finally {
        loading.value = false
      }
    }

    // 处理批量导出
    const handleBatchExport = async () => {
      loading.value = true
      try {
        // todo 批量导出接口
        // await api.batchExportUsers()
        await new Promise((resolve) => setTimeout(resolve, 1000))
        message.success('导出成功')
      } finally {
        loading.value = false
      }
    }

    // 处理表单提交
    const handleFormSubmit = async (_values: Partial<User>) => {
      loading.value = true
      try {
        if (currentUser.value?.id) {
          // todo 更新用户接口
          // await api.updateUser(currentUser.value.id, values)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          message.success('更新成功')
        } else {
          // todo 创建用户接口
          // await api.createUser(values as Omit<User, 'id'>)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          message.success('创建成功')
        }
        showUserForm.value = false
        loadUsers()
      } finally {
        loading.value = false
      }
    }

    // 初始化加载
    onMounted(() => {
      loadUsers()
    })

    return () => (
      <div class="user-management p-6">
        <div class="mb-4">
          <FilterForm loading={loading.value} onSearch={handleSearch} />
        </div>

        <div class="mb-4">
          <BatchActions
            selectedCount={selectedRowKeys.value.length}
            hasSelected={selectedRowKeys.value.length > 0}
            onBatch-delete={handleBatchDelete}
            onBatch-export={handleBatchExport}
          />
        </div>

        <UserTable
          loading={loading.value}
          dataSource={users.value}
          pagination={pagination}
          v-model:selectedRowKeys={selectedRowKeys.value}
          onChange={handleTableChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle-status={handleToggleStatus}
        />

        <UserForm
          visible={showUserForm.value}
          onUpdate:visible={(val: boolean) => (showUserForm.value = val)}
          loading={loading.value}
          title={formTitle.value}
          initialValues={currentUser.value ?? {}}
          onSubmit={handleFormSubmit}
        />
      </div>
    )
  },
})
