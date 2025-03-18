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
import { Menu, Dropdown, Button, Badge, MenuItem, MenuDivider, Avatar, Input } from 'ant-design-vue'

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
      <div class="default-nav flex items-center space-x-3">
        {/* 搜索框 */}
        <div class="search-box">
          <Input type="text" placeholder="搜索..." />
        </div>
        {/* 通知中心 */}
        <Dropdown trigger="click" placement="bottom" arrow>
          {{
            default: () => (
              <Badge count={notifications.length}>
                <Button type="text">
                  <BellOutlined class="text-base leading-5 align-top" />
                </Button>
              </Badge>
            ),
            overlay: () => (
              <Menu class="notification-menu w-72 max-h-[400px] overflow-auto">
                {notifications.length === 0 ? (
                  <MenuItem>
                    <div class="empty-tip text-center p-4 text-gray-500">暂无通知</div>
                  </MenuItem>
                ) : (
                  <>
                    {notifications.map((item) => (
                      <MenuItem key={item.id}>
                        <div class="notification-item px-2">
                          <div class="notification-title text-gray-700 hover:text-blue-500 leading-6">
                            {item.title}
                          </div>
                          <div class="notification-time text-xs text-gray-400">{item.time}</div>
                        </div>
                      </MenuItem>
                    ))}
                    <MenuDivider />
                    <MenuItem>
                      <div class="view-all text-center text-blue-500">查看全部</div>
                    </MenuItem>
                  </>
                )}
              </Menu>
            ),
          }}
        </Dropdown>
        {/* 语言切换 */}
        <Dropdown trigger="click" placement="bottom" arrow>
          {{
            default: () => (
              <Button type="text">
                <TranslationOutlined class="align-middle" />
                {currentLang}
              </Button>
            ),
            overlay: () => (
              <Menu class="lang-menu w-32 text-center" onClick={handleLangChange}>
                <MenuItem key="zh-CN">简体中文</MenuItem>
                <MenuItem key="en-US">English</MenuItem>
              </Menu>
            ),
          }}
        </Dropdown>

        {/* 用户菜单 */}
        <Dropdown trigger="click" placement="bottom" arrow>
          {{
            default: () => (
              <Button type="text" class="user-info flex items-center">
                <Avatar src={userInfo.avatar} shape="circle" class="bg-blue-400" />
                <span class="username ml-2">{userInfo.name}</span>
              </Button>
            ),
            overlay: () => (
              <Menu class="user-menu">
                <MenuItem key="profile" icon={<UserOutlined />}>
                  个人中心
                </MenuItem>
                <MenuItem key="settings" icon={<SettingOutlined />}>
                  系统设置
                </MenuItem>
                <MenuDivider />
                <MenuItem key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
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
