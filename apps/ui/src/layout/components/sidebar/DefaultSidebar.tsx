import { defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DashboardOutlined,
  LayoutOutlined,
  CodeOutlined,
  UnorderedListOutlined,
  MonitorOutlined,
  FileTextOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue'
import { Menu } from 'ant-design-vue'
import type { MenuProps } from 'ant-design-vue'

const { Item: MenuItem, SubMenu } = Menu

export default defineComponent({
  name: 'DefaultSidebar',
  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:collapsed'],
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const selectedKeys = ref<string[]>([route.name as string])
    const openKeys = ref<string[]>([])

    // 监听路由变化
    watch(
      () => route.name,
      (newName) => {
        if (newName) {
          selectedKeys.value = [newName as string]
          // 设置展开的子菜单
          const parentKey = getParentKey(newName as string)
          if (parentKey && !props.collapsed) {
            openKeys.value = [parentKey]
          }
        }
      },
      { immediate: true },
    )

    // 监听折叠状态
    watch(
      () => props.collapsed,
      (newCollapsed) => {
        if (newCollapsed) {
          openKeys.value = []
        } else {
          const parentKey = getParentKey(route.name as string)
          if (parentKey) {
            openKeys.value = [parentKey]
          }
        }
      },
    )

    // 获取父级菜单 key
    const getParentKey = (key: string): string | null => {
      if (key.startsWith('design-')) return 'design'
      if (key.startsWith('program-')) return 'program'
      return null
    }

    // 菜单点击事件
    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
      router.push({ name: key as string })
    }

    return () => (
      <Menu
        v-model:selectedKeys={selectedKeys.value}
        v-model:openKeys={openKeys.value}
        mode="inline"
        class="sidebar-menu"
        inline-collapsed={props.collapsed}
        onClick={handleMenuClick}
      >
        <MenuItem key="dashboard">
          {{
            icon: () => <DashboardOutlined />,
            default: () => <span class="menu-title">仪表盘</span>,
          }}
        </MenuItem>

        <SubMenu key="design">
          {{
            icon: () => <LayoutOutlined />,
            title: () => <span class="menu-title">设计</span>,
            default: () => (
              <>
                <MenuItem key="design-editor">
                  {{
                    icon: () => <EditOutlined />,
                    default: () => <span class="menu-title">编辑器</span>,
                  }}
                </MenuItem>
                <MenuItem key="design-preview">
                  {{
                    icon: () => <EyeOutlined />,
                    default: () => <span class="menu-title">预览</span>,
                  }}
                </MenuItem>
              </>
            ),
          }}
        </SubMenu>

        <SubMenu key="program">
          {{
            icon: () => <CodeOutlined />,
            title: () => <span class="menu-title">编程</span>,
            default: () => (
              <>
                <MenuItem key="program-editor">
                  {{
                    icon: () => <EditOutlined />,
                    default: () => <span class="menu-title">编辑器</span>,
                  }}
                </MenuItem>
                <MenuItem key="program-preview">
                  {{
                    icon: () => <EyeOutlined />,
                    default: () => <span class="menu-title">预览</span>,
                  }}
                </MenuItem>
              </>
            ),
          }}
        </SubMenu>

        <MenuItem key="tasks">
          {{
            icon: () => <UnorderedListOutlined />,
            default: () => <span class="menu-title">任务</span>,
          }}
        </MenuItem>

        <MenuItem key="monitor">
          {{
            icon: () => <MonitorOutlined />,
            default: () => <span class="menu-title">监控</span>,
          }}
        </MenuItem>

        <MenuItem key="logs">
          {{
            icon: () => <FileTextOutlined />,
            default: () => <span class="menu-title">日志</span>,
          }}
        </MenuItem>
      </Menu>
    )
  },
})
