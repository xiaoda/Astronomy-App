import { useEffect, useState } from 'react'

import SceneHubPage from '../pages/scene-hub/SceneHubPage'
import HomeScene from '../scenes/home/HomeScene'
import { getSceneByPath } from '../scenes/registry'
import { DEFAULT_PATH, getCurrentPath } from './navigation'

const useHashPath = () => {
  const [path, setPath] = useState(getCurrentPath)

  useEffect(() => {
    const syncPath = () => {
      setPath(getCurrentPath())
    }

    if (!window.location.hash) {
      window.location.hash = '#/'
    }

    window.addEventListener('hashchange', syncPath)

    return () => {
      window.removeEventListener('hashchange', syncPath)
    }
  }, [])

  return path
}

function AppRouter() {
  const path = useHashPath()

  if (path === DEFAULT_PATH) {
    return <SceneHubPage />
  }

  const scene = getSceneByPath(path)

  if (!scene) {
    return <SceneHubPage />
  }

  if (scene.id === 'home') {
    return <HomeScene />
  }

  return <SceneHubPage />
}

export default AppRouter
