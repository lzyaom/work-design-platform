import { defineComponent, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LockOutlined, MailOutlined } from '@ant-design/icons-vue'
import { Button, Form, Input, message, Flex } from 'ant-design-vue'
import { axios } from '@/plugins/axios'
import type { RegisterUser } from '@/types/user'

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const formRef = ref()
    const captchaDisabled = ref(false)
    const countdown = ref(0)
    const router = useRouter()

    // 验证码倒计时
    watch(countdown, (val) => {
      if (val > 0) {
        setTimeout(() => countdown.value--, 1000)
      }
    })

    // 发送验证码
    const sendCaptcha = async () => {
      try {
        await formRef.value.validateFields(['email'])
        const email = formRef.value.getFieldValue('email')
        await axios.post('/api/auth/send-captcha', { email })
        message.success('验证码已发送')
        countdown.value = 60
        captchaDisabled.value = true
      } catch (error) {
        message.error('发送验证码失败')
      }
    }

    // 注册提交
    const onFinish = async (values: RegisterUser) => {
      try {
        await axios.post('/api/auth/register', values)
        message.success('注册成功')
        router.push('/')
      } catch (error) {
        message.error('注册失败')
      }
    }

    return () => (
      <Flex vertical align="center" style={{ minHeight: '100vh', paddingTop: '100px' }}>
        <h1 style={{ marginBottom: '50px' }}>用户注册</h1>
        <Form ref={formRef} onFinish={onFinish} style={{ width: '300px' }}>
          {/* 邮箱输入 */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式错误' },
            ]}
          >
            <Input v-slots={{ prefix: () => <MailOutlined /> }} placeholder="邮箱" />
          </Form.Item>

          {/* 密码输入 */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password v-slots={{ prefix: () => <LockOutlined /> }} placeholder="密码" />
          </Form.Item>

          {/* 验证码输入 */}
          <Form.Item name="captcha" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input
              placeholder="验证码"
              v-slots={{
                addonAfter: () => (
                  <Button
                    type="link"
                    onClick={sendCaptcha}
                    disabled={captchaDisabled.value || countdown.value > 0}
                  >
                    {countdown.value > 0 ? `${countdown.value}秒后重试` : '获取验证码'}
                  </Button>
                ),
              }}
            />
          </Form.Item>

          {/* 注册按钮 */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              注册
            </Button>
          </Form.Item>

          {/* 底部链接 */}
          <Flex justify="space-between">
            <a onClick={() => router.push('/login')}>已有账号？立即登录</a>
          </Flex>
        </Form>
      </Flex>
    )
  },
})
