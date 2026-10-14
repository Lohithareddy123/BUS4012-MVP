/**
 * analysisLogic.js — Deterministic scoring engine for ResolvePath AI.
 *
 * This module calculates a priority alignment recommendation based on
 * the user's own 1-5 ratings of each option against their selected priorities.
 *
 * The same inputs always produce the same outputs. No randomness, no AI model.
 */

/**
 * Priority metadata — labels and display icons.
 */
export const PRIORITIES = {
  salary: { label: 'Salary', icon: '$' },
  career_growth: { label: 'Career Growth', icon: '↑' },
  work_life: { label: 'Work-Life Balance', icon: '⚖' },
  location: { label: 'Location', icon: '◎' },
}

/**
 * Calculate recommendation from user-provided ratings.
 *
 * @param {Object} appData — The full application state object.
 * @returns {Object} Analysis result with recommendation, score, reasons, trade-off.
 */
export function analyseDecision(appData) {
  const { priorities, optionA, optionB, ratings } = appData

  // Validate inputs
  if (!priorities || priorities.length === 0) {
    return {
      isSuccessful: false,
      isTie: false,
      message: 'No priorities were selected. Please go back and select at least one priority.',
    }
  }

  if (!optionA || !optionB) {
    return {
      isSuccessful: false,
      isTie: false,
      message: 'Both options must be provided. Please go back and enter your options.',
    }
  }

  if (!ratings) {
    return {
      isSuccessful: false,
      isTie: false,
      message: 'Ratings are missing. Please go back and rate each option.',
    }
  }

  // Check all priorities have ratings for both options
  for (const priority of priorities) {
    const r = ratings[priority]
    if (!r || !r.optionA || !r.optionB) {
      return {
        isSuccessful: false,
        isTie: false,
        message: 'Not all ratings are complete. Please go back and rate each option for all selected priorities.',
      }
    }
  }

  // Calculate totals
  let totalA = 0
  let totalB = 0
  const comparison = []

  for (const priority of priorities) {
    const r = ratings[priority]
    const ratingA = r.optionA
    const ratingB = r.optionB

    totalA += ratingA
    totalB += ratingB

    comparison.push({
      priority,
      label: PRIORITIES[priority]?.label || priority,
      optionARating: ratingA,
      optionBRating: ratingB,
    })
  }

  const maxPossible = priorities.length * 5

  // Determine recommendation
  if (totalA === totalB) {
    // Tie — no clear recommendation
    return {
      isSuccessful: true,
      isTie: true,
      recommended: null,
      recommendedLabel: null,
      matchScore: null,
      matchScoreExplanation: null,
      reasons: [],
      tradeOff: null,
      comparison,
    }
  }

  const winner = totalA > totalB ? 'optionA' : 'optionB'
  const winnerTotal = winner === 'optionA' ? totalA : totalB
  const winnerLabel = winner === 'optionA' ? optionA : optionB
  const matchScore = Math.round((winnerTotal / maxPossible) * 100)

  // Find reasons — top 2 priorities where winner scored highest (absolute)
  const scored = comparison.map((item) => ({
    ...item,
    winnerRating: winner === 'optionA' ? item.optionARating : item.optionBRating,
    otherRating: winner === 'optionA' ? item.optionBRating : item.optionARating,
    gap: winner === 'optionA'
      ? item.optionARating - item.optionBRating
      : item.optionBRating - item.optionARating,
  }))


  // Only include priorities where the recommended option scored higher.
  const reasons = [...scored]
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 2)
    .map((item) => ({
      priority: item.priority,
      label: item.label,
      yourRating: item.winnerRating,
      otherRating: item.otherRating,
      explanation: `You rated this option ${item.winnerRating}/5 for ${item.label}, compared with ${item.otherRating}/5 for the other option.`,
    }))


  // Find trade-off — only where the recommended option scored LOWER
  const disadvantages = scored.filter((item) => item.winnerRating < item.otherRating)

  let tradeOff
  if (disadvantages.length > 0) {
    // Pick the priority with the largest disadvantage (most negative gap)
    const sortedByDisadvantage = [...disadvantages].sort((a, b) => a.gap - b.gap)
    const tradeOffItem = sortedByDisadvantage[0]
    tradeOff = {
      priority: tradeOffItem.priority,
      label: tradeOffItem.label,
      yourRating: tradeOffItem.winnerRating,
      otherRating: tradeOffItem.otherRating,
      isNoTradeOff: false,
      explanation: `You rated this option ${tradeOffItem.winnerRating}/5 for ${tradeOffItem.label}, which is lower than the other option at ${tradeOffItem.otherRating}/5. Consider whether this trade-off is acceptable.`,
    }
  } else {
    // No disadvantage found — the recommended option scored equal or higher on all priorities
    tradeOff = {
      priority: null,
      label: 'No major trade-off',
      yourRating: null,
      otherRating: null,
      isNoTradeOff: true,
      explanation: 'This option scored as high or higher across all selected priorities.',
    }
  }

  return {
    isSuccessful: true,
    isTie: false,
    recommended: winner,
    recommendedLabel: winnerLabel,
    matchScore,
    matchScoreExplanation: `Based on your ratings across ${priorities.length} selected priorit${priorities.length === 1 ? 'y' : 'ies'}.`,
    reasons,
    tradeOff,
    comparison,
  }
}