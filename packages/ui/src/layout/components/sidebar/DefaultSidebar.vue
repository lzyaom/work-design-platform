<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DashboardOutlined,
  CodeOutlined,
  DesktopOutlined,
  FileTextOutlined,
  MonitorOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 图标映射
const iconMap = {
  Dashboard: DashboardOutlined,
  Design: DesktopOutlined,
  Program: CodeOutlined,
  Tasks: FileTextOutlined,
  Monitor: MonitorOutlined,
  Logs: FileTextOutlined,
}

interface MenuItem {
  key: string
  icon?: any
  title?: string
  children?: MenuItem[]
}

// 从路由生成菜单
const menus = computed<MenuItem[]>(() => {
  const routes = router.options.routes.filter((route) => route.meta?.requiresAuth)

  return routes
    .map((route) => {
      // 如果父路由隐藏且有子路由，将显示的子路由提升到顶级
      if (route.meta?.hideInMenu && route.children?.length) {
        return route.children
          .filter((child) => !child.meta?.hideInMenu)
          .map((child) => ({
            key: `${route.path}${child.path === '' ? '' : `/${child.path}`}`,
            icon: iconMap[route.name as keyof typeof iconMap],
            title: child.meta?.title,
          }))
      }

      // 正常显示的路由
      if (!route.meta?.hideInMenu) {
        return [
          {
            key: route.path,
            icon: iconMap[route.name as keyof typeof iconMap],
            title: route.meta?.title,
            children: route.children
              ?.filter((child) => !child.meta?.hideInMenu)
              .map((child) => ({
                key: `${route.path}/${child.path}`,
                title: child.meta?.title,
              })),
          },
        ]
      }

      return []
    })
    .flat()
})

// 当前选中的菜单项
const selectedKeys = computed(() => {
  // 如果是子路由，返回完整路径
  if (route.matched.length > 1) {
    return [route.path]
  }
  // 否则返回主路由路径
  return [route.path]
})

// 当前展开的子菜单
const openKeys = ref<string[]>([])

// 处理菜单点击
const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

// 初始化时展开当前路由的父菜单
const initOpenKeys = () => {
  const parentPath = route.matched[0]?.path
  if (parentPath) {
    openKeys.value = [parentPath]
  }
}

// 组件挂载时初始化展开的菜单
onMounted(initOpenKeys)

// 处理子菜单展开/收起
const handleOpenChange = (keys: string[]) => {
  openKeys.value = keys
}

const collapsed = ref(false)

const emit = defineEmits<{
  (e: 'collapse', collapsed: boolean): void
}>()

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  emit('collapse', collapsed.value)
}
</script>

<template>
  <div class="h-full flex flex-col border-r bg-white">
    <!-- 菜单部分 -->
    <div class="flex-1 overflow-y-auto">
      <a-menu
        mode="inline"
        :inline-collapsed="collapsed"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @click="handleMenuClick"
        @openChange="handleOpenChange"
      >
        <template v-for="(menu, index) in menus" :key="`menu-${index}`">
          <a-sub-menu v-if="menu.children?.length" :key="`submenu-${menu.key}`">
            <template #icon>
              <component :is="menu.icon" />
            </template>
            <template #title>{{ menu.title }}</template>

            <a-menu-item v-for="child in menu.children" :key="child.key">
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>

          <a-menu-item v-if="!menu.children?.length" :key="menu.key">
            <template #icon>
              <component :is="menu.icon" />
            </template>
            {{ menu.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </div>

    <!-- 底部折叠按钮 -->
    <div class="border-t p-4">
      <a-button type="text" block @click="toggleCollapsed" class="flex items-center justify-center">
        <component :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
        <span v-if="!collapsed" class="ml-2">收起菜单</span>
      </a-button>
    </div>
  </div>
</template>

<style scoped>
:deep(.ant-menu) {
  border-right: none;
}

:deep(.ant-menu-item),
:deep(.ant-menu-submenu-title) {
  margin: 0 !important;
}

/* 折叠时的宽度调整 */
:deep(.ant-menu-inline-collapsed) {
  width: 80px;
}

/* 按钮悬停效果 */
:deep(.ant-btn:hover) {
  color: var(--ant-primary-color);
  background-color: rgba(0, 0, 0, 0.025);
}
</style>
