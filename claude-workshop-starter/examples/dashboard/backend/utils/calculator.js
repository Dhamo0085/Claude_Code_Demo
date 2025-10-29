/**
 * Business Logic Calculator for Pilot Program Manager
 * Calculates health scores, risk levels, and key metrics
 */

/**
 * Calculate overall health score for a pilot (0-100)
 * Based on multiple weighted factors
 */
function calculateHealthScore(pilot, successCriteria = [], metrics = []) {
  let score = 0;
  let maxScore = 0;

  // Factor 1: Success Criteria Achievement (40 points max)
  if (successCriteria.length > 0) {
    const criteriaScore = calculateCriteriaScore(successCriteria);
    score += criteriaScore * 40;
    maxScore += 40;
  }

  // Factor 2: Timeline Progress vs Achievement (30 points max)
  const timelineScore = calculateTimelineScore(pilot);
  score += timelineScore * 30;
  maxScore += 30;

  // Factor 3: Engagement Score (20 points max)
  if (metrics.length > 0) {
    const engagementScore = calculateEngagementScore(metrics);
    score += engagementScore * 20;
    maxScore += 20;
  }

  // Factor 4: Status-based modifier (10 points max)
  const statusScore = calculateStatusScore(pilot.status);
  score += statusScore * 10;
  maxScore += 10;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Calculate success criteria achievement score (0-1)
 */
function calculateCriteriaScore(criteria) {
  if (criteria.length === 0) return 0;

  let totalWeight = 0;
  let achievedWeight = 0;

  criteria.forEach(c => {
    const weight = c.weight || 1;
    totalWeight += weight;

    if (c.status === 'Achieved') {
      achievedWeight += weight;
    } else if (c.status === 'In Progress') {
      achievedWeight += weight * 0.5;
    } else if (c.status === 'At Risk') {
      achievedWeight += weight * 0.25;
    }
  });

  return totalWeight > 0 ? achievedWeight / totalWeight : 0;
}

/**
 * Calculate timeline progress score (0-1)
 * Considers if progress is on track with time elapsed
 */
function calculateTimelineScore(pilot) {
  const now = new Date();
  const start = new Date(pilot.start_date);
  const end = new Date(pilot.end_date);

  const totalDuration = end - start;
  const elapsed = now - start;
  const percentElapsed = elapsed / totalDuration;

  // If we're past the end date, score depends on status
  if (percentElapsed > 1) {
    return pilot.status === 'Converted' ? 1 : 0.3;
  }

  // If we're on track (e.g., 50% through time should have 40-60% completion)
  // This is a simplified model - in real app, you'd track actual completion
  if (percentElapsed < 0.25) return 1.0;
  if (percentElapsed < 0.5) return 0.9;
  if (percentElapsed < 0.75) return 0.8;
  return 0.7;
}

/**
 * Calculate engagement score based on metrics (0-1)
 */
function calculateEngagementScore(metrics) {
  if (metrics.length === 0) return 0.5;

  // Recent metrics are good sign of engagement
  const recentMetrics = metrics.filter(m => {
    const recordedDate = new Date(m.recorded_at);
    const daysSince = (new Date() - recordedDate) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });

  // Score based on frequency of metric recording
  if (recentMetrics.length >= 5) return 1.0;
  if (recentMetrics.length >= 3) return 0.8;
  if (recentMetrics.length >= 1) return 0.6;
  return 0.4;
}

/**
 * Calculate status-based score (0-1)
 */
function calculateStatusScore(status) {
  const statusScores = {
    'Converted': 1.0,
    'Active': 0.8,
    'Completed': 0.7,
    'At Risk': 0.4,
    'Lost': 0.0
  };
  return statusScores[status] || 0.5;
}

/**
 * Calculate days remaining in pilot
 */
function calculateDaysRemaining(pilot) {
  const now = new Date();
  const end = new Date(pilot.end_date);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate progress percentage (0-100)
 */
function calculateProgress(pilot) {
  const now = new Date();
  const start = new Date(pilot.start_date);
  const end = new Date(pilot.end_date);

  const totalDuration = end - start;
  const elapsed = now - start;

  let progress = (elapsed / totalDuration) * 100;
  progress = Math.max(0, Math.min(100, progress));
  return Math.round(progress);
}

/**
 * Assess risk level for a pilot
 * Returns: 'Low', 'Medium', 'High', or 'Critical'
 */
function assessRisk(pilot, successCriteria = [], stakeholders = []) {
  let riskScore = 0;

  // Factor 1: Health Score
  if (pilot.health_score < 30) riskScore += 3;
  else if (pilot.health_score < 50) riskScore += 2;
  else if (pilot.health_score < 70) riskScore += 1;

  // Factor 2: Days Remaining
  const daysRemaining = calculateDaysRemaining(pilot);
  if (daysRemaining < 0) riskScore += 3;
  else if (daysRemaining < 7) riskScore += 2;
  else if (daysRemaining < 14) riskScore += 1;

  // Factor 3: Success Criteria Status
  const atRiskCriteria = successCriteria.filter(c =>
    c.status === 'At Risk' || c.status === 'Failed'
  ).length;
  if (atRiskCriteria > 2) riskScore += 2;
  else if (atRiskCriteria > 0) riskScore += 1;

  // Factor 4: Stakeholder Engagement
  const lowEngagement = stakeholders.filter(s =>
    s.engagement_level === 'Low' || s.engagement_level === 'Unresponsive'
  ).length;
  if (lowEngagement > 1) riskScore += 2;
  else if (lowEngagement > 0) riskScore += 1;

  // Factor 5: Current Status
  if (pilot.status === 'At Risk') riskScore += 2;
  if (pilot.status === 'Lost') riskScore += 5;

  // Map score to risk level
  if (riskScore >= 7) return 'Critical';
  if (riskScore >= 5) return 'High';
  if (riskScore >= 3) return 'Medium';
  return 'Low';
}

/**
 * Calculate conversion probability based on current data
 */
function calculateConversionProbability(pilot, successCriteria = [], stakeholders = []) {
  // Start with health score as base
  let probability = pilot.health_score;

  // Adjust based on success criteria
  const achievedCriteria = successCriteria.filter(c => c.status === 'Achieved').length;
  const totalCriteria = successCriteria.length;
  if (totalCriteria > 0) {
    const criteriaPercent = (achievedCriteria / totalCriteria) * 100;
    probability = (probability + criteriaPercent) / 2;
  }

  // Adjust based on stakeholder engagement
  const highEngagement = stakeholders.filter(s => s.engagement_level === 'High').length;
  if (highEngagement >= 2) probability += 10;
  else if (highEngagement === 1) probability += 5;

  // Adjust based on days remaining
  const daysRemaining = calculateDaysRemaining(pilot);
  if (daysRemaining < 0) probability -= 30;

  // Status overrides
  if (pilot.status === 'Converted') probability = 100;
  if (pilot.status === 'Lost') probability = 0;
  if (pilot.status === 'At Risk') probability = Math.min(probability, 40);

  // Ensure bounds
  probability = Math.max(0, Math.min(100, probability));
  return Math.round(probability);
}

/**
 * Generate insights and recommendations for a pilot
 */
function generateInsights(pilot, successCriteria = [], stakeholders = [], metrics = []) {
  const insights = [];
  const daysRemaining = calculateDaysRemaining(pilot);
  const riskLevel = assessRisk(pilot, successCriteria, stakeholders);

  // Timeline insights
  if (daysRemaining < 0) {
    insights.push({
      type: 'warning',
      category: 'timeline',
      message: `Pilot is ${Math.abs(daysRemaining)} days past end date`,
      action: 'Schedule extension discussion or conversion meeting'
    });
  } else if (daysRemaining < 7) {
    insights.push({
      type: 'warning',
      category: 'timeline',
      message: `Only ${daysRemaining} days remaining`,
      action: 'Prepare final demo and conversion proposal'
    });
  }

  // Success criteria insights
  const atRiskCriteria = successCriteria.filter(c => c.status === 'At Risk');
  if (atRiskCriteria.length > 0) {
    insights.push({
      type: 'alert',
      category: 'success_criteria',
      message: `${atRiskCriteria.length} success criteria at risk`,
      action: 'Review blockers and allocate resources'
    });
  }

  // Stakeholder engagement insights
  const unresponsive = stakeholders.filter(s => s.engagement_level === 'Unresponsive');
  if (unresponsive.length > 0) {
    insights.push({
      type: 'alert',
      category: 'engagement',
      message: `${unresponsive.length} unresponsive stakeholders`,
      action: 'Re-engage through executive sponsor or champion'
    });
  }

  // Health score insights
  if (pilot.health_score < 50) {
    insights.push({
      type: 'critical',
      category: 'health',
      message: 'Low health score indicates pilot at risk',
      action: 'Schedule escalation meeting with leadership'
    });
  }

  // Positive insights
  if (pilot.health_score > 80 && daysRemaining > 0 && daysRemaining < 14) {
    insights.push({
      type: 'success',
      category: 'conversion',
      message: 'Strong pilot performance - ready for conversion',
      action: 'Begin contract negotiations'
    });
  }

  return insights;
}

module.exports = {
  calculateHealthScore,
  calculateDaysRemaining,
  calculateProgress,
  assessRisk,
  calculateConversionProbability,
  generateInsights
};
