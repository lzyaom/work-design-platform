import { defineComponent } from 'vue'
import { Button, Space, Popconfirm } from 'ant-design-vue'
import { DeleteOutlined, DownloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'

export const BatchActions = defineComponent({
  name: 'BatchActions',
  props: {
    selectedCount: {
      type: Number,
      default: 0,
    },
    hasSelected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['batch-delete', 'batch-export'],
  setup(props, { emit }) {
    return () => (
      <Space wrap>
        <Popconfirm
          title="提示"
          description={`确定要删除选中的 ${props.selectedCount} 个用户吗？`}
          placement="bottom"
          okText="确定"
          cancelText="取消"
          disabled={!props.hasSelected}
          onConfirm={() => emit('batch-delete')}
        >
          <Button type="primary" danger disabled={!props.hasSelected}>
            {{
              icon: () => <DeleteOutlined class="align-middle" />,
              default: () => '批量删除',
            }}
          </Button>
        </Popconfirm>

        <Button type="primary" onClick={() => emit('batch-export')} disabled={!props.hasSelected}>
          {{
            icon: () => <DownloadOutlined class="align-middle" />,
            default: () => '批量导出',
          }}
        </Button>

        {props.hasSelected && (
          <span class="text-blue-600">
            <ExclamationCircleOutlined class="mr-2 align-middle" />
            已选择 {props.selectedCount} 项
          </span>
        )}
      </Space>
    )
  },
})
