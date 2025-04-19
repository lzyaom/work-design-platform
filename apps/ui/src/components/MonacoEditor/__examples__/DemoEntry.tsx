import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import './DemoEntry.css'

export default defineComponent({
  name: 'MonacoEditorDemoEntry',
  
  setup() {
    const router = useRouter()
    
    const goToDemo = () => {
      router.push('/monaco-editor')
    }
    
    return () => (
      <div class="demo-entry-container">
        <div class="demo-entry-card" onClick={goToDemo}>
          <div class="demo-entry-icon">
            <i class="codicon codicon-code" />
          </div>
          <div class="demo-entry-content">
            <h3 class="demo-entry-title">Monaco Editor</h3>
            <p class="demo-entry-description">
              功能强大的代码编辑器组件，支持语法高亮、代码格式化、智能提示等特性
            </p>
            <div class="demo-entry-features">
              <span class="feature-tag">语法高亮</span>
              <span class="feature-tag">代码格式化</span>
              <span class="feature-tag">智能提示</span>
              <span class="feature-tag">主题切换</span>
            </div>
          </div>
          <div class="demo-entry-arrow">
            <i class="codicon codicon-arrow-right" />
          </div>
        </div>
      </div>
    )
  }
})