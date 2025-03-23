import { defineComponent, ref, watch } from 'vue'
import { Form, Input, Select, Radio, Modal } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { User } from '@/types/user'

export const UserForm = defineComponent({
  name: 'UserForm',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '添加用户',
    },
    initialValues: {
      type: Object as () => Partial<User>,
      default: () => ({}),
    },
  },
  emits: ['update:visible', 'submit'],
  setup(props, { emit }) {
    const formRef = ref()
    const formState = ref<Partial<User>>({
      username: '',
      email: '',
      role: 'user',
      gender: 'male',
      status: 'enabled',
      ...props.initialValues,
    })

    // 重置表单
    const resetForm = () => {
      formState.value = {
        username: '',
        email: '',
        role: 'user',
        gender: 'male',
        status: 'enabled',
      }
      formRef.value?.resetFields()
    }

    // 监听初始值变化
    watch(
      () => props.initialValues,
      (newVal) => {
        formState.value = {
          ...formState.value,
          ...newVal,
        }
      },
    )

    // 表单验证规则
    const rules: Record<string, Rule[]> = {
      username: [
        { required: true, message: '请输入用户名' },
        { type: 'string', min: 3, max: 20, message: '用户名长度应为3-20个字符' },
      ],
      email: [
        { required: true, message: '请输入邮箱地址' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
      role: [{ required: true, message: '请选择用户角色' }],
      gender: [{ required: true, message: '请选择性别' }],
      status: [{ required: true, message: '请选择账户状态' }],
    }

    // 处理表单提交
    const handleSubmit = async () => {
      if (formRef.value == null) {
        return
      }
      try {
        const valid = await formRef.value.validate()
        if (!valid) {
          return
        }
        emit('submit', formState.value)
      } catch (error: unknown) {
        console.error('表单验证失败:', error)
      }
    }

    // 处理取消
    const handleCancel = () => {
      resetForm()
      emit('update:visible', false)
    }

    return () => (
      <Modal
        open={props.visible}
        title={props.title}
        okText="确定"
        cancelText="取消"
        width={600}
        confirmLoading={props.loading}
        destroyOnClose
        onOk={handleSubmit}
        onCancel={handleCancel}
      >
        <Form
          ref={formRef}
          model={formState.value}
          rules={rules}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item label="用户名" name="username">
            <Input v-model:value={formState.value.username} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item label="邮箱" name="email">
            <Input v-model:value={formState.value.email} placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item label="角色" name="role">
            <Select v-model:value={formState.value.role} placeholder="请选择用户角色">
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="guest">访客</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="性别" name="gender">
            <Radio.Group v-model:value={formState.value.gender}>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Radio.Group v-model:value={formState.value.status}>
              <Radio value="enabled">启用</Radio>
              <Radio value="disabled">禁用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    )
  },
})
