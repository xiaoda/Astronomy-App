import { useEffect, useState } from 'react'

import './WelcomePanel.css'

type WelcomePanelProps = {
  showQuote: boolean
  currentQuote: string
  quoteRevision: number
}

type DisplayQuote = {
  text: string
  revision: number
}

const QUOTE_TRANSITION_MS = 2600

const formatQuoteForDisplay = (quote: string) => {
  const commaIndex = quote.indexOf('，')

  if (commaIndex === -1) {
    return [quote]
  }

  return [quote.slice(0, commaIndex), quote.slice(commaIndex + 1)]
}

const getQuoteClassName = (quoteLines: string[]) =>
  `welcome-copy ${quoteLines.length > 1 ? 'is-two-line' : 'is-one-line'}`

function WelcomePanel({ showQuote, currentQuote, quoteRevision }: WelcomePanelProps) {
  const [activeQuote, setActiveQuote] = useState<DisplayQuote>({
    text: currentQuote,
    revision: quoteRevision,
  })
  const [leavingQuote, setLeavingQuote] = useState<DisplayQuote | null>(null)

  useEffect(() => {
    if (quoteRevision === activeQuote.revision) {
      return
    }

    setLeavingQuote(activeQuote)
    setActiveQuote({
      text: currentQuote,
      revision: quoteRevision,
    })

    const timerId = window.setTimeout(() => {
      setLeavingQuote(null)
    }, QUOTE_TRANSITION_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [activeQuote, currentQuote, quoteRevision])

  const activeQuoteLines = formatQuoteForDisplay(activeQuote.text)
  const leavingQuoteLines = leavingQuote ? formatQuoteForDisplay(leavingQuote.text) : null
  const leavingQuoteRevision = leavingQuote?.revision ?? -1

  return (
    <section className="welcome-panel">
      {showQuote ? (
        <>
          <div className="welcome-copy-shell" aria-live="polite">
            {leavingQuoteLines ? (
              <p className={`${getQuoteClassName(leavingQuoteLines)} quote-fade-out`}>
                {leavingQuoteLines.map((line, index) => (
                  <span
                    key={`${leavingQuoteRevision}-${index}-${line}`}
                    className="welcome-copy-line"
                  >
                    {line}
                  </span>
                ))}
              </p>
            ) : null}
            <p
              key={activeQuote.revision}
              className={`${getQuoteClassName(activeQuoteLines)} quote-fade-in`}
            >
              {activeQuoteLines.map((line, index) => (
                <span key={`${activeQuote.revision}-${index}-${line}`} className="welcome-copy-line">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <p className="gesture-hint">长按 1 秒触发流星</p>
        </>
      ) : null}
    </section>
  )
}

export default WelcomePanel
