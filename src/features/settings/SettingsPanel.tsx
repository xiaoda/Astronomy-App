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

type SettingsToggleRowProps = {
  title: string
  checked: boolean
  onChange: (nextValue: boolean) => void
}

const stopPointerPropagation: PointerEventHandler<HTMLElement> = (event) => {
  event.stopPropagation()
}

const stopClickPropagation: MouseEventHandler<HTMLElement> = (event) => {
  event.stopPropagation()
}

function SettingsToggleRow({ title, checked, onChange }: SettingsToggleRowProps) {
  return (
    <label className="settings-item">
      <span className="settings-item-title">{title}</span>
      <span className="settings-switch">
        <input
          type="checkbox"
          role="switch"
          className="settings-switch-input"
          checked={checked}
          aria-label={title}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="settings-switch-track" aria-hidden="true">
          <span className="settings-switch-thumb" />
        </span>
      </span>
    </label>
  )
}

function SettingsPanel({
  isOpen,
  showQuote,
  isMusicEnabled,
  onToggleOpen,
  onShowQuoteChange,
  onMusicEnabledChange,
}: SettingsPanelProps) {
  const triggerLabel = isOpen ? '收起设置面板' : '打开设置面板'

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
        className={`settings-trigger${isOpen ? ' is-open' : ''}`}
        aria-expanded={isOpen}
        aria-controls="app-settings-panel"
        aria-label={triggerLabel}
        onClick={onToggleOpen}
      >
        <svg
          className="settings-trigger-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M9.47 4.86 9.12 3h5.76l-.35 1.86a7.75 7.75 0 0 1 1.4.82l1.67-.88 2.88 4.98-1.5 1.16c.1.34.18.7.24 1.06L21 13.35l-2.88 4.98-1.67-.88c-.44.32-.91.6-1.4.82l.35 1.86H9.12l.35-1.86a7.75 7.75 0 0 1-1.4-.82l-1.67.88L3.52 13.35 5 12.19c.06-.36.14-.72.24-1.06L3.52 9.97 6.4 4.99l1.67.88c.44-.32.91-.6 1.4-.82Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <circle cx="12" cy="12" r="2.75" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </button>

      {isOpen ? (
        <section id="app-settings-panel" className="settings-panel" aria-label="显示设置">
          <SettingsToggleRow
            title="显示文案"
            checked={showQuote}
            onChange={onShowQuoteChange}
          />
          <SettingsToggleRow
            title="背景音乐"
            checked={isMusicEnabled}
            onChange={onMusicEnabledChange}
          />
        </section>
      ) : null}
    </aside>
  )
}

export default SettingsPanel
