import './SceneHubPage.css'

import { navigateTo } from '../../app/navigation'
import { sceneRegistry } from '../../scenes/registry'

function SceneHubPage() {
  return (
    <main className="scene-hub-page" aria-label="场景选择">
      <div className="scene-hub-backdrop" aria-hidden="true" />
      <section className="scene-hub-hero">
        <p className="scene-hub-kicker">Astronomy App</p>
        <h1 className="scene-hub-title">选择一个沉浸场景</h1>
        <p className="scene-hub-description">
          每个场景都可以拥有独立的氛围、交互、文案与音效。先从一个入口进入，再慢慢扩展成一整组宇宙体验。
        </p>
      </section>
      <section className="scene-hub-grid" aria-label="可进入场景">
        {sceneRegistry.map((scene) => (
          <article key={scene.id} className="scene-card">
            <div className="scene-card-glow" aria-hidden="true" />
            <p className="scene-card-tag">{scene.tagline}</p>
            <h2 className="scene-card-title">{scene.title}</h2>
            <p className="scene-card-description">{scene.description}</p>
            <button
              type="button"
              className="scene-card-button"
              onClick={() => navigateTo(scene.path)}
            >
              进入场景
            </button>
          </article>
        ))}
      </section>
    </main>
  )
}

export default SceneHubPage
