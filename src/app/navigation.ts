const DEFAULT_PATH = '/'

const normalizeHashPath = (hash: string) => {
  const trimmedHash = hash.replace(/^#/, '')

  if (!trimmedHash) {
    return DEFAULT_PATH
  }

  return trimmedHash.startsWith('/') ? trimmedHash : `/${trimmedHash}`
}

export const getCurrentPath = () => normalizeHashPath(window.location.hash)

export const navigateTo = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const nextHash = `#${normalizedPath}`

  if (window.location.hash === nextHash) {
    return
  }

  window.location.hash = nextHash
}

export { DEFAULT_PATH }
