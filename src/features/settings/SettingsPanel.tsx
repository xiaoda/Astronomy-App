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
