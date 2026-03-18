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

type QuotePhase = 'steady' | 'fading-in' | 'fading-out'

const QUOTE_FADE_DURATION_MS = 1300

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
  const [displayedQuote, setDisplayedQuote] = useState<DisplayQuote>({
    text: currentQuote,
    revision: quoteRevision,
  })
  const [pendingQuote, setPendingQuote] = useState<DisplayQuote | null>(null)
  const [quotePhase, setQuotePhase] = useState<QuotePhase>('fading-in')

  useEffect(() => {
    if (quoteRevision === displayedQuote.revision || pendingQuote?.revision === quoteRevision) {
      return
    }

    setPendingQuote({
      text: currentQuote,
      revision: quoteRevision,
    })
    setQuotePhase('fading-out')
  }, [currentQuote, displayedQuote.revision, pendingQuote?.revision, quoteRevision])

  useEffect(() => {
    if (quotePhase !== 'fading-out' || !pendingQuote) {
      return
    }

    const timerId = window.setTimeout(() => {
      setDisplayedQuote(pendingQuote)
      setPendingQuote(null)
      setQuotePhase('fading-in')
    }, QUOTE_FADE_DURATION_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [pendingQuote, quotePhase])

  useEffect(() => {
    if (quotePhase !== 'fading-in') {
      return
    }

    const timerId = window.setTimeout(() => {
      setQuotePhase('steady')
    }, QUOTE_FADE_DURATION_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [displayedQuote.revision, quotePhase])

  const displayedQuoteLines = formatQuoteForDisplay(displayedQuote.text)
  const quoteAnimationClassName =
    quotePhase === 'fading-out'
      ? 'quote-fade-out'
      : quotePhase === 'fading-in'
        ? 'quote-fade-in'
        : ''

  return (
    <section className="welcome-panel">
      {showQuote ? (
        <>
          <div className="welcome-copy-shell" aria-live="polite">
            <p
              key={displayedQuote.revision}
              className={`${getQuoteClassName(displayedQuoteLines)} ${quoteAnimationClassName}`.trim()}
            >
              {displayedQuoteLines.map((line, index) => (
                <span
                  key={`${displayedQuote.revision}-${index}-${line}`}
                  className="welcome-copy-line"
                >
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
