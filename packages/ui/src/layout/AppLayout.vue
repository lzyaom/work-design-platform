<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import DefaultNav from './components/nav/DefaultNav.vue'
import DefaultSidebar from './components/sidebar/DefaultSidebar.vue'
import { ref } from 'vue'

const route = useRoute()
const isDesignPage = computed(() => route.name === 'DesignEditor')

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 处理侧边栏折叠状态变化
const handleCollapse = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed
}
</script>

<template>
  <div
    class="layout"
    :class="{ 'flex h-full': isDesignPage, 'flex flex-col min-h-screen': !isDesignPage }"
  >
    <!-- 设计页面布局 -->
    <template v-if="isDesignPage">
      <aside
        class="transition-all duration-300"
        :class="[sidebarCollapsed ? 'w-[80px]' : 'w-[240px]']"
      >
        <DefaultSidebar @collapse="handleCollapse" />
      </aside>

      <div class="flex-1 flex flex-col">
        <nav class="h-16 bg-white border-b">
          <DefaultNav />
        </nav>
        <main class="flex-1 overflow-y-auto p-6">
          <router-view />
        </main>
      </div>
    </template>

    <!-- 默认布局 -->
    <template v-else>
      <nav class="h-16 bg-white border-b">
        <DefaultNav />
      </nav>

      <div class="flex flex-1">
        <aside
          class="transition-all duration-300"
          :class="[sidebarCollapsed ? 'w-[80px]' : 'w-[240px]']"
        >
          <DefaultSidebar @collapse="handleCollapse" />
        </aside>

        <main class="flex-1 overflow-y-auto">
          <router-view />
        </main>
      </div>
    </template>
  </div>
</template>
