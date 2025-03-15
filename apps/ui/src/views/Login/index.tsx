import { defineComponent, ref } from 'vue'
import { Input, Button, Form, message } from 'ant-design-vue'
import { axios } from '@/plugins/axios'
import { RouterLink } from 'vue-router'
import './index.css'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const form = ref({
      email: '',
      password: '',
      verificationCode: '',
    })

    const loading = ref(false)
    const countdown = ref(0)
    const timer = ref<number | null>(null)

    const startCountdown = () => {
      countdown.value = 60
      timer.value = window.setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          if (timer.value) {
            clearInterval(timer.value)
            timer.value = null
          }
        }
      }, 1000)
    }

    const getVerificationCode = async () => {
      if (!form.value.email) {
        message.error('Please enter your email first')
        return
      }

      try {
        loading.value = true
        await axios.post('/api/auth/verification-code', {
          email: form.value.email,
        })
        message.success('Verification code sent')
        startCountdown()
      } catch (error) {
        message.error('Failed to send verification code')
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = async (e: Event) => {
      e.preventDefault()
      if (!form.value.email || !form.value.password || !form.value.verificationCode) {
        message.error('Please fill in all fields')
        return
      }

      try {
        loading.value = true
        const response = await axios.post('/api/auth/login', {
          email: form.value.email,
          password: form.value.password,
          verificationCode: form.value.verificationCode,
        })
        message.success('Login successful')
        // Handle successful login (e.g., store token, redirect)
      } catch (error) {
        message.error('Login failed')
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="login-container">
        <div class="login-background"></div>
        <div class="login-content">
          <div class="login-card">
            <h1 class="login-title">欢迎回来</h1>
            <Form class="login-form" onSubmit={handleSubmit}>
              <Form.Item>
                <Input
                  v-model={[form.value.email, 'value']}
                  placeholder="请输入邮箱"
                  class="login-input"
                />
              </Form.Item>
              <Form.Item>
                <Input
                  v-model={[form.value.password, 'value']}
                  placeholder="请输入密码"
                  type="password"
                  class="login-input"
                />
              </Form.Item>
              <Form.Item>
                <div class="verification-code-container">
                  <Input
                    v-model={[form.value.verificationCode, 'value']}
                    placeholder="请输入验证码"
                    class="login-input"
                  />
                  <Button
                    onClick={getVerificationCode}
                    disabled={countdown.value > 0 || loading.value}
                    loading={loading.value}
                    class="verification-code-btn"
                  >
                    {countdown.value > 0 ? `${countdown.value}s` : '获取验证码'}
                  </Button>
                </div>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading.value}
                  class="login-button"
                >
                  登录
                </Button>
              </Form.Item>
              <div class="links-container">
                <a href="#" class="forgot-password">
                  忘记密码?
                </a>
                <RouterLink to={{ name: 'Register' }} class="register-link font-medium">
                  新用户？立即注册
                </RouterLink>
              </div>
            </Form>
          </div>
        </div>
      </div>
    )
  },
})
