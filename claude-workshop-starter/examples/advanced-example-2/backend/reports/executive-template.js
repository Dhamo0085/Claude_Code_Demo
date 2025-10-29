// Executive Report Generator
// Generates comprehensive executive summaries and board-ready reports

const ConversionPredictor = require('../analytics/predictor');
const DataAggregator = require('../analytics/aggregator');
const ValueCalculator = require('../analytics/value-calculator');

class ExecutiveReportGenerator {
    constructor(db) {
        this.db = db;
        this.predictor = new ConversionPredictor(db);
        this.aggregator = new DataAggregator(db);
        this.valueCalculator = new ValueCalculator(db);
    }

    /**
     * Generate comprehensive executive summary
     */
    async generateExecutiveSummary() {
        const pilots = await this.db.getAllPilots();
        const activePilots = pilots.filter(p => p.status === 'Active' || p.status === 'At Risk');

        // Gather all necessary data
        const [
            pipelineValue,
            conversionStats,
            avgTimeToClose,
            riskDistribution,
            statusBreakdown,
            quarterlyForecast
        ] = await Promise.all([
            this.aggregator.getTotalPipelineValue(),
            this.aggregator.getConversionRate(),
            this.aggregator.getAverageTimeToClose(),
            this.aggregator.getRiskDistribution(),
            this.aggregator.getPilotsByStatus(),
            this.aggregator.getQuarterlyRevenueForecast()
        ]);

        // Calculate projected conversions
        const projectedConversions = activePilots.reduce((sum, p) => {
            const prob = (p.conversion_probability || 50) / 100;
            return sum + (p.arr_projection * prob);
        }, 0);

        // Get at-risk pilots
        const atRiskPilots = riskDistribution.at_risk.pilots.concat(riskDistribution.critical.pilots);

        // Get top opportunities
        const topOpportunities = await this.getTopOpportunities(activePilots);

        // Generate highlights
        const highlights = await this.generateHighlights(pilots, topOpportunities, atRiskPilots);

        // Generate action items
        const actionItems = await this.generateActionItems(activePilots);

        return {
            generatedAt: new Date().toISOString(),
            overview: {
                activePilots: activePilots.length,
                totalPipelineValue: Math.round(pipelineValue),
                projectedConversions: Math.round(projectedConversions),
                atRiskCount: atRiskPilots.length,
                conversionRate: conversionStats ? Math.round(conversionStats.rate) : null,
                avgTimeToClose: avgTimeToClose
            },
            highlights: highlights,
            pilotsByStatus: statusBreakdown,
            riskDistribution: {
                strong: riskDistribution.strong.count,
                moderate: riskDistribution.moderate.count,
                at_risk: riskDistribution.at_risk.count,
                critical: riskDistribution.critical.count
            },
            topOpportunities: topOpportunities,
            quarterlyForecast: quarterlyForecast.slice(0, 2), // Next 2 quarters
            actionItems: actionItems,
            summary: this.generateTextSummary({
                activePilots: activePilots.length,
                pipelineValue,
                projectedConversions,
                atRiskCount: atRiskPilots.length,
                topOpportunity: topOpportunities[0]
            })
        };
    }

    /**
     * Get top opportunities sorted by expected value
     */
    async getTopOpportunities(pilots) {
        const opportunities = [];

        for (const pilot of pilots) {
            const criteria = await this.db.getSuccessCriteria(pilot.id);
            const stakeholders = await this.db.getStakeholders(pilot.id);

            const prediction = await this.predictor.predictConversion(pilot, criteria, stakeholders);
            const expectedValue = pilot.arr_projection * (prediction.conversionProbability / 100);

            opportunities.push({
                pilotId: pilot.id,
                company: pilot.company_name,
                industry: pilot.industry,
                arrValue: pilot.arr_projection,
                conversionProbability: prediction.conversionProbability,
                expectedValue: Math.round(expectedValue),
                healthScore: pilot.health_score,
                status: pilot.status,
                daysRemaining: this.getDaysUntil(pilot.end_date),
                recommendation: prediction.recommendation
            });
        }

        // Sort by expected value (ARR * probability)
        return opportunities.sort((a, b) => b.expectedValue - a.expectedValue);
    }

