export type SceneDefinition = {
  id: string
  title: string
  tagline: string
  description: string
  path: string
}

export const sceneRegistry: SceneDefinition[] = [
  {
    id: 'home',
    title: '静谧星空',
    tagline: '当前可进入',
    description: '星空、流星、文案与背景音乐共同构成的第一个沉浸场景。',
    path: '/scene/home',
  },
]

export const getSceneByPath = (path: string) =>
  sceneRegistry.find((scene) => scene.path === path) ?? null
