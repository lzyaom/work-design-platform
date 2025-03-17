import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  TranslationOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { Menu, Dropdown, Button, Badge, MenuItem, MenuDivider, Avatar } from 'ant-design-vue'
import './index.module.css'

export default defineComponent({
  name: 'DefaultNav',
  setup() {
    const router = useRouter()
    const currentLang = ref('简体中文')
    const notifications = ref([
      {
        id: '1',
        title: '系统通知：新版本发布',
        time: '10分钟前',
      },
      {
        id: '2',
        title: '任务完成提醒',
        time: '1小时前',
      },
    ]) // 保持原有数据不变
    const userInfo = ref({
      name: '管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    }) // 保持原有数据不变

    const handleLangChange: MenuProps['onClick'] = ({ key }) => {
      currentLang.value = key === 'zh-CN' ? '简体中文' : 'English'
    }

    const handleLogout = () => {
      router.push('/login')
    }

    return {
      currentLang,
      notifications,
      userInfo,
      handleLangChange,
      handleLogout,
    }
  },
  render() {
    const { currentLang, notifications, userInfo, handleLangChange, handleLogout } = this
    return (
      <div class="default-nav space-x-4">
        {/* 语言切换 */}
        <Dropdown>
          {{
            default: () => (
              <Button type="text">
                <TranslationOutlined />
                {currentLang}
              </Button>
            ),
            overlay: () => (
              <Menu onClick={handleLangChange}>
                <MenuItem key="zh-CN">简体中文</MenuItem>
                <MenuItem key="en-US">English</MenuItem>
              </Menu>
            ),
          }}
        </Dropdown>

        {/* 通知中心 */}
        <Dropdown>
          {{
            default: () => (
              <Badge count={notifications.length}>
                <Button type="text">
                  <BellOutlined />
                </Button>
              </Badge>
            ),
            overlay: () => (
              <Menu class="notification-menu">
                {notifications.length === 0 ? (
                  <MenuItem>
                    <div class="empty-tip">暂无通知</div>
                  </MenuItem>
                ) : (
                  <>
                    {notifications.map((item) => (
                      <MenuItem key={item.id}>
                        <div class="notification-item">
                          <div class="notification-title">{item.title}</div>
                          <div class="notification-time">{item.time}</div>
                        </div>
                      </MenuItem>
                    ))}
                    <MenuDivider />
                    <MenuItem>
                      <div class="view-all">查看全部</div>
                    </MenuItem>
                  </>
                )}
              </Menu>
            ),
          }}
        </Dropdown>

        {/* 用户菜单 */}
        <Dropdown>
          {{
            default: () => (
              <>
                <Avatar src={userInfo.avatar} />
                <span class="username">{userInfo.name}</span>
              </>
            ),
            overlay: () => (
              <Menu>
                <MenuItem key="profile">
                  <UserOutlined />
                  个人中心
                </MenuItem>
                <MenuItem key="settings">
                  <SettingOutlined />
                  系统设置
                </MenuItem>
                <MenuDivider />
                <MenuItem key="logout" onClick={handleLogout}>
                  <LogoutOutlined />
                  退出登录
                </MenuItem>
              </Menu>
            ),
          }}
        </Dropdown>
      </div>
    )
  },
})
