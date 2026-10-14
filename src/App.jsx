import { useState } from 'react'
import './App.css'

// Pages
import Login from './pages/Login'
import DecisionDetails from './pages/DecisionDetails'
import Priorities from './pages/Priorities'
import Options from './pages/Options'
import Analysis from './pages/Analysis'
import Recommendation from './pages/Recommendation'

/**
 * App.jsx — ResolvePath AI state orchestrator.
 *
 * Owns all application state and passes it to page components as props.
 * Handles navigation between screens and renders the progress indicator.
 *
 * Data flow: App.jsx → Page Component → Reusable Component (FormInput, PrimaryButton, SectionCard)
 */

// Progress step definitions
const PROGRESS_STEPS = [
  { key: 'decision', label: 'Decision' },
  { key: 'priorities', label: 'Priorities' },
  { key: 'options', label: 'Options' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'recommendation', label: 'Result' },
]

// Screen order for navigation
const SCREEN_ORDER = ['login', 'decision', 'priorities', 'options', 'analysis', 'recommendation']

function App() {
  // --- Application State ---
  const [currentScreen, setCurrentScreen] = useState('login')
  const [appData, setAppData] = useState({
    email: '',
    decision: '',
    context: '',
    priorities: [],
    optionA: '',
    optionB: '',
    ratings: {},
  })
  const [analysisResult, setAnalysisResult] = useState(null)

  // --- Handler Functions ---

  const handleLogin = (email) => {
    setAppData((prev) => ({ ...prev, email }))
    setCurrentScreen('decision')
  }

  const handleLogout = () => {
    setAppData({
      email: '',
      decision: '',
      context: '',
      priorities: [],
      optionA: '',
      optionB: '',
      ratings: {},
    })
    setAnalysisResult(null)
    setCurrentScreen('login')
  }

  const updateDecision = (field, value) => {
    setAppData((prev) => ({ ...prev, [field]: value }))
  }

  const togglePriority = (priorityKey) => {
    setAppData((prev) => {
      const current = prev.priorities
      const isSelected = current.includes(priorityKey)

      let newPriorities
      let newRatings

      if (isSelected) {
        // Remove priority and its ratings
        newPriorities = current.filter((p) => p !== priorityKey)
        const { [priorityKey]: _, ...rest } = prev.ratings
        newRatings = rest
      } else {
        // Add priority with empty ratings
        newPriorities = [...current, priorityKey]
        newRatings = {
          ...prev.ratings,
          [priorityKey]: { optionA: 0, optionB: 0 },
        }
      }

      return { ...prev, priorities: newPriorities, ratings: newRatings }
    })
  }

  const updateOption = (field, value) => {
    setAppData((prev) => ({ ...prev, [field]: value }))
  }

  const updateRating = (priority, option, value) => {
    setAppData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [priority]: {
          ...prev.ratings[priority],
          [option]: value,
        },
      },
    }))
  }

  const navigateTo = (screen) => {
    setCurrentScreen(screen)
  }

  const navigateForward = () => {
    const idx = SCREEN_ORDER.indexOf(currentScreen)
    if (idx < SCREEN_ORDER.length - 1) {
      setCurrentScreen(SCREEN_ORDER[idx + 1])
    }
  }

  const navigateBack = () => {
    const idx = SCREEN_ORDER.indexOf(currentScreen)
    if (idx > 0) {
      setCurrentScreen(SCREEN_ORDER[idx - 1])
    }
  }

  const resetDecision = () => {
    setAppData((prev) => ({
      ...prev,
      decision: '',
      context: '',
      priorities: [],
      optionA: '',
      optionB: '',
      ratings: {},
    }))
    setAnalysisResult(null)
    setCurrentScreen('decision')
  }

  const adjustRatings = () => {
    setAnalysisResult(null)
    setCurrentScreen('options')
  }

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result)
    setCurrentScreen('recommendation')
  }

  // --- Progress Indicator ---

  const renderProgressIndicator = () => {
    // Only show on screens after login
    if (currentScreen === 'login') return null

    const currentIdx = SCREEN_ORDER.indexOf(currentScreen)

    return (
      <div className="progress-indicator">
        {PROGRESS_STEPS.map((step, index) => {
          const stepScreenIndex = index + 1 // +1 because login is index 0
          let status = 'upcoming'
          if (stepScreenIndex < currentIdx) status = 'completed'
          else if (stepScreenIndex === currentIdx) status = 'active'

          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && (
                <div className={`progress-connector progress-connector--${status === 'upcoming' && index >= currentIdx - 1 ? 'upcoming' : 'completed'}`} />
              )}
              <div className="progress-step">
                <div className={`progress-step-circle progress-step-circle--${status}`}>
                  {status === 'completed' ? '\u2713' : index + 1}
                </div>
                <span className={`progress-step-label progress-step-label--${status}`}>
                  {step.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // --- Screen Renderer ---

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />

      case 'decision':
        return (
          <DecisionDetails
            decision={appData.decision}
            context={appData.context}
            onUpdate={updateDecision}
            onNext={navigateForward}
            onBack={() => handleLogout()}
          />
        )

      case 'priorities':
        return (
          <Priorities
            selectedPriorities={appData.priorities}
            onToggle={togglePriority}
            onNext={navigateForward}
            onBack={navigateBack}
          />
        )

      case 'options':
        return (
          <Options
            optionA={appData.optionA}
            optionB={appData.optionB}
            priorities={appData.priorities}
            ratings={appData.ratings}
            onUpdate={updateOption}
            onRate={updateRating}
            onNext={navigateForward}
            onBack={navigateBack}
          />
        )

      case 'analysis':
        return (
          <Analysis
            appData={appData}
            onComplete={handleAnalysisComplete}
          />
        )

      case 'recommendation':
        return (
          <Recommendation
            result={analysisResult}
            onReset={resetDecision}
            onAdjustRatings={adjustRatings}
          />
        )

      default:
        return <Login onLogin={handleLogin} />
    }
  }

  // --- Main Render ---

  // Login screen has its own full-page layout
  if (currentScreen === 'login') {
    return renderScreen()
  }

  return (
    <div className="app-layout">
      {/* Header — visible on all screens after login */}
      <header className="app-header">
        <div className="app-logo">ResolvePath</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="app-header-user">{appData.email}</span>
          <button className="app-header-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {renderProgressIndicator()}
        {renderScreen()}
      </main>
    </div>
  )
}

export default App