import { useState } from 'react'
import { PRIORITIES } from '../utils/analysisLogic'
import SectionCard from '../components/SectionCard'
import PrimaryButton from '../components/PrimaryButton'

/**
 * Priorities — Screen 3 of ResolvePath AI.
 * User selects which factors matter most for their decision.
 *
 * Props:
 *   selectedPriorities — array of selected priority keys
 *   onToggle           — handler(priorityKey) to add/remove a priority
 *   onNext             — handler to advance to next screen
 *   onBack             — handler to go back to previous screen
 */
function Priorities({ selectedPriorities, onToggle, onNext, onBack }) {
  const [error, setError] = useState('')

  const handleContinue = () => {
    if (selectedPriorities.length === 0) {
      setError('Please select at least one priority')
      return
    }
    setError('')
    onNext()
  }

  return (
    <div className="page-container">
      <h1 className="page-title">What matters most to you?</h1>
      <p className="page-description">
        Select the factors that are important in this decision. ResolvePath will
        evaluate your options against these priorities.
      </p>

      <SectionCard
        title="Select your priorities"
        description="Choose one or more factors. You can select multiple."
      >
        <div className="priority-count">
          <span>{selectedPriorities.length}</span> of {Object.keys(PRIORITIES).length} selected
        </div>
        <div className="priority-grid">
          {Object.entries(PRIORITIES).map(([key, { label, icon }]) => {
            const isSelected = selectedPriorities.includes(key)
            const chipClass = `priority-chip${isSelected ? ' priority-chip--selected' : ''}`

            return (
              <div
                key={key}
                className={chipClass}
                onClick={() => {
                  onToggle(key)
                  if (error) setError('')
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onToggle(key)
                    if (error) setError('')
                  }
                }}
              >
                <span className="priority-chip-icon">{icon}</span>
                <span className="priority-chip-label">{label}</span>
                {isSelected && <span className="priority-chip-check">&#10003;</span>}
              </div>
            )
          })}
        </div>

        {error && <span className="form-input-error" style={{ display: 'block', marginTop: '8px' }}>{error}</span>}
      </SectionCard>

      <div className="page-actions">
        <PrimaryButton onClick={onBack} variant="outline">
          Back
        </PrimaryButton>
        <PrimaryButton onClick={handleContinue} variant="primary">
          Continue
        </PrimaryButton>
      </div>
    </div>
  )
}

export default Priorities