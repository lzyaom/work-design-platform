<script setup lang="ts">
import { ref } from 'vue'
import {
  UserOutlined,
  BellOutlined,
  GlobalOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'

const currentLang = ref('zh-CN')
const unreadCount = ref(5)

const languages = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

const notifications = [
  { id: 1, title: '系统通知', content: '系统将于今晚维护', time: '10分钟前' },
  { id: 2, title: '任务提醒', content: '有新的任务待处理', time: '1小时前' },
]

const handleLogout = () => {
  message.success('退出成功')
}
</script>

<template>
  <div class="flex items-center justify-between px-6 h-full">
    <!-- 右侧功能区 -->
    <div class="flex items-center gap-6">
      <!-- 语言切换 -->
      <a-dropdown arrow>
        <div class="flex items-center cursor-pointer hover:text-primary">
          <global-outlined />
          <span class="ml-1">{{ languages.find((l) => l.value === currentLang)?.label }}</span>
        </div>
        <template #overlay>
          <a-menu @click="({ key }: MenuInfo) => (currentLang = key as string)">
            <a-menu-item v-for="lang in languages" :key="lang.value">
              {{ lang.label }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <!-- 通知 -->
      <a-dropdown placement="bottomRight" arrow>
        <div class="cursor-pointer">
          <a-badge :count="unreadCount">
            <bell-outlined class="text-xl hover:text-primary" />
          </a-badge>
        </div>
        <template #overlay>
          <a-card class="w-80 !p-0">
            <template #title>
              <div class="flex justify-between items-center">
                <span>通知</span>
                <a-button type="link" size="small">全部已读</a-button>
              </div>
            </template>
            <a-list class="max-h-80 overflow-y-auto">
              <a-list-item v-for="notice in notifications" :key="notice.id">
                <div class="w-full">
                  <div class="flex justify-between">
                    <span class="font-medium">{{ notice.title }}</span>
                    <span class="text-gray-400 text-sm">{{ notice.time }}</span>
                  </div>
                  <div class="text-gray-500 text-sm mt-1">{{ notice.content }}</div>
                </div>
              </a-list-item>
            </a-list>
            <template #actions>
              <a-button type="link" block>查看全部</a-button>
            </template>
          </a-card>
        </template>
      </a-dropdown>

      <!-- 用户菜单 -->
      <a-dropdown placement="bottomRight" arrow>
        <div class="flex items-center cursor-pointer hover:text-primary">
          <a-avatar class="bg-blue-500">
            <template #icon><user-outlined /></template>
          </a-avatar>
          <span class="ml-2">管理员</span>
        </div>
        <template #overlay>
          <a-menu class="w-40">
            <a-menu-item>
              <template #icon><user-outlined /></template>
              <span>个人信息</span>
            </a-menu-item>
            <a-menu-item>
              <template #icon><setting-outlined /></template>
              <span>设置</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="handleLogout" class="text-red-500">
              <template #icon><logout-outlined /></template>
              <span>退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>
