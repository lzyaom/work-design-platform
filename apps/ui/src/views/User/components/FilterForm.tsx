import { defineComponent, ref, watch } from 'vue'
import { Form, Input, Select, DatePicker, Space, Button, type FormInstance } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { UserQueryParams, FilterFormState } from '@/types/user'

export const FilterForm = defineComponent({
  name: 'FilterForm',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    initialValues: {
      type: Object as () => Partial<UserQueryParams>,
      default: () => ({}),
    },
  },
  emits: ['search'],
  setup(props, { emit }) {
    const formRef = ref<FormInstance | null>(null)

    // 转换初始值中的日期字符串为Dayjs对象
    const convertInitialValues = (values: Partial<UserQueryParams>): Partial<FilterFormState> => {
      const converted = { ...values } as Partial<FilterFormState>

      if (values.dateRange) {
        const [startStr, endStr] = values.dateRange
        converted.dateRange = [dayjs(startStr), dayjs(endStr)]
      }

      return converted
    }

    const formState = ref<FilterFormState>({
      username: '',
      status: undefined,
      isOnline: undefined,
      dateRange: undefined,
      ...convertInitialValues(props.initialValues),
    })

    // 监听表单值变化
    watch(
      () => props.initialValues,
      (newVal) => {
        const convertedValues = convertInitialValues(newVal)
        formState.value = {
          ...formState.value,
          ...convertedValues,
        }
      },
      { deep: true },
    )

    // 重置表单
    const handleReset = () => {
      formRef.value?.resetFields()
      emit('search', {})
    }

    // 提交表单
    const handleFinish = (values: FilterFormState) => {
      const searchParams: Partial<UserQueryParams> = {
        ...values,
        dateRange: undefined, // 先移除dateRange，后面再添加转换后的值
      }

      // 处理日期范围
      if (values.dateRange) {
        const [start, end] = values.dateRange
        searchParams.dateRange = [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
      }

      emit('search', searchParams)
    }

    return () => (
      <Form
        class="p-4 bg-white border rounded-lg"
        ref={formRef}
        layout="inline"
        model={formState.value}
        onFinish={handleFinish}
      >
        <Form.Item name="username">
          <Input
            v-model:value={formState.value.username}
            placeholder="输入用户名搜索"
            allowClear
            prefix={<SearchOutlined />}
          />
        </Form.Item>

        <Form.Item name="status">
          <Select v-model:value={formState.value.status} placeholder="账户状态" allowClear>
            <Select.Option value="enabled">启用</Select.Option>
            <Select.Option value="disabled">禁用</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="isOnline">
          <Select v-model:value={formState.value.isOnline} placeholder="在线状态" allowClear>
            <Select.Option value={true}>在线</Select.Option>
            <Select.Option value={false}>离线</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="dateRange">
          <DatePicker.RangePicker
            v-model:value={formState.value.dateRange}
            placeholder={['开始日期', '结束日期']}
            disabledDate={(current: dayjs.Dayjs) => current && current > dayjs().endOf('day')}
            allowClear
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" disabled={props.loading}>
              查询
            </Button>
            <Button onClick={handleReset} disabled={props.loading}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    )
  },
})
