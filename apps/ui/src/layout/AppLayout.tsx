import { defineComponent, ref } from 'vue'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { Button } from 'ant-design-vue'
import DefaultNav from './components/nav/DefaultNav.vue'
import DefaultSidebar from './components/sidebar/DefaultSidebar.vue'
import './AppLayout.css'

export default defineComponent({
  name: 'AppLayout',
  setup() {
    const collapsed = ref(false)

    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value
    }

    return () => (
      <div class="h-screen flex">
        <aside class={`glass-sidebar ${collapsed.value ? 'collapsed' : ''} md:!translate-x-0`}>
          <div class="logo">
            <img src="../assets/logo.svg" alt="logo" class="w-8 h-8" />
          </div>
          <DefaultSidebar v-model:collapsed={collapsed.value} />
        </aside>
        <div class={`main-content ${collapsed.value ? 'collapsed' : ''}`}>
          <nav class="glass-navbar flex items-center justify-between px-4">
            <div class="flex items-center">
              <Button type="text" class="glass-button !border-none" onClick={toggleCollapsed}>
                {collapsed.value ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </Button>
              <DefaultNav />
            </div>
          </nav>
          <main class="h-[calc(100vh-4rem)] overflow-auto">
            <div class="glass-container h-full">
              <router-view />
            </div>
          </main>
        </div>
      </div>
    )
  },
})
