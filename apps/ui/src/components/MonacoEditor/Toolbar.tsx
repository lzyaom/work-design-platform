import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { EditorTheme } from './themes'
import type { ToolbarButton } from './types'
import ThemePreview from './ThemePreview'

export default defineComponent({
  name: 'EditorToolbar',

  components: {
    ThemePreview,
  },

  props: {
    theme: {
      type: String as PropType<EditorTheme>,
      required: true,
    },
    placement: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'top',
    },
    showThemeSelector: {
      type: Boolean,
      default: true,
    },
    buttons: {
      type: Array as PropType<ToolbarButton[]>,
      default: () => [],
    },
  },

  emits: {
    'update:theme': (theme: EditorTheme) => true,
    'theme-change': (theme: EditorTheme) => true,
  },

  setup(props, { emit }) {
    const handleThemeChange = (theme: EditorTheme) => {
      emit('update:theme', theme)
      emit('theme-change', theme)
    }

    return () => (
      <div class={['editor-toolbar', `editor-toolbar--${props.placement}`]}>
        <div class="toolbar-group">
          {props.buttons.map((button, index) => (
            <button
              key={index}
              class={['toolbar-button', { 'toolbar-button--disabled': button.disabled }]}
              onClick={button.action}
              disabled={button.disabled}
              title={button.tooltip || button.label}
              type="button"
              aria-label={button.label}
            >
              <span class="toolbar-button-icon" aria-hidden="true">
                {button.icon}
              </span>
              <span class="toolbar-button-label">{button.label}</span>
              {button.shortcut && (
                <span class="toolbar-button-shortcut" aria-hidden="true">
                  {button.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>

        {props.showThemeSelector && (
          <div class="toolbar-group">
            <ThemePreview
              modelValue={props.theme}
              placement={props.placement === 'bottom' ? 'top' : 'bottom'}
              onUpdate:modelValue={handleThemeChange}
              onChange={handleThemeChange}
            />
          </div>
        )}

        <style>
          {`
          .editor-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            background: var(--editor-toolbar-background);
            border: 1px solid var(--editor-border-color);
          }

          .editor-toolbar--top {
            border-bottom: 1px solid var(--editor-border-color);
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
          }

          .editor-toolbar--bottom {
            border-top: 1px solid var(--editor-border-color);
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
          }

          .editor-toolbar--left {
            flex-direction: column;
            border-right: 1px solid var(--editor-border-color);
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
          }

          .editor-toolbar--right {
            flex-direction: column;
            border-left: 1px solid var(--editor-border-color);
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
          }

          .toolbar-group {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .editor-toolbar--left .toolbar-group,
          .editor-toolbar--right .toolbar-group {
            flex-direction: column;
          }

          .toolbar-button {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border: 1px solid transparent;
            border-radius: 4px;
            background: none;
            color: var(--editor-foreground);
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
          }

          .toolbar-button:hover:not(:disabled) {
            background: var(--editor-toolbar-hover);
          }

          .toolbar-button:active:not(:disabled) {
            background: var(--editor-toolbar-active);
          }

          .toolbar-button:focus-visible {
            outline: 2px solid var(--editor-focus-border);
            outline-offset: 2px;
          }

          .toolbar-button--disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .toolbar-button-icon {
            font-size: 14px;
          }

          .toolbar-button-shortcut {
            font-size: 11px;
            opacity: 0.7;
            margin-left: 4px;
          }

          @media (max-width: 768px) {
            .toolbar-button-label,
            .toolbar-button-shortcut {
              display: none;
            }

            .toolbar-button {
              padding: 6px;
            }

            .toolbar-button-icon {
              font-size: 16px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .toolbar-button {
              transition: none;
            }
          }
          `}
        </style>
      </div>
    )
  },
})
