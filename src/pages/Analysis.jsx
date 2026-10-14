import { useState, useEffect } from 'react'
import { PRIORITIES } from '../utils/analysisLogic'
import SectionCard from '../components/SectionCard'
import PrimaryButton from '../components/PrimaryButton'
import RadialBarChart from '../components/RadialBarChart'
import '../components/RadialBarChart.css'

/**
 * Analysis — Screen 5 of ResolvePath AI.
 * Shows staged processing animation, summary badges, and a comparison table with bar charts.
 *
 * Props:
 *   appData    — full application data object (read-only)
 *   onComplete — handler(result) called with the analysis result
 */
function Analysis({ appData, onComplete }) {
  const [visibleStages, setVisibleStages] = useState(0)
  const [showComparison, setShowComparison] = useState(false)
  const [result, setResult] = useState(null)

  const stages = [
    { text: 'Decision captured', detail: appData.decision },
    { text: 'Priorities analysed', detail: `${appData.priorities.length} factor${appData.priorities.length !== 1 ? 's' : ''} identified` },
    { text: 'Options compared', detail: `"${appData.optionA}" vs "${appData.optionB}"` },
    { text: 'Recommendation prepared', detail: null },
  ]

  // Staged animation — reveal one stage at a time
  useEffect(() => {
    const timers = []

    for (let i = 1; i <= stages.length; i++) {
      timers.push(
        setTimeout(() => {
          setVisibleStages(i)
        }, i * 800)
      )
    }

    // After the processing stages, request analysis from FastAPI
    timers.push(
      setTimeout(async () => {
        try {
          const ratingsA = {}
          const ratingsB = {}

          for (const priority of appData.priorities) {
            ratingsA[priority] = appData.ratings[priority]?.optionA
            ratingsB[priority] = appData.ratings[priority]?.optionB
          }

          const response = await fetch('https://resolvepath-ai-api.onrender.com/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: appData.email,
              decision_question: appData.decision,
              option_a: appData.optionA,
              option_b: appData.optionB,
              ratings_a: ratingsA,
              ratings_b: ratingsB,
            }),
          })


          if (!response.ok) {
            const errorText = await response.text()
            console.error('API response:', response.status, errorText)
            throw new Error(
              `API error ${response.status}: ${errorText}`
            )
          }


          const apiResult = await response.json()

          // Adapt the API response to the format used by the existing UI
          const comparison = apiResult.priority_comparison.map((item) => ({
            priority: item.priority,
            label: PRIORITIES[item.priority]?.label || item.priority,
            optionARating: item.option_a,
            optionBRating: item.option_b,
          }))


          const isTie = apiResult.score_a === apiResult.score_b
          const recommendedIsA = apiResult.score_a > apiResult.score_b

          const analysisResult = {
            isSuccessful: true,
            isTie,
            winner: apiResult.winner,

            recommendedLabel: isTie
              ? 'No clear recommendation'
              : `Your ratings favour: ${recommendedIsA
                ? appData.optionA
                : appData.optionB
              }`,

            matchScore: isTie
              ? Math.round((apiResult.percentage_a + apiResult.percentage_b) / 2)
              : recommendedIsA
                ? apiResult.percentage_a
                : apiResult.percentage_b,

            matchScoreExplanation:
              'This score is based on your ratings and is not a prediction of success.',

            comparison,

            reasons: (() => {
              if (isTie) {
                return [{
                  label: 'Overall score',
                  explanation:
                    'Both options received the same total score based on your ratings.',
                }]
              }

              const winningDifferences = comparison
                .filter((item) =>
                  recommendedIsA
                    ? item.optionARating > item.optionBRating
                    : item.optionBRating > item.optionARating
                )
                .sort((a, b) =>
                  Math.abs(b.optionARating - b.optionBRating) -
                  Math.abs(a.optionARating - a.optionBRating)
                )

              if (winningDifferences.length === 0) {
                return [{
                  label: 'Overall score',
                  explanation:
                    `${apiResult.winner} received the higher total score based on your ratings.`,
                }]
              }

              return winningDifferences.slice(0, 3).map((item) => ({
                label: item.label,
                explanation: `${recommendedIsA ? 'Option A' : 'Option B'
                  } scored ${recommendedIsA ? item.optionARating : item.optionBRating
                  }/5 for this priority, compared with ${recommendedIsA ? item.optionBRating : item.optionARating
                  }/5 for the other option.`,
              }))
            })(),

            tradeOff: null,
            disclaimer: apiResult.disclaimer,
          }


          setResult(analysisResult)
          setShowComparison(true)
        } catch (error) {
          console.error('ResolvePath API error:', error)
          setResult({
            isSuccessful: false,
            message:
              error.message ||
              'Could not connect to the analysis service. Please try again.',
          })
          setShowComparison(true)
        }
      }, stages.length * 800 + 400)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleViewRecommendation = () => {
    onComplete(result)
  }

  // Calculate total scores from the result's comparison data (real values)
  const totalA = result?.comparison
    ? result.comparison.reduce((sum, item) => sum + item.optionARating, 0)
    : 0
  const totalB = result?.comparison
    ? result.comparison.reduce((sum, item) => sum + item.optionBRating, 0)
    : 0
  const maxPossible = appData.priorities.length * 5
  const scoreA = maxPossible > 0 ? Math.round((totalA / maxPossible) * 100) : 0
  const scoreB = maxPossible > 0 ? Math.round((totalB / maxPossible) * 100) : 0

  return (
    <div className="page-container page-container--wide">
      <h1 className="page-title">Analysing your decision</h1>
      <p className="page-description">
        ResolvePath is processing your inputs to compare your options.
      </p>

      {/* Processing stages */}
      <SectionCard title="Analysis progress">
        <div className="analysis-stages">
          {stages.map((stage, index) => {
            if (index >= visibleStages) return null

            return (
              <div
                className="analysis-stage"
                key={index}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="analysis-stage-icon">&#10003;</div>
                <span className="analysis-stage-text">{stage.text}</span>
                {stage.detail && (
                  <span className="analysis-stage-detail">— {stage.detail}</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="analysis-transparency">
          This MVP uses sample scoring logic based on your ratings and does not make predictions.
        </div>
      </SectionCard>

      {/* Decision overview — radial chart (21st.dev adapted component) */}
      {showComparison && result && result.isSuccessful && (
        <SectionCard title="Decision Overview">
          <RadialBarChart
            data={[
              { name: appData.optionA, value: scoreA, fill: '#6366F1' },
              { name: appData.optionB, value: scoreB, fill: '#10B981' },
              { name: 'Overall Alignment', value: result.matchScore, fill: '#4F46E5' },
            ]}
          />
        </SectionCard>
      )}

      {/* Summary score badges + Comparison table — shown after processing */}
      {showComparison && result && result.isSuccessful && (
        <SectionCard title="Priority-by-Priority Comparison" variant="info">
          {/* Summary score badges using real calculated totals */}
          <div className="analysis-summary">
            <div className="analysis-summary-badge analysis-summary-badge--a">
              <div className="analysis-summary-label">{appData.optionA}</div>
              <div className="analysis-summary-score">{totalA}</div>
              <div className="analysis-summary-max">out of {maxPossible}</div>
            </div>
            <div className="analysis-summary-badge analysis-summary-badge--b">
              <div className="analysis-summary-label">{appData.optionB}</div>
              <div className="analysis-summary-score">{totalB}</div>
              <div className="analysis-summary-max">out of {maxPossible}</div>
            </div>
          </div>

          {/* Comparison table with bar chart visualization */}
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>{appData.optionA}</th>
                <th>{appData.optionB}</th>
              </tr>
            </thead>
            <tbody>
              {result.comparison.map((item) => (
                <tr key={item.priority}>
                  <td>
                    {PRIORITIES[item.priority]?.icon} {item.label}
                  </td>
                  <td>
                    <div className="bar-cell">
                      <span className={item.optionARating >= item.optionBRating ? 'rating-cell-high' : 'rating-cell-low'}>
                        {item.optionARating}
                      </span>
                      <div className="bar-wrapper">
                        <div
                          className="bar-fill bar-fill--a"
                          style={{ width: `${(item.optionARating / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="bar-cell">
                      <span className={item.optionBRating >= item.optionARating ? 'rating-cell-high' : 'rating-cell-low'}>
                        {item.optionBRating}
                      </span>
                      <div className="bar-wrapper">
                        <div
                          className="bar-fill bar-fill--b"
                          style={{ width: `${(item.optionBRating / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <PrimaryButton onClick={handleViewRecommendation} variant="primary">
              View Recommendation
            </PrimaryButton>
          </div>
        </SectionCard>
      )}

      {/* Error state — insufficient data */}
      {showComparison && result && !result.isSuccessful && (
        <SectionCard variant="warning">
          <div className="error-state">
            <div className="error-state-icon">&#9888;</div>
            <div className="error-state-title">Analysis Could Not Be Completed</div>
            <div className="error-state-message">{result.message}</div>
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <PrimaryButton onClick={() => onComplete(result)} variant="primary">
              Continue
            </PrimaryButton>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

export default Analysis