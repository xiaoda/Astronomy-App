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
          <div className="settings-item">
            <span className="settings-item-title">显示文案</span>
            <div className="settings-radio-group" role="radiogroup" aria-label="显示文案">
              <label className={`settings-radio${showQuote ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="quote-visibility"
                  checked={showQuote}
                  onChange={() => onShowQuoteChange(true)}
                />
                <span className="settings-radio-dot" aria-hidden="true" />
                <span className="settings-radio-text">显示</span>
              </label>
              <label className={`settings-radio${!showQuote ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="quote-visibility"
                  checked={!showQuote}
                  onChange={() => onShowQuoteChange(false)}
                />
                <span className="settings-radio-dot" aria-hidden="true" />
                <span className="settings-radio-text">隐藏</span>
              </label>
            </div>
          </div>
          <div className="settings-item">
            <span className="settings-item-title">背景音乐</span>
            <div className="settings-radio-group" role="radiogroup" aria-label="背景音乐">
              <label className={`settings-radio${isMusicEnabled ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="background-music"
                  checked={isMusicEnabled}
                  onChange={() => onMusicEnabledChange(true)}
                />
                <span className="settings-radio-dot" aria-hidden="true" />
                <span className="settings-radio-text">开启</span>
              </label>
              <label className={`settings-radio${!isMusicEnabled ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="background-music"
                  checked={!isMusicEnabled}
                  onChange={() => onMusicEnabledChange(false)}
                />
                <span className="settings-radio-dot" aria-hidden="true" />
                <span className="settings-radio-text">关闭</span>
              </label>
            </div>
          </div>
        </section>
      ) : null}
    </aside>
  )
}

export default SettingsPanel
