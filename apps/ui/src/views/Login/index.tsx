import { defineComponent, ref } from 'vue'
import { Input, Button, Form, message } from 'ant-design-vue'
import { axios } from '@/plugins/axios'
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
            <h1 class="login-title">Welcome Back</h1>
            <Form class="login-form" onSubmit={handleSubmit}>
              <Form.Item>
                <Input
                  v-model={[form.value.email, 'value']}
                  placeholder="Email"
                  class="login-input"
                />
              </Form.Item>
              <Form.Item>
                <Input
                  v-model={[form.value.password, 'value']}
                  placeholder="Password"
                  type="password"
                  class="login-input"
                />
              </Form.Item>
              <Form.Item>
                <div class="verification-code-container">
                  <Input
                    v-model={[form.value.verificationCode, 'value']}
                    placeholder="Verification Code"
                    class="login-input"
                  />
                  <Button
                    onClick={getVerificationCode}
                    disabled={countdown.value > 0 || loading.value}
                    loading={loading.value}
                    class="verification-code-btn"
                  >
                    {countdown.value > 0 ? `${countdown.value}s` : 'Get Code'}
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
                  Login
                </Button>
              </Form.Item>
              <Form.Item>
                <a href="#" class="forgot-password">
                  Forgot password?
                </a>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    )
  },
})
