import { useState } from 'react'
import SectionCard from '../components/SectionCard'
import FormInput from '../components/FormInput'
import PrimaryButton from '../components/PrimaryButton'

/**
 * DecisionDetails — Screen 2 of ResolvePath AI.
 * Collects the decision question and optional context.
 *
 * Props:
 *   decision  — current decision string
 *   context   — current context string
 *   onUpdate  — handler(field, value) to update decision or context
 *   onNext    — handler to advance to next screen
 *   onBack    — handler to go back to previous screen
 */
function DecisionDetails({ decision, context, onUpdate, onNext, onBack }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!decision.trim()) {
      newErrors.decision = 'Please describe your decision'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      onNext()
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">What decision are you facing?</h1>
      <p className="page-description">
        Describe the decision you want to evaluate. ResolvePath will help you
        compare your options based on what matters most to you.
      </p>

      <SectionCard>
        <FormInput
          label="Decision question"
          value={decision}
          onChange={(val) => {
            onUpdate('decision', val)
            setErrors((prev) => ({ ...prev, decision: '' }))
          }}
          placeholder='e.g. "Should I accept this job offer?"'
          type="text"
          error={errors.decision}
          required
        />
        <FormInput
          label="Context (optional)"
          value={context}
          onChange={(val) => onUpdate('context', val)}
          placeholder="Add any background details that might help frame your decision..."
          type="textarea"
          helperText="This is optional and will be used to provide context for your analysis."
        />

        <div className="data-notice">
          <span className="data-notice-icon">&#9432;</span>
          <span>Your information is kept in the browser for this demonstration and is not sent to a server.</span>
        </div>
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

export default DecisionDetails