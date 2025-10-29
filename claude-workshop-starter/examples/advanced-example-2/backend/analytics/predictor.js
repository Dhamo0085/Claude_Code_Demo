// Conversion Prediction Algorithm
// Uses weighted scoring to predict the likelihood of pilot-to-customer conversion

class ConversionPredictor {
    constructor(db) {
        this.db = db;

        // Scoring weights (must sum to 100)
        this.weights = {
            criteriaCompletion: 35,    // How much of success criteria is complete
            stakeholderEngagement: 25,  // How engaged are stakeholders
            timelineProgress: 20,       // Are we on track timeline-wise
            contractValue: 10,          // Higher value deals get slight boost
            industrySuccess: 10         // Historical success in this industry
        };

        // Risk multipliers (applied when conditions are met)
        this.riskFactors = {
            deadlineApproaching: 0.7,   // < 14 days and behind schedule
            stakeholderDisengaged: 0.8, // No contact in > 7 days
            lowHealthScore: 0.6,        // Health score < 50
            criteriaStalled: 0.75       // < 30% completion with < 30 days remaining
        };

        // Industry baseline success rates
        this.industryRates = {
            'Technology': 0.75,
            'Financial Services': 0.72,
            'Healthcare': 0.68,
            'Manufacturing': 0.70,
            'Retail': 0.65,
            'Education': 0.60,
            'Other': 0.65
        };
    }

    /**
     * Main prediction function
     * @param {Object} pilot - Pilot data
     * @param {Array} criteria - Success criteria for pilot
     * @param {Array} stakeholders - Stakeholder data
     * @returns {Object} - Prediction result with score, factors, and risks
     */
    async predictConversion(pilot, criteria, stakeholders) {
        // Calculate individual factor scores
        const criteriaScore = this.calculateCriteriaScore(criteria);
        const stakeholderScore = this.calculateStakeholderScore(stakeholders);
        const timelineScore = this.calculateTimelineScore(pilot, criteria);
        const valueScore = this.calculateValueScore(pilot.contract_value);
        const industryScore = this.getIndustryScore(pilot.industry);

        // Calculate weighted base score
        let baseScore =
            (criteriaScore * this.weights.criteriaCompletion) +
            (stakeholderScore * this.weights.stakeholderEngagement) +
            (timelineScore * this.weights.timelineProgress) +
            (valueScore * this.weights.contractValue) +
            (industryScore * this.weights.industrySuccess);

        // Identify and apply risk factors
        const risks = this.identifyRisks(pilot, criteria, stakeholders);
        let finalScore = baseScore;

        risks.forEach(risk => {
            finalScore *= risk.multiplier;
        });

        // Ensure score is within 0-100 range
        finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

        return {
            conversionProbability: finalScore,
            baseScore: Math.round(baseScore),
            factors: {
                criteriaCompletion: Math.round(criteriaScore * 100),
                stakeholderEngagement: Math.round(stakeholderScore * 100),
                timelineProgress: Math.round(timelineScore * 100),
                contractValue: Math.round(valueScore * 100),
                industrySuccess: Math.round(industryScore * 100)
            },
            risks: risks,
            recommendation: this.getRecommendation(finalScore, risks)
        };
    }

