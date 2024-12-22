import { defineComponent, ref, computed } from 'vue'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue'
import { Card, Button, Input, Modal, Form, message, Avatar, Tooltip, Tag } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import './index.css'
import { useRouter } from 'vue-router'

interface Collaborator {
  id: string
  name: string
  avatar: string
  online: boolean
  lastActive?: string
}

interface DesignItem {
  id: string
  name: string
  description: string
  thumbnail: string
  createTime: string
  updateTime: string
  status: 'draft' | 'editing' | 'reviewing' | 'completed'
  collaborators: Collaborator[]
  currentEditor?: Collaborator
}

const STATUS_CONFIG = {
  draft: {
    color: 'default',
    icon: <ClockCircleOutlined />,
    text: '草稿',
  },
  editing: {
    color: 'processing',
    icon: <SyncOutlined spin />,
    text: '编辑中',
  },
  reviewing: {
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
    text: '审核中',
  },
  completed: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    text: '已完成',
  },
}

export default defineComponent({
  name: 'DesignPage',
  setup() {
    const router = useRouter()
    const searchText = ref('')
    const designList = ref<DesignItem[]>([
      {
        id: '1',
        name: '设计方案 1',
        description: '这是一个示例设计方案',
        thumbnail: 'https://via.placeholder.com/300x200',
        createTime: '2024-01-20 10:00:00',
        updateTime: '2024-01-20 10:00:00',
        status: 'editing',
        collaborators: [
          {
            id: '1',
            name: '张三',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
            online: true,
          },
          {
            id: '2',
            name: '李四',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
            online: false,
            lastActive: '10分钟前',
          },
        ],
        currentEditor: {
          id: '1',
          name: '张三',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
          online: true,
        },
      },
    ])

    // 新增相关
    const showModal = ref(false)
    const formRef = ref<FormInstance>()
    const formState = ref({
      name: '',
      description: '',
    })

    const rules: Record<string, Rule[]> = {
      name: [
        { required: true, message: '请输入设计名称', trigger: 'blur', type: 'string' },
        { min: 2, max: 50, message: '长度应在 2-50 个字符之间', trigger: 'blur', type: 'string' },
      ],
      description: [
        { required: true, message: '请输入设计描述', trigger: 'blur', type: 'string' },
        { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur', type: 'string' },
      ],
    }

    const handleAdd = () => {
      showModal.value = true
    }

    const handleCancel = () => {
      showModal.value = false
      formState.value = {
        name: '',
        description: '',
      }
    }

    const handleOk = async () => {
      try {
        await formRef.value?.validate()
        // 模拟添加数据
        const newDesign: DesignItem = {
          id: Date.now().toString(),
          name: formState.value.name,
          description: formState.value.description,
          thumbnail: 'https://via.placeholder.com/300x200',
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
          status: 'draft',
          collaborators: [
            {
              id: '1',
              name: '当前用户',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
              online: true,
            },
          ],
        }
        designList.value.unshift(newDesign)
        message.success('添加成功')
        handleCancel()
      } catch (error) {
        console.error('Validation failed:', error)
      }
    }

    // 搜索功能
    const filteredList = computed(() => {
      const searchLower = searchText.value.toLowerCase()
      return designList.value.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower),
      )
    })

    // 编辑功能
    const handleEdit = (item: DesignItem) => {
      // TODO: 实现编辑功能
      console.log('Edit item:', item)
      router.push({ name: 'DesignEditor', params: { id: item.id } })
    }

    // 删除功能
    const handleDelete = (item: DesignItem) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除"${item.name}"吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          designList.value = designList.value.filter((i) => i.id !== item.id)
          message.success('删除成功')
        },
      })
    }

    // 预览功能
    const handlePreview = (item: DesignItem) => {
      // TODO: 实现预览功能
      console.log('Preview item:', item)
    }

    // 渲染状态标签
    const renderStatus = (status: DesignItem['status']) => {
      const config = STATUS_CONFIG[status]
      return (
        <Tag color={config.color}>
          {{
            icon: () => config.icon,
            default: () => <span class="ml-1">{config.text}</span>,
          }}
        </Tag>
      )
    }

    // 渲染协作者
    const renderCollaborators = (collaborators: Collaborator[]) => {
      return (
        <Avatar.Group maxCount={3}>
          {collaborators.map((collaborator) => (
            <Tooltip
              key={collaborator.id}
              title={`${collaborator.name}${
                collaborator.online ? ' (在线)' : ` (${collaborator.lastActive})`
              }`}
            >
              <Avatar
                src={collaborator.avatar}
                class={collaborator.online ? 'ring-2 ring-green-400' : ''}
              />
            </Tooltip>
          ))}
        </Avatar.Group>
      )
    }

    return () => (
      <div class="design-page glass-container px-6 pt-6">
        <div class="mb-6 flex justify-between items-center">
          <Input
            v-model:value={searchText.value}
            placeholder="搜索设计..."
            class="max-w-xs search-input"
            prefix={<SearchOutlined />}
          />
          <Button type="primary" class="add-design-btn" onClick={handleAdd}>
            <PlusOutlined />
            新增
          </Button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredList.value.map((item) => (
            <Card
              key={item.id}
              hoverable
              class="design-card glass-card"
              cover={<img alt={item.name} src={item.thumbnail} />}
            >
              <div class="flex justify-between items-start mb-2">
                <Card.Meta title={item.name} description={item.description} />
                {renderStatus(item.status)}
              </div>

              <div class="flex justify-between items-center mt-4">
                <div class="flex items-center">
                  <TeamOutlined class="mr-2" />
                  {renderCollaborators(item.collaborators)}
                </div>
                <div class="flex gap-2">
                  <Button
                    type="text"
                    class="action-btn"
                    onClick={() => handlePreview(item)}
                    title="预览"
                  >
                    <EyeOutlined />
                  </Button>
                  <Button
                    type="text"
                    class="action-btn"
                    onClick={() => handleEdit(item)}
                    title="编辑"
                  >
                    <EditOutlined />
                  </Button>
                  <Button
                    type="text"
                    class="action-btn text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(item)}
                    title="删除"
                  >
                    <DeleteOutlined />
                  </Button>
                </div>
              </div>
              {item.currentEditor && (
                <div class="mt-2 text-xs text-gray-400 flex items-center">
                  <Avatar
                    src={item.currentEditor.avatar}
                    size={16}
                    class="mr-1 ring-2 ring-green-400"
                  />
                  <span>{item.currentEditor.name} 正在编辑</span>
                </div>
              )}
              <div class="mt-2 text-xs text-gray-400">创建时间：{item.createTime}</div>
            </Card>
          ))}
        </div>

        <Modal
          v-model:open={showModal.value}
          title="新增设计"
          onOk={handleOk}
          onCancel={handleCancel}
          okText="确定"
          cancelText="取消"
          class="design-modal glass-modal"
          maskClosable={false}
        >
          <Form
            ref={formRef}
            model={formState.value}
            rules={rules}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item label="名称" name="name">
              <Input v-model:value={formState.value.name} placeholder="请输入设计名称" />
            </Form.Item>
            <Form.Item label="描述" name="description">
              <Input.TextArea
                v-model:value={formState.value.description}
                placeholder="请输入设计描述"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  },
})
