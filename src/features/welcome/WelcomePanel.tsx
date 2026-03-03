import './WelcomePanel.css'

type WelcomePanelProps = {
  showQuote: boolean
  currentQuote: string
  quoteRevision: number
}

function WelcomePanel({ showQuote, currentQuote, quoteRevision }: WelcomePanelProps) {
  return (
    <section className="welcome-panel">
      {showQuote ? (
        <>
          <p key={quoteRevision} className="welcome-copy quote-fade">
            {currentQuote}
          </p>
          <p className="gesture-hint">长按 1 秒触发流星。</p>
        </>
      ) : null}
    </section>
  )
}

export default WelcomePanel
