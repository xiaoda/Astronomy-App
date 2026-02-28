import type { MouseEventHandler, PointerEventHandler } from 'react'

import './SettingsPanel.css'

type SettingsPanelProps = {
  isOpen: boolean
  showQuote: boolean
  isMusicEnabled: boolean
  onToggleOpen: () => void
  onShowQuoteChange: (nextValue: boolean) => void
  onMusicEnabledChange: (nextValue: boolean) => void
}

const stopPointerPropagation: PointerEventHandler<HTMLElement> = (event) => {
  event.stopPropagation()
}

const stopClickPropagation: MouseEventHandler<HTMLElement> = (event) => {
  event.stopPropagation()
}

function SettingsPanel({
  isOpen,
  showQuote,
  isMusicEnabled,
  onToggleOpen,
  onShowQuoteChange,
  onMusicEnabledChange,
}: SettingsPanelProps) {
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
        <section id="app-settings-panel" className="settings-panel" aria-label="显示设置">
          <label className="settings-item">
            <span>显示文案</span>
            <input
              type="checkbox"
              checked={showQuote}
              onChange={(event) => onShowQuoteChange(event.target.checked)}
            />
          </label>
          <label className="settings-item">
            <span>背景音乐</span>
            <input
              type="checkbox"
              checked={isMusicEnabled}
              onChange={(event) => onMusicEnabledChange(event.target.checked)}
            />
          </label>
        </section>
      ) : null}
    </aside>
  )
}

export default SettingsPanel
