import { defineComponent } from 'vue'
import { Avatar, Tooltip } from 'ant-design-vue'
import { connectionStatus, onlineUsers } from '../core/collaboration'
import './OnlineUsers.css'

export default defineComponent({
  name: 'OnlineUsers',
  setup() {
    // 渲染用户光标
    const renderCursors = () => {
      return onlineUsers.value.map((user) => (
        <div
          key={user.id}
          class="user-cursor"
          style={{
            transform: `translate(${user.cursor.x}px, ${user.cursor.y}px)`,
          }}
        >
          <div class="cursor-pointer" />
          <Tooltip
            placement="top"
            title={user.selection ? `正在编辑: ${user.selection}` : user.name}
          >
            <Avatar
              src={user.avatar}
              alt={user.name}
              size="small"
              class={['cursor-avatar', { 'cursor-avatar-selecting': user.selection }]}
            />
          </Tooltip>
        </div>
      ))
    }

    return () => (
      <div class="online-users">
        {/* 连接状态 */}
        <div class={['connection-status', connectionStatus.value]}>
          <span class="status-dot" />
          <span class="status-text">
            {connectionStatus.value === 'connected'
              ? '已连接'
              : connectionStatus.value === 'connecting'
                ? '连接中...'
                : '未连接'}
          </span>
        </div>

        {/* 在线用户列表 */}
        <div class="user-list">
          {onlineUsers.value.map((user) => (
            <Tooltip
              key={user.id}
              placement="left"
              title={user.selection ? `正在编辑: ${user.selection}` : '在线'}
            >
              <Avatar
                src={user.avatar}
                alt={user.name}
                class={['user-avatar', { 'user-avatar-selecting': user.selection }]}
              />
            </Tooltip>
          ))}
        </div>

        {/* 用户光标 */}
        {connectionStatus.value === 'connected' && renderCursors()}
      </div>
    )
  },
})
