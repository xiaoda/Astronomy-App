import type { MouseEventHandler, PointerEventHandler } from 'react'

type TrackOption = {
  label: string
  value: number
}

type SettingsPanelProps = {
  isOpen: boolean
  showQuote: boolean
  isMusicEnabled: boolean
  selectedTrackIndex: number
  trackOptions: TrackOption[]
  onToggleOpen: () => void
  onShowQuoteChange: (nextValue: boolean) => void
  onMusicEnabledChange: (nextValue: boolean) => void
  onTrackChange: (nextValue: number) => void
  onNextTrack: () => void
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
  selectedTrackIndex,
  trackOptions,
  onToggleOpen,
  onShowQuoteChange,
  onMusicEnabledChange,
  onTrackChange,
  onNextTrack,
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
          <label className="settings-item settings-item-block">
            <span>曲目</span>
            <select
              className="settings-select"
              value={selectedTrackIndex}
              onChange={(event) => onTrackChange(Number(event.target.value))}
            >
              {trackOptions.map((trackOption) => (
                <option key={trackOption.value} value={trackOption.value}>
                  {trackOption.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="settings-secondary-button"
            disabled={!isMusicEnabled}
            onClick={onNextTrack}
          >
            下一首
          </button>
        </section>
      ) : null}
    </aside>
  )
}

export default SettingsPanel
