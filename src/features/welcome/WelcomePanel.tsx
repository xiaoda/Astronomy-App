import './WelcomePanel.css'

type WelcomePanelProps = {
  showQuote: boolean
  currentQuote: string
  quoteRevision: number
}

const formatQuoteForDisplay = (quote: string) => {
  const commaIndex = quote.indexOf('，')

  if (commaIndex === -1) {
    return [quote]
  }

  return [quote.slice(0, commaIndex), quote.slice(commaIndex + 1)]
}

function WelcomePanel({ showQuote, currentQuote, quoteRevision }: WelcomePanelProps) {
  const quoteLines = formatQuoteForDisplay(currentQuote)

  return (
    <section className="welcome-panel">
      {showQuote ? (
        <>
          <p
            key={quoteRevision}
            className={`welcome-copy quote-fade ${quoteLines.length > 1 ? 'is-two-line' : 'is-one-line'}`}
          >
            {quoteLines.map((line) => (
              <span key={line} className="welcome-copy-line">
                {line}
              </span>
            ))}
          </p>
          <p className="gesture-hint">长按 1 秒触发流星</p>
        </>
      ) : null}
    </section>
  )
}

export default WelcomePanel
