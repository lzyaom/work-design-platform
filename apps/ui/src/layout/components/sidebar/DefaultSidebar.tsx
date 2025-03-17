import { defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu } from 'ant-design-vue'
import type { MenuProps } from 'ant-design-vue'
import { useMenuItems } from '../../composables/useMenuItems'

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

    // 生成菜单项
    const { menuItems } = useMenuItems(router.getRoutes())

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
      if (key.includes('-')) {
        return key.split('-')[0]
      }
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
        items={menuItems.value}
        onClick={handleMenuClick}
      />
    )
  },
})
