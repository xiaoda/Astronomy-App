import { useCallback, useEffect, useState } from 'react'

import quotePool from './quotePool'

const QUOTE_SWITCH_INTERVAL_MS = 7000
const FALLBACK_QUOTE = '你不需要赶路，先陪星光待一会儿。'

const bumpRevision = (currentRevision: number) => currentRevision + 1

function createShuffledQuoteOrder(quoteCount: number, previousLastQuoteIndex?: number) {
  const quoteOrder = Array.from({ length: quoteCount }, (_, index) => index)

  for (let currentIndex = quoteOrder.length - 1; currentIndex > 0; currentIndex -= 1) {
    const nextIndex = Math.floor(Math.random() * (currentIndex + 1))
    ;[quoteOrder[currentIndex], quoteOrder[nextIndex]] = [
      quoteOrder[nextIndex],
      quoteOrder[currentIndex],
    ]
  }

  if (
    quoteOrder.length > 1 &&
    previousLastQuoteIndex !== undefined &&
    quoteOrder[0] === previousLastQuoteIndex
  ) {
    ;[quoteOrder[0], quoteOrder[1]] = [quoteOrder[1], quoteOrder[0]]
  }

  return quoteOrder
}

function useQuoteRotation(isEnabled: boolean) {
  const [playbackState, setPlaybackState] = useState(() => ({
    quoteOrder: createShuffledQuoteOrder(quotePool.length),
    quotePosition: 0,
  }))
  const [quoteRevision, setQuoteRevision] = useState(0)
  const quoteIndex = playbackState.quoteOrder[playbackState.quotePosition] ?? 0

  const switchQuote = useCallback(() => {
    setPlaybackState((currentState) => {
      const isLastQuoteInRound =
        currentState.quotePosition >= currentState.quoteOrder.length - 1

      if (!isLastQuoteInRound) {
        return {
          ...currentState,
          quotePosition: currentState.quotePosition + 1,
        }
      }

      const lastShownQuoteIndex = currentState.quoteOrder[currentState.quoteOrder.length - 1]

      return {
        quoteOrder: createShuffledQuoteOrder(quotePool.length, lastShownQuoteIndex),
        quotePosition: 0,
      }
    })
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
