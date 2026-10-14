import { useState } from 'react'
import { PRIORITIES } from '../utils/analysisLogic'
import SectionCard from '../components/SectionCard'
import FormInput from '../components/FormInput'
import PrimaryButton from '../components/PrimaryButton'

/**
 * Options — Screen 4 of ResolvePath AI.
 * User enters two options and rates each against selected priorities (1–5).
 *
 * Props:
 *   optionA    — Option A name string
 *   optionB    — Option B name string
 *   priorities — array of selected priority keys
 *   ratings    — { [priorityKey]: { optionA: number, optionB: number } }
 *   onUpdate   — handler(field, value) to update optionA or optionB name
 *   onRate     — handler(priority, option, value) to set a rating
 *   onNext     — handler to advance to next screen
 *   onBack     — handler to go back to previous screen
 */
function Options({ optionA, optionB, priorities, ratings, onUpdate, onRate, onNext, onBack }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!optionA.trim()) {
      newErrors.optionA = 'Please enter Option A'
    }
    if (!optionB.trim()) {
      newErrors.optionB = 'Please enter Option B'
    }


    // Check all ratings are valid for every selected priority
    for (const priority of priorities) {
      const r = ratings[priority]

      if (
        !r ||
        !Number.isInteger(r.optionA) ||
        !Number.isInteger(r.optionB) ||
        r.optionA < 1 ||
        r.optionA > 5 ||
        r.optionB < 1 ||
        r.optionB > 5
      ) {
        newErrors.ratings =
          'Please select a rating from 1 to 5 for both options under every priority.'
        break
      }
    }


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAnalyse = () => {
    if (validate()) {
      onNext()
    }
  }

  const optionALabel = optionA.trim() || 'Option A'
  const optionBLabel = optionB.trim() || 'Option B'

  /**
   * Determine the CSS class for a rating dot based on its value
   * relative to the selected value. Dots up to and including the
   * selected value get a filled appearance; the selected dot itself
   * gets a stronger selected style.
   */
  const getDotClass = (val, selectedVal) => {
    if (val === selectedVal) return 'rating-dot rating-dot--selected'
    if (selectedVal > 0 && val < selectedVal) return 'rating-dot rating-dot--filled'
    return 'rating-dot'
  }

  return (
    <div className="page-container page-container--wide">
      <h1 className="page-title">What are your options?</h1>
      <p className="page-description">
        Enter the two alternatives you are considering, then rate how well each
        option performs on your selected priorities.
      </p>

      <SectionCard title="Your options" description="Name the two alternatives you want to compare.">
        <FormInput
          label="Option A"
          value={optionA}
          onChange={(val) => {
            onUpdate('optionA', val)
            setErrors((prev) => ({ ...prev, optionA: '' }))
          }}
          placeholder='e.g. "Accept the job"'
          type="text"
          error={errors.optionA}
          required
        />
        <FormInput
          label="Option B"
          value={optionB}
          onChange={(val) => {
            onUpdate('optionB', val)
            setErrors((prev) => ({ ...prev, optionB: '' }))
          }}
          placeholder='e.g. "Decline the job"'
          type="text"
          error={errors.optionB}
          required
        />
      </SectionCard>

      <SectionCard
        title="Rate each option"
        description="How well does each option perform on the priorities you selected?"
      >
        {/* Rating scale legend */}
        <div className="rating-legend">
          <span>1 = Poor</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5 = Excellent</span>
        </div>

        {/* Column headers */}
        <div className="rating-row" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>
          <div className="rating-priority-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Priority
          </div>
          <div className="rating-group rating-group--a">
            <span className="rating-group-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {optionALabel}
            </span>
          </div>
          <div className="rating-group rating-group--b">
            <span className="rating-group-label" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {optionBLabel}
            </span>
          </div>
        </div>

        {priorities.map((priorityKey) => {
          const meta = PRIORITIES[priorityKey]
          const currentRating = ratings[priorityKey] || { optionA: 0, optionB: 0 }

          return (
            <div className="rating-row" key={priorityKey}>
              <div className="rating-priority-label">
                {meta?.icon} {meta?.label || priorityKey}
              </div>
              <div className="rating-group rating-group--a">
                <div className="rating-dots">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <div
                      key={val}
                      className={getDotClass(val, currentRating.optionA)}
                      onClick={() => onRate(priorityKey, 'optionA', val)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onRate(priorityKey, 'optionA', val)
                        }
                      }}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rating-group rating-group--b">
                <div className="rating-dots">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <div
                      key={val}
                      className={getDotClass(val, currentRating.optionB)}
                      onClick={() => onRate(priorityKey, 'optionB', val)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onRate(priorityKey, 'optionB', val)
                        }
                      }}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {errors.ratings && (
          <span className="form-input-error" style={{ display: 'block', marginTop: '12px' }}>
            {errors.ratings}
          </span>
        )}
      </SectionCard>

      <div className="page-actions">
        <PrimaryButton onClick={onBack} variant="outline">
          Back
        </PrimaryButton>
        <PrimaryButton onClick={handleAnalyse} variant="primary">
          Analyse Decision
        </PrimaryButton>
      </div>
    </div>
  )
}

export default Options