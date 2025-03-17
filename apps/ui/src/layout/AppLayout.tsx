import { defineComponent, Transition, type Component, type PropType, type VNode } from 'vue'
import { RouterView, type RouteLocationNormalizedLoaded } from 'vue-router'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { Button } from 'ant-design-vue'
import DefaultNav from './components/nav/DefaultNav.tsx'
import DefaultSidebar from './components/sidebar/DefaultSidebar'
import type { LayoutSettings } from './types'
import { useLayout } from './composables/useLayout'
import './AppLayout.css'

export default defineComponent({
  name: 'AppLayout',
  props: {
    settings: {
      type: Object as PropType<Partial<LayoutSettings>>,
      default: () => ({}),
    },
  },
  setup(props) {
    const { collapsed, toggleCollapsed, isMobile, settings } = useLayout(props.settings)

    return {
      toggleCollapsed,
      collapsed,
      isMobile,
      layoutSettings: settings,
    }
  },
  render() {
    const { collapsed, isMobile, layoutSettings, toggleCollapsed } = this
    // 渲染自定义组件或默认组件
    const renderComponent = (
      slot: keyof LayoutSettings['components'],
      defaultComponent: Component | null,
    ) => {
      return layoutSettings.components[slot] || defaultComponent
    }
    return (
      <div class="h-screen flex">
        {/* 侧边栏 */}
        <aside
          class={{
            'glass-sidebar': true,
            collapsed: collapsed,
            'md:!translate-x-0': true,
            fixed: isMobile,
          }}
          style={{
            width: collapsed
              ? `${layoutSettings.layout.collapsedWidth}px`
              : `${layoutSettings.layout.sidebarWidth}px`,
          }}
        >
          {/* Logo区域 */}
          <div class="logo">
            {renderComponent('logo', <img src="@/assets/logo.svg" alt="logo" class="w-8 h-8" />)}
          </div>

          {/* 侧边栏内容 */}
          {renderComponent('sidebar', <DefaultSidebar v-model:collapsed={collapsed} />)}
        </aside>

        {/* 主内容区域 */}
        <div
          class={{
            'main-content': true,
            collapsed: collapsed,
            'ml-0': isMobile,
          }}
        >
          {/* 头部导航 */}
          <nav
            class="glass-navbar px-4"
            style={{ height: `${layoutSettings.layout.headerHeight}px` }}
          >
            <div class="flex justify-between items-center h-full">
              {layoutSettings.layout.sidebarCollapsible && (
                <Button type="text" class="glass-button !border-none" onClick={toggleCollapsed}>
                  {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </Button>
              )}
              {renderComponent('header', <DefaultNav />)}
            </div>
          </nav>

          {/* 主内容 */}
          <main
            class="overflow-auto"
            style={{ height: `calc(100vh - ${layoutSettings.layout.headerHeight}px)` }}
          >
            <div class="glass-container h-full">
              <RouterView
                v-slots={{
                  default: ({
                    Component: PageComponent,
                  }: {
                    Component: VNode
                    route: RouteLocationNormalizedLoaded
                  }) => {
                    return (
                      <Transition name="fade" mode="out-in">
                        {PageComponent}
                      </Transition>
                    )
                  },
                }}
              />
            </div>
          </main>

          {/* 页脚 */}
          {layoutSettings.components.footer && (
            <footer class="glass-footer">{renderComponent('footer', null)}</footer>
          )}
        </div>
      </div>
    )
  },
})
