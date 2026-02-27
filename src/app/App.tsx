import './App.css'
import StarfieldCanvas from '../features/starfield/StarfieldCanvas'

const introText = '欢迎来到宁静星空。轻触任意位置，即可开始体验。'

function App() {
  return (
    <main className="app-shell" aria-label="Astronomy calm experience">
      <StarfieldCanvas />
      <div className="nebula-layer" aria-hidden="true" />
      <section className="welcome-panel">
        <h1 className="welcome-title">Astronomy App</h1>
        <p className="welcome-copy">{introText}</p>
      </section>
    </main>
  )
}

export default App
