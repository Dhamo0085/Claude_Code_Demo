// Stakeholder Update Generator
// Creates weekly updates, milestone notifications, and progress reports

const ConversionPredictor = require('../analytics/predictor');

class StakeholderUpdateGenerator {
    constructor(db) {
        this.db = db;
        this.predictor = new ConversionPredictor(db);
    }

    /**
     * Generate weekly update for a pilot
     */
    async generateWeeklyUpdate(pilotId) {
        const pilot = await this.db.getPilotById(pilotId);
        if (!pilot) throw new Error('Pilot not found');

        const [criteria, stakeholders] = await Promise.all([
            this.db.getSuccessCriteria(pilotId),
            this.db.getStakeholders(pilotId)
        ]);

        // Get recent metrics (last 7 days)
        const recentMetrics = await this.getRecentMetrics(pilotId, 7);

        // Calculate progress
        const completedCriteria = criteria.filter(c => c.status === 'Achieved');
        const inProgressCriteria = criteria.filter(c => c.status === 'In Progress');
        const blockedCriteria = criteria.filter(c => c.status === 'At Risk');

        // Calculate completion percentage
        const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
        const completedWeight = completedCriteria.reduce((sum, c) => sum + c.weight, 0);
        const completionRate = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

        // Time remaining
        const daysRemaining = this.getDaysUntil(pilot.end_date);
        const totalDays = this.getDaysBetween(pilot.start_date, pilot.end_date);
        const daysElapsed = totalDays - daysRemaining;
        const timeProgress = (daysElapsed / totalDays) * 100;

        return {
            pilotId: pilot.id,
            company: pilot.company_name,
            weekEnding: new Date().toISOString().split('T')[0],
            status: pilot.status,
            healthScore: pilot.health_score,
            progress: {
                overallCompletion: Math.round(completionRate),
                timeElapsed: Math.round(timeProgress),
                daysRemaining: daysRemaining,
                onTrack: completionRate >= timeProgress
            },
            achievements: this.getRecentAchievements(criteria, 7),
            inProgress: inProgressCriteria.map(c => ({
                criteria: c.criteria,
                target: c.target_value,
                current: c.current_value
            })),
            blockers: blockedCriteria.map(c => ({
                criteria: c.criteria,
                issue: 'Behind schedule or at risk'
            })),
            metrics: recentMetrics,
            nextSteps: this.generateNextSteps(pilot, criteria, daysRemaining),
            upcomingMilestones: await this.getUpcomingMilestones(pilotId, 14)
        };
    }

    /**
     * Generate milestone update
     */
    async generateMilestoneUpdate(pilotId, milestone) {
        const pilot = await this.db.getPilotById(pilotId);
        if (!pilot) throw new Error('Pilot not found');

        const criteria = await this.db.getSuccessCriteria(pilotId);

        return {
            pilotId: pilot.id,
            company: pilot.company_name,
            milestone: milestone,
            completedAt: new Date().toISOString(),
            status: 'achieved',
            impact: this.assessMilestoneImpact(milestone),
            nextMilestone: this.getNextMilestone(criteria),
            remainingCriteria: criteria.filter(c => c.status !== 'Achieved').length,
            message: `Great progress! ${pilot.company_name} has achieved the ${milestone} milestone.`
        };
    }

    /**
     * Format update as email
     */
    async formatUpdateEmail(pilotId, updateData) {
        const pilot = await this.db.getPilotById(pilotId);
        const stakeholders = await this.db.getStakeholders(pilotId);

        const emailBody = this.buildEmailBody(pilot, updateData);

        return {
            to: stakeholders.map(s => s.email).join(', '),
            subject: `Weekly Update: ${pilot.company_name} Pilot Program`,
            body: emailBody,
            htmlBody: this.buildHtmlEmail(pilot, updateData)
        };
    }

    /**
     * Generate progress report for stakeholder review
     */
    async generateProgressReport(pilotId) {
        const pilot = await this.db.getPilotById(pilotId);
        if (!pilot) throw new Error('Pilot not found');

        const [criteria, stakeholders, prediction] = await Promise.all([
            this.db.getSuccessCriteria(pilotId),
            this.db.getStakeholders(pilotId),
            this.getPrediction(pilotId)
        ]);

        // Group criteria by status
        const criteriaByStatus = {
            achieved: criteria.filter(c => c.status === 'Achieved'),
            inProgress: criteria.filter(c => c.status === 'In Progress'),
            atRisk: criteria.filter(c => c.status === 'At Risk'),
            notStarted: criteria.filter(c => c.status === 'Not Started')
        };

        const daysRemaining = this.getDaysUntil(pilot.end_date);
        const totalDays = this.getDaysBetween(pilot.start_date, pilot.end_date);

        return {
            pilot: {
                id: pilot.id,
                company: pilot.company_name,
                industry: pilot.industry,
                startDate: pilot.start_date,
                endDate: pilot.end_date,
                status: pilot.status,
                healthScore: pilot.health_score,
                contractValue: pilot.contract_value,
                arrProjection: pilot.arr_projection
            },
            timeline: {
                totalDays: totalDays,
                daysElapsed: totalDays - daysRemaining,
                daysRemaining: daysRemaining,
                percentComplete: Math.round(((totalDays - daysRemaining) / totalDays) * 100)
            },
            criteria: {
                total: criteria.length,
                achieved: criteriaByStatus.achieved.length,
                inProgress: criteriaByStatus.inProgress.length,
                atRisk: criteriaByStatus.atRisk.length,
                notStarted: criteriaByStatus.notStarted.length,
                completionRate: this.calculateCompletionRate(criteria),
                details: criteriaByStatus
            },
            stakeholders: stakeholders.map(s => ({
                name: s.name,
                role: s.role,
                engagement: s.engagement_level,
                lastContact: s.last_contact,
                daysSinceContact: this.getDaysSince(s.last_contact)
            })),
            prediction: prediction,
            executiveSummary: this.generateExecutiveSummary(pilot, criteria, prediction, daysRemaining)
        };
    }

