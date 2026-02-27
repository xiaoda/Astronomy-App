import type { MouseEventHandler, PointerEventHandler } from 'react'

type SettingsPanelProps = {
  isOpen: boolean
  showQuote: boolean
  onToggleOpen: () => void
  onShowQuoteChange: (nextValue: boolean) => void
}

const stopPointerPropagation: PointerEventHandler<HTMLElement> = (event) => {
  event.stopPropagation()
}

const stopClickPropagation: MouseEventHandler<HTMLElement> = (event) => {
  event.stopPropagation()
}

function SettingsPanel({ isOpen, showQuote, onToggleOpen, onShowQuoteChange }: SettingsPanelProps) {
  return (
    <aside
      className="settings-root"
      onPointerDown={stopPointerPropagation}
      onPointerUp={stopPointerPropagation}
      onPointerMove={stopPointerPropagation}
      onPointerCancel={stopPointerPropagation}
      onClick={stopClickPropagation}
    >
      <button
        type="button"
        className="settings-trigger"
        aria-expanded={isOpen}
        aria-controls="app-settings-panel"
        onClick={onToggleOpen}
      >
        设置
      </button>

      {isOpen ? (
        <section id="app-settings-panel" className="settings-panel" aria-label="Display settings">
          <label className="settings-item">
            <span>文案显示</span>
            <input
              type="checkbox"
              checked={showQuote}
              onChange={(event) => onShowQuoteChange(event.target.checked)}
            />
          </label>
        </section>
      ) : null}
    </aside>
  )
}

export default SettingsPanel
