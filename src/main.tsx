import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type GameState = {
  biomass: number
  population: number
  mutations: number
  mutationLevel: number
}

const INITIAL_STATE: GameState = {
  biomass: 5,
  population: 1,
  mutations: 0,
  mutationLevel: 0,
}

const mutationCost = (level: number) => Math.floor(8 * Math.pow(1.3, level))

function App() {
  const [game, setGame] = useState<GameState>(() => {
    const saved = localStorage.getItem('evolutionary-empire-save')
    return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE
  })

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGame((current) => {
        const productionMultiplier = 1 + current.mutationLevel * 0.15
        const populationMultiplier = 1 + current.mutationLevel * 0.08

        return {
          ...current,
          biomass: current.biomass + 0.375 * productionMultiplier,
          population: Math.min(
            current.population + 0.02 * populationMultiplier,
            1_000_000,
          ),
        }
      })
    }, 250)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem('evolutionary-empire-save', JSON.stringify(game))
  }, [game])

  const nextMutationCost = useMemo(() => mutationCost(game.mutationLevel), [game.mutationLevel])
  const biomassPerSecond = 1.5 * (1 + game.mutationLevel * 0.15)

  const buyMutation = () => {
    if (game.biomass < nextMutationCost) return

    setGame((current) => ({
      ...current,
      biomass: current.biomass - nextMutationCost,
      mutations: current.mutations + 1,
      mutationLevel: current.mutationLevel + 1,
    }))
  }

  const reset = () => {
    if (!window.confirm('Reset this evolutionary experiment?')) return
    localStorage.removeItem('evolutionary-empire-save')
    setGame(INITIAL_STATE)
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">VERSION 0.1 · THE PETRI DISH</p>
        <h1>Evolutionary Empire</h1>
        <p className="subtitle">Guide a microscopic population from its first moments toward complex life.</p>
      </header>

      <section className="stats" aria-label="Colony statistics">
        <article className="stat-card">
          <span>Biomass</span>
          <strong>{game.biomass.toFixed(1)}</strong>
          <small>+{biomassPerSecond.toFixed(1)} / second</small>
        </article>
        <article className="stat-card">
          <span>Population</span>
          <strong>{Math.floor(game.population).toLocaleString()}</strong>
          <small>organisms</small>
        </article>
        <article className="stat-card">
          <span>Mutations</span>
          <strong>{game.mutations}</strong>
          <small>evolutionary improvements</small>
        </article>
      </section>

      <section className="game-panel">
        <div className="organism">
          <div className="cell" aria-label="Your microscopic organism" />
          <p>Primitive Cell</p>
          <span>Your first life-form is adapting.</span>
        </div>

        <div className="actions">
          <div>
            <p className="section-label">EVOLUTION</p>
            <h2>Encourage Mutation</h2>
            <p className="description">
              Spend biomass to introduce a beneficial mutation. Each mutation makes your colony more productive.
            </p>
          </div>
          <button onClick={buyMutation} disabled={game.biomass < nextMutationCost}>
            <span>Mutation {game.mutationLevel + 1}</span>
            <strong>{nextMutationCost} Biomass</strong>
          </button>
        </div>
      </section>

      <footer>
        <span>Autosaving locally</span>
        <button className="reset" onClick={reset}>Reset experiment</button>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