    /**
     * Generate highlights for executive attention
     */
    async generateHighlights(pilots, topOpportunities, atRiskPilots) {
        const highlights = [];

        // Top opportunity
        if (topOpportunities.length > 0) {
            const top = topOpportunities[0];
            highlights.push(
                `Top opportunity: ${top.company} ($${this.formatCurrency(top.arrValue)} ARR, ${top.conversionProbability}% conversion probability)`
            );
        }

        // At-risk count
        if (atRiskPilots.length > 0) {
            highlights.push(
                `${atRiskPilots.length} pilot${atRiskPilots.length > 1 ? 's' : ''} at risk requiring immediate attention`
            );
        }

        // Recent conversions
        const recentConversions = pilots.filter(p => {
            if (p.status !== 'Converted') return false;
            const endDate = new Date(p.end_date);
            const daysSince = Math.floor((Date.now() - endDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysSince <= 30;
        });

        if (recentConversions.length > 0) {
            const totalValue = recentConversions.reduce((sum, p) => sum + p.arr_projection, 0);
            highlights.push(
                `${recentConversions.length} pilot${recentConversions.length > 1 ? 's' : ''} converted in last 30 days ($${this.formatCurrency(totalValue)} ARR)`
            );
        }

        // Quarterly forecast
        const activePilots = pilots.filter(p => p.status === 'Active' || p.status === 'At Risk');
        const projectedConversions = activePilots.reduce((sum, p) => {
            const prob = (p.conversion_probability || 50) / 100;
            return sum + (p.arr_projection * prob);
        }, 0);

        const quarterlyForecast = await this.aggregator.getQuarterlyRevenueForecast();
        if (quarterlyForecast.length > 0) {
            highlights.push(
                `${quarterlyForecast[0].quarter} conversion forecast: $${this.formatCurrency(quarterlyForecast[0].projectedRevenue)} ARR`
            );
        }

        return highlights;
    }

    /**
     * Generate prioritized action items
     */
    async generateActionItems(pilots) {
        const actions = [];

        for (const pilot of pilots) {
            const criteria = await this.db.getSuccessCriteria(pilot.id);
            const stakeholders = await this.db.getStakeholders(pilot.id);

            const prediction = await this.predictor.predictConversion(pilot, criteria, stakeholders);
            const daysRemaining = this.getDaysUntil(pilot.end_date);

            // Critical pilots
            if (prediction.conversionProbability < 40) {
                actions.push({
                    priority: 'urgent',
                    pilot: pilot.company_name,
                    action: `${pilot.company_name} at critical risk (${prediction.conversionProbability}% probability) - immediate escalation required`,
                    details: prediction.risks.map(r => r.message).join('; ')
                });
            }

            // Deadline approaching
            if (daysRemaining <= 14 && daysRemaining > 0 && prediction.conversionProbability < 80) {
                actions.push({
                    priority: 'high',
                    pilot: pilot.company_name,
                    action: `${pilot.company_name} closing in ${daysRemaining} days - final push needed`,
                    details: `Only ${Math.round((criteria.filter(c => c.status === 'Achieved').length / criteria.length) * 100)}% criteria complete`
                });
            }

            // Stakeholder disengagement
            const daysSinceContact = this.getMostRecentContact(stakeholders);
            if (daysSinceContact > 14) {
                actions.push({
                    priority: 'high',
                    pilot: pilot.company_name,
                    action: `${pilot.company_name} - no stakeholder contact in ${daysSinceContact} days`,
                    details: 'Schedule check-in call immediately'
                });
            }

            // High-value opportunity needs support
            if (pilot.arr_projection >= 1000000 && prediction.conversionProbability >= 70 && prediction.conversionProbability < 85) {
                actions.push({
                    priority: 'medium',
                    pilot: pilot.company_name,
                    action: `${pilot.company_name} - high-value opportunity needs executive sponsorship`,
                    details: `$${this.formatCurrency(pilot.arr_projection)} ARR at ${prediction.conversionProbability}% probability`
                });
            }
        }

        // Sort by priority
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    /**
     * Generate text-based summary
     */
    generateTextSummary(data) {
        const lines = [];
        lines.push('PILOT PROGRAM EXECUTIVE SUMMARY');
        lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        lines.push('');
        lines.push('OVERVIEW:');
        lines.push(`- Active Pilots: ${data.activePilots}`);
        lines.push(`- Total Pipeline Value: $${this.formatCurrency(data.pipelineValue)} ARR`);
        lines.push(`- Projected Conversions: $${this.formatCurrency(data.projectedConversions)} ARR`);
        lines.push(`- At-Risk Pilots: ${data.atRiskCount}`);

        if (data.topOpportunity) {
            lines.push('');
            lines.push('TOP OPPORTUNITY:');
            lines.push(`${data.topOpportunity.company} - $${this.formatCurrency(data.topOpportunity.arrValue)} ARR`);
            lines.push(`Conversion Probability: ${data.topOpportunity.conversionProbability}%`);
        }

        if (data.atRiskCount > 0) {
            lines.push('');
            lines.push('ACTION REQUIRED:');
            lines.push(`⚠️  ${data.atRiskCount} pilot${data.atRiskCount > 1 ? 's' : ''} require immediate attention`);
        }

        return lines.join('\n');
    }

    // Utility methods
    getDaysUntil(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    }

    getMostRecentContact(stakeholders) {
        if (!stakeholders || stakeholders.length === 0) return 999;
        const contacts = stakeholders.map(s => {
            if (!s.last_contact) return 999;
            const date = new Date(s.last_contact);
            return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        });
        return Math.min(...contacts);
    }

    formatCurrency(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K';
        }
        return amount.toString();
    }
}

module.exports = ExecutiveReportGenerator;