    /**
     * Calculate success criteria completion score (0-1)
     */
    calculateCriteriaScore(criteria) {
        if (!criteria || criteria.length === 0) return 0.5; // Neutral if no criteria

        // Weight-based completion
        const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 1), 0);
        const completedWeight = criteria
            .filter(c => c.status === 'Achieved')
            .reduce((sum, c) => sum + (c.weight || 1), 0);

        return completedWeight / totalWeight;
    }

    /**
     * Calculate stakeholder engagement score (0-1)
     */
    calculateStakeholderScore(stakeholders) {
        if (!stakeholders || stakeholders.length === 0) return 0.3; // Low if no stakeholders

        const engagementScores = {
            'High': 1.0,
            'Medium': 0.6,
            'Low': 0.3,
            'Unresponsive': 0.1
        };

        // Calculate average engagement with recency weighting
        const now = new Date();
        let totalScore = 0;
        let totalWeight = 0;

        stakeholders.forEach(stakeholder => {
            const baseScore = engagementScores[stakeholder.engagement_level] || 0.5;

            // Apply recency multiplier
            const daysSinceContact = this.getDaysSince(stakeholder.last_contact);
            let recencyMultiplier = 1.0;
            if (daysSinceContact > 30) recencyMultiplier = 0.5;
            else if (daysSinceContact > 14) recencyMultiplier = 0.7;
            else if (daysSinceContact > 7) recencyMultiplier = 0.85;

            totalScore += baseScore * recencyMultiplier;
            totalWeight += 1;
        });

        return totalScore / totalWeight;
    }

    /**
     * Calculate timeline progress score (0-1)
     */
    calculateTimelineScore(pilot, criteria) {
        const totalDays = this.getDaysBetween(pilot.start_date, pilot.end_date);
        const elapsed = this.getDaysSince(pilot.start_date);
        const timeProgress = elapsed / totalDays;

        // Calculate criteria progress
        const criteriaProgress = this.calculateCriteriaScore(criteria);

        // Ideal: criteria progress matches or exceeds time progress
        // Score degrades if criteria lags behind timeline
        if (criteriaProgress >= timeProgress) {
            return 1.0; // On or ahead of schedule
        } else {
            // Behind schedule - score based on gap
            const gap = timeProgress - criteriaProgress;
            return Math.max(0, 1 - (gap * 1.5)); // 1.5x penalty for being behind
        }
    }

    /**
     * Calculate contract value score (0-1)
     * Higher value contracts get slight boost (to account for more attention/resources)
     */
    calculateValueScore(contractValue) {
        // Normalize to 0-1 based on typical enterprise contract ranges
        // $100k = 0.3, $500k = 0.5, $1M+ = 1.0
        if (contractValue >= 1000000) return 1.0;
        if (contractValue >= 500000) return 0.7;
        if (contractValue >= 250000) return 0.5;
        if (contractValue >= 100000) return 0.3;
        return 0.2;
    }

    /**
     * Get industry success rate (0-1)
     */
    getIndustryScore(industry) {
        return this.industryRates[industry] || this.industryRates['Other'];
    }

    /**
     * Identify risk factors
     */
    identifyRisks(pilot, criteria, stakeholders) {
        const risks = [];
        const daysRemaining = this.getDaysBetween(new Date(), pilot.end_date);
        const criteriaScore = this.calculateCriteriaScore(criteria);
        const healthScore = pilot.health_score || 0;

        // Risk: Deadline approaching with incomplete criteria
        if (daysRemaining < 14 && criteriaScore < 0.8) {
            risks.push({
                type: 'deadline_approaching',
                severity: 'high',
                message: `Only ${daysRemaining} days remaining with ${Math.round(criteriaScore * 100)}% criteria complete`,
                multiplier: this.riskFactors.deadlineApproaching
            });
        }

        // Risk: Stakeholder disengagement
        const daysSinceLastContact = this.getMostRecentStakeholderContact(stakeholders);
        if (daysSinceLastContact > 7) {
            risks.push({
                type: 'stakeholder_disengaged',
                severity: daysSinceLastContact > 14 ? 'high' : 'medium',
                message: `No stakeholder contact in ${daysSinceLastContact} days`,
                multiplier: this.riskFactors.stakeholderDisengaged
            });
        }

        // Risk: Low health score
        if (healthScore < 50) {
            risks.push({
                type: 'low_health_score',
                severity: 'high',
                message: `Health score critically low at ${healthScore}%`,
                multiplier: this.riskFactors.lowHealthScore
            });
        }

        // Risk: Stalled progress
        if (daysRemaining < 30 && criteriaScore < 0.3) {
            risks.push({
                type: 'criteria_stalled',
                severity: 'high',
                message: 'Less than 30% criteria complete with < 30 days remaining',
                multiplier: this.riskFactors.criteriaStalled
            });
        }

        return risks;
    }

    /**
     * Get actionable recommendation based on score and risks
     */
    getRecommendation(score, risks) {
        if (score >= 80) {
            return {
                status: 'strong',
                action: 'Continue current trajectory. Focus on final success criteria.',
                priority: 'low'
            };
        } else if (score >= 60) {
            return {
                status: 'moderate',
                action: 'Monitor closely. Address any risks proactively.',
                priority: 'medium'
            };
        } else if (score >= 40) {
            return {
                status: 'at_risk',
                action: 'Immediate intervention required. Schedule executive alignment call.',
                priority: 'high'
            };
        } else {
            return {
                status: 'critical',
                action: 'Escalate immediately. Consider pivot or extension strategy.',
                priority: 'urgent'
            };
        }
    }

    // Utility methods
    getDaysSince(dateString) {
        if (!dateString) return 999;
        const date = new Date(dateString);
        const now = new Date();
        return Math.floor((now - date) / (1000 * 60 * 60 * 24));
    }

    getDaysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
    }

    getMostRecentStakeholderContact(stakeholders) {
        if (!stakeholders || stakeholders.length === 0) return 999;
        const contacts = stakeholders
            .map(s => this.getDaysSince(s.last_contact))
            .filter(d => d < 999);
        return contacts.length > 0 ? Math.min(...contacts) : 999;
    }
}

module.exports = ConversionPredictor;