    // Helper methods
    async getPrediction(pilotId) {
        const pilot = await this.db.getPilotById(pilotId);
        const criteria = await this.db.getSuccessCriteria(pilotId);
        const stakeholders = await this.db.getStakeholders(pilotId);

        return await this.predictor.predictConversion(pilot, criteria, stakeholders);
    }

    async getRecentMetrics(pilotId, days) {
        const metrics = await this.db.getMetrics(pilotId);
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return metrics
            .filter(m => new Date(m.recorded_at) >= cutoffDate)
            .map(m => ({
                name: m.metric_name,
                value: m.metric_value,
                type: m.metric_type,
                recordedAt: m.recorded_at
            }));
    }

    getRecentAchievements(criteria, days) {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return criteria
            .filter(c => c.status === 'Achieved')
            .map(c => c.criteria);
    }

    generateNextSteps(pilot, criteria, daysRemaining) {
        const steps = [];
        const incompleteCriteria = criteria.filter(c => c.status !== 'Achieved');

        // Prioritize based on days remaining
        if (daysRemaining < 14) {
            steps.push('URGENT: Finalize all remaining success criteria');
            incompleteCriteria.forEach(c => {
                if (c.status === 'At Risk') {
                    steps.push(`Escalate: ${c.criteria}`);
                }
            });
        } else if (daysRemaining < 30) {
            steps.push('Focus on completing in-progress items');
            incompleteCriteria
                .filter(c => c.status === 'In Progress')
                .forEach(c => steps.push(`Complete: ${c.criteria}`));
        } else {
            steps.push('Continue steady progress on success criteria');
            incompleteCriteria
                .filter(c => c.status === 'Not Started')
                .slice(0, 3)
                .forEach(c => steps.push(`Start: ${c.criteria}`));
        }

        return steps;
    }

    async getUpcomingMilestones(pilotId, days) {
        // This would fetch from a milestones table if available
        // For now, return placeholder
        return [];
    }

    assessMilestoneImpact(milestone) {
        // Simple impact assessment
        if (milestone.toLowerCase().includes('launch') || milestone.toLowerCase().includes('go-live')) {
            return 'high';
        } else if (milestone.toLowerCase().includes('integration') || milestone.toLowerCase().includes('onboard')) {
            return 'medium';
        }
        return 'standard';
    }

    getNextMilestone(criteria) {
        const incomplete = criteria.filter(c => c.status !== 'Achieved');
        if (incomplete.length === 0) return 'All criteria complete!';
        return incomplete[0].criteria;
    }

    calculateCompletionRate(criteria) {
        if (criteria.length === 0) return 0;
        const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
        const completedWeight = criteria
            .filter(c => c.status === 'Achieved')
            .reduce((sum, c) => sum + c.weight, 0);
        return Math.round((completedWeight / totalWeight) * 100);
    }

    generateExecutiveSummary(pilot, criteria, prediction, daysRemaining) {
        const completionRate = this.calculateCompletionRate(criteria);
        const status = prediction.conversionProbability >= 70 ? 'on track' :
                      prediction.conversionProbability >= 50 ? 'needs attention' :
                      'at risk';

        return `${pilot.company_name} pilot is ${status} with ${completionRate}% of success criteria complete and ${daysRemaining} days remaining. Conversion probability: ${prediction.conversionProbability}%.`;
    }

    buildEmailBody(pilot, updateData) {
        const lines = [];
        lines.push(`Weekly Update: ${pilot.company_name} Pilot Program`);
        lines.push('');
        lines.push(`Status: ${updateData.status || pilot.status}`);
        lines.push(`Health Score: ${pilot.health_score}%`);
        lines.push('');

        if (updateData.progress) {
            lines.push('PROGRESS:');
            lines.push(`- Overall Completion: ${updateData.progress.overallCompletion}%`);
            lines.push(`- Days Remaining: ${updateData.progress.daysRemaining}`);
            lines.push(`- On Track: ${updateData.progress.onTrack ? 'Yes' : 'No'}`);
            lines.push('');
        }

        if (updateData.achievements && updateData.achievements.length > 0) {
            lines.push('ACHIEVEMENTS THIS WEEK:');
            updateData.achievements.forEach(a => lines.push(`- ${a}`));
            lines.push('');
        }

        if (updateData.blockers && updateData.blockers.length > 0) {
            lines.push('BLOCKERS:');
            updateData.blockers.forEach(b => lines.push(`- ${b.criteria}`));
            lines.push('');
        }

        if (updateData.nextSteps && updateData.nextSteps.length > 0) {
            lines.push('NEXT STEPS:');
            updateData.nextSteps.forEach(s => lines.push(`- ${s}`));
        }

        return lines.join('\n');
    }

    buildHtmlEmail(pilot, updateData) {
        // Simple HTML email template
        return `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Weekly Update: ${pilot.company_name} Pilot Program</h2>
                <p><strong>Status:</strong> ${updateData.status || pilot.status}</p>
                <p><strong>Health Score:</strong> ${pilot.health_score}%</p>
                ${this.buildEmailBody(pilot, updateData).replace(/\n/g, '<br>')}
            </body>
            </html>
        `;
    }

    // Utility methods
    getDaysUntil(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    }

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
}

module.exports = StakeholderUpdateGenerator;
