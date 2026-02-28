import { useCallback, useEffect, useState } from 'react'

import quotePool, { getInitialQuoteIndex, getNextQuoteIndex } from './quotePool'

const QUOTE_SWITCH_INTERVAL_MS = 7000
const FALLBACK_QUOTE = '你不需要赶路，先陪星光待一会儿。'

const bumpRevision = (currentRevision: number) => currentRevision + 1

function useQuoteRotation(isEnabled: boolean) {
  const [quoteIndex, setQuoteIndex] = useState(() => getInitialQuoteIndex())
  const [quoteRevision, setQuoteRevision] = useState(0)

  const switchQuote = useCallback(() => {
    setQuoteIndex((currentIndex) => getNextQuoteIndex(currentIndex))
    setQuoteRevision(bumpRevision)
  }, [])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    const timerId = window.setInterval(() => {
      switchQuote()
    }, QUOTE_SWITCH_INTERVAL_MS)

    return () => {
      window.clearInterval(timerId)
    }
  }, [isEnabled, switchQuote])

  return {
    currentQuote: quotePool[quoteIndex] ?? FALLBACK_QUOTE,
    quoteRevision,
    switchQuote,
  }
}

export default useQuoteRotation
