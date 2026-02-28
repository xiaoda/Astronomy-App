type WelcomePanelProps = {
  showQuote: boolean
  currentQuote: string
  quoteRevision: number
}

function WelcomePanel({ showQuote, currentQuote, quoteRevision }: WelcomePanelProps) {
  return (
    <section className="welcome-panel">
      <h1 className="welcome-title">Astronomy App</h1>
      {showQuote ? (
        <>
          <p key={quoteRevision} className="welcome-copy quote-fade">
            {currentQuote}
          </p>
          <p className="gesture-hint">轻触切换文案，长按 1 秒触发流星。</p>
        </>
      ) : null}
    </section>
  )
}

export default WelcomePanel
