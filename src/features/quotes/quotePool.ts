import quotes from '../../assets/quotes.json'

const quotePool = quotes as string[]

const getRandomIndex = (max: number) => Math.floor(Math.random() * max)

export const getInitialQuoteIndex = () => getRandomIndex(quotePool.length)

export const getNextQuoteIndex = (currentIndex: number) => {
  if (quotePool.length <= 1) {
    return currentIndex
  }

  let nextIndex = currentIndex

  while (nextIndex === currentIndex) {
    nextIndex = getRandomIndex(quotePool.length)
  }

  return nextIndex
}

export default quotePool
