import SectionCard from '../components/SectionCard'
import PrimaryButton from '../components/PrimaryButton'

/**
 * Recommendation — Screen 6 of ResolvePath AI.
 * Shows the final recommendation, tie state, or error state.
 *
 * Props:
 *   result         — analysis result object from analysisLogic
 *   onReset        — handler to reset and start a new analysis
 *   onAdjustRatings — handler to go back to Options screen to adjust ratings
 */
function Recommendation({ result, onReset, onAdjustRatings }) {
  // Insufficient data state
  if (!result || !result.isSuccessful) {
    return (
      <div className="page-container">
        <SectionCard variant="warning">
          <div className="error-state">
            <div className="error-state-icon">&#9888;</div>
            <div className="error-state-title">Analysis Could Not Be Completed</div>
            <div className="error-state-message">
              {result?.message || 'Not enough information was provided to generate a recommendation.'}
            </div>
          </div>
        </SectionCard>

        <div className="page-actions page-actions--center">
          <PrimaryButton onClick={onReset} variant="primary">
            Start New Analysis
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // Tie state — no clear recommendation
  if (result.isTie) {
    // Calculate total scores from real comparison data
    const totalA = result.comparison.reduce((sum, item) => sum + item.optionARating, 0)
    const totalB = result.comparison.reduce((sum, item) => sum + item.optionBRating, 0)

    return (
      <div className="page-container page-container--wide">
        <div className="tie-header">
          <div className="tie-title">No Clear Recommendation</div>
          <p className="tie-message">
            Based on your ratings, both options have the same overall priority
            alignment. The available information does not identify a stronger option.
          </p>
          <p className="tie-suggestion">
            This can happen when your ratings are balanced across priorities.
            Consider adjusting your ratings or adding more context to your decision.
          </p>
        </div>

        {/* Tie score comparison using real calculated totals */}
        <div className="tie-scores">
          <div className="tie-score-badge">
            <div className="tie-score-badge-label">{result.comparison[0] ? 'Option A' : 'Option A'}</div>
            <div className="tie-score-badge-number">{totalA}</div>
          </div>
          <div className="tie-equals">=</div>
          <div className="tie-score-badge">
            <div className="tie-score-badge-label">Option B</div>
            <div className="tie-score-badge-number">{totalB}</div>
          </div>
        </div>

        {/* Show comparison so user can see why it's a tie */}
        <SectionCard title="Priority-by-Priority Comparison" variant="info">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Option A</th>
                <th>Option B</th>
              </tr>
            </thead>
            <tbody>
              {result.comparison.map((item) => (
                <tr key={item.priority}>
                  <td>{item.label}</td>
                  <td>{item.optionARating}/5</td>
                  <td>{item.optionBRating}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <div className="page-actions page-actions--center" style={{ gap: '12px' }}>
          <PrimaryButton onClick={onAdjustRatings} variant="outline">
            Adjust Ratings
          </PrimaryButton>
          <PrimaryButton onClick={onReset} variant="primary">
            Start New Analysis
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // Success state — clear recommendation
  return (
    <div className="page-container page-container--wide">
      {/* Recommendation header with score circle */}
      <SectionCard variant="success">
        <div className="recommendation-header">
          <div className="recommendation-label">ResolvePath Recommendation</div>
          <div className="recommendation-option">{result.recommendedLabel}</div>

          <div className="recommendation-score-circle">
            <div className="recommendation-score-number">{result.matchScore}</div>
            <div className="recommendation-score-percent">%</div>
          </div>

          <div className="recommendation-score-label">
            Priority Alignment Score
          </div>

          <div className="recommendation-score-explanation">
            This score reflects how your ratings align with the recommended option.
            It is not a probability of success.
          </div>

          {/* Responsible AI — integrated inside the card */}
          <div className="responsible-ai-footer">
            <p className="responsible-ai-text">
              ResolvePath helps you compare your options. The final decision is always yours.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Reasons */}
      <SectionCard title="Key reasons">
        <div className="reasons-list">
          {result.reasons.map((reason, index) => (
            <div className="reason-item" key={index}>
              <span className="reason-icon">&#10003;</span>
              <span className="reason-text">
                <strong>{reason.label}:</strong> {reason.explanation}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Trade-off — only when the recommended option has a real disadvantage */}
      {result.tradeOff && !result.tradeOff.isNoTradeOff && (
        <SectionCard title="Main trade-off">
          <div className="tradeoff-item">
            <span className="tradeoff-icon">&#9888;</span>
            <span className="tradeoff-text">
              <strong>{result.tradeOff.label}:</strong> {result.tradeOff.explanation}
            </span>
          </div>
        </SectionCard>
      )}

      {/* No trade-off — recommended option scored equal or higher on all priorities */}
      {result.tradeOff && result.tradeOff.isNoTradeOff && (
        <SectionCard title="Trade-off analysis" variant="success">
          <div className="reason-item">
            <span className="reason-icon">&#10003;</span>
            <span className="reason-text">
              {result.tradeOff.explanation}
            </span>
          </div>
        </SectionCard>
      )}

      {/* Confirmation banner */}
      <div className="confirmation-banner">
        <span className="confirmation-banner-icon">&#10003;</span>
        <span className="confirmation-banner-text">Analysis completed successfully</span>
      </div>

      {/* Actions */}
      <div className="page-actions page-actions--center" style={{ marginTop: '24px', gap: '12px' }}>
        <PrimaryButton onClick={onAdjustRatings} variant="outline">
          Adjust Ratings
        </PrimaryButton>
        <PrimaryButton onClick={onReset} variant="primary">
          Start New Analysis
        </PrimaryButton>
      </div>
    </div>
  )
}

export default Recommendation