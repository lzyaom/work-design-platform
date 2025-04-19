import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingOverlay',

  props: {
    message: {
      type: String,
      default: '加载中...'
    },
    progress: {
      type: Number,
      default: -1 // -1 表示不显示进度
    }
  },

  setup(props) {
    return () => (
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner">
            <svg viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur="1s"
                  from="0 25 25"
                  to="360 25 25"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
          <div class="loading-message">{props.message}</div>
          {props.progress >= 0 && (
            <div class="loading-progress">
              <div
                class="progress-bar"
                style={{ width: `${props.progress}%` }}
              />
              <span class="progress-text">{props.progress}%</span>
            </div>
          )}
        </div>

        <style>
          {`
          .loading-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .loading-content {
            text-align: center;
            color: #fff;
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
            margin: 0 auto 16px;
            color: #409eff;
          }

          .loading-spinner svg {
            width: 100%;
            height: 100%;
          }

          .loading-message {
            font-size: 14px;
            margin-bottom: 12px;
          }

          .loading-progress {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            position: relative;
            overflow: hidden;
          }

          .progress-bar {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            background: #409eff;
            transition: width 0.3s ease;
          }

          .progress-text {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 8px;
            font-size: 12px;
            white-space: nowrap;
          }

          @media (prefers-reduced-motion) {
            .loading-spinner svg circle {
              animation: none;
            }
          }

          @supports not (backdrop-filter: blur(4px)) {
            .loading-overlay {
              background: rgba(0, 0, 0, 0.85);
            }
          }
          `}
        </style>
      </div>
    )
  }
})