// Data Aggregation for Analytics and Reporting
// Aggregates pilot data for executive summaries and dashboards

class DataAggregator {
    constructor(db) {
        this.db = db;
    }

    /**
     * Get total pipeline value (sum of all active pilot ARR projections)
     */
    async getTotalPipelineValue() {
        const pilots = await this.db.getAllPilots();
        const activePilots = pilots.filter(p =>
            p.status === 'Active' || p.status === 'At Risk'
        );

        return activePilots.reduce((sum, pilot) => sum + (pilot.arr_projection || 0), 0);
    }

    /**
     * Calculate conversion rate from historical data
     */
    async getConversionRate() {
        const pilots = await this.db.getAllPilots();
        const completedPilots = pilots.filter(p =>
            p.status === 'Converted' || p.status === 'Lost' || p.status === 'Completed'
        );

        if (completedPilots.length === 0) return null;

        const converted = pilots.filter(p => p.status === 'Converted').length;
        return {
            rate: (converted / completedPilots.length) * 100,
            converted: converted,
            total: completedPilots.length,
            lost: completedPilots.length - converted
        };
    }

    /**
     * Calculate average time to close for converted pilots
     */
    async getAverageTimeToClose() {
        const pilots = await this.db.getAllPilots();
        const convertedPilots = pilots.filter(p => p.status === 'Converted');

        if (convertedPilots.length === 0) return null;

        const totalDays = convertedPilots.reduce((sum, pilot) => {
            const start = new Date(pilot.start_date);
            const end = new Date(pilot.end_date);
            const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);

        return Math.round(totalDays / convertedPilots.length);
    }

    /**
     * Get top performing industries by conversion rate
     */
    async getTopPerformingIndustries() {
        const pilots = await this.db.getAllPilots();
        const industryStats = {};

        pilots.forEach(pilot => {
            if (!industryStats[pilot.industry]) {
                industryStats[pilot.industry] = {
                    total: 0,
                    converted: 0,
                    active: 0,
                    totalValue: 0
                };
            }

            industryStats[pilot.industry].total++;
            industryStats[pilot.industry].totalValue += pilot.arr_projection || 0;

            if (pilot.status === 'Converted') {
                industryStats[pilot.industry].converted++;
            } else if (pilot.status === 'Active' || pilot.status === 'At Risk') {
                industryStats[pilot.industry].active++;
            }
        });

        // Calculate conversion rates and sort
        const industries = Object.entries(industryStats).map(([industry, stats]) => {
            const completedPilots = stats.total - stats.active;
            return {
                industry,
                conversionRate: completedPilots > 0 ? (stats.converted / completedPilots) * 100 : 0,
                totalPilots: stats.total,
                activePilots: stats.active,
                convertedPilots: stats.converted,
                totalValue: stats.totalValue,
                avgValue: Math.round(stats.totalValue / stats.total)
            };
        });

        return industries.sort((a, b) => b.conversionRate - a.conversionRate);
    }

    /**
     * Get distribution of pilots by risk level
     */
    async getRiskDistribution() {
        const pilots = await this.db.getAllPilots();

        const distribution = {
            strong: { count: 0, value: 0, pilots: [] },      // conversion_probability >= 80
            moderate: { count: 0, value: 0, pilots: [] },    // 60-79
            at_risk: { count: 0, value: 0, pilots: [] },     // 40-59
            critical: { count: 0, value: 0, pilots: [] }     // < 40
        };

        pilots.forEach(pilot => {
            // Only consider active pilots for risk distribution
            if (pilot.status !== 'Active' && pilot.status !== 'At Risk') return;

            const probability = pilot.conversion_probability || 50;
            let category;

            if (probability >= 80) category = 'strong';
            else if (probability >= 60) category = 'moderate';
            else if (probability >= 40) category = 'at_risk';
            else category = 'critical';

            distribution[category].count++;
            distribution[category].value += pilot.arr_projection || 0;
            distribution[category].pilots.push({
                id: pilot.id,
                company: pilot.company_name,
                value: pilot.arr_projection,
                probability: probability
            });
        });

        return distribution;
    }

    /**
     * Get monthly pipeline trends
     */
    async getPipelineTrends(months = 6) {
        const pilots = await this.db.getAllPilots();
        const trends = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

            const activePilots = pilots.filter(p => {
                const start = new Date(p.start_date);
                const end = new Date(p.end_date);
                return start <= targetDate && end >= targetDate;
            });

            const pipelineValue = activePilots.reduce((sum, p) => sum + (p.arr_projection || 0), 0);
            const avgHealthScore = activePilots.length > 0
                ? activePilots.reduce((sum, p) => sum + (p.health_score || 0), 0) / activePilots.length
                : 0;

            trends.push({
                month: monthName,
                date: targetDate.toISOString().split('T')[0],
                activePilots: activePilots.length,
                pipelineValue: pipelineValue,
                avgHealthScore: Math.round(avgHealthScore)
            });
        }

        return trends;
    }

    /**
     * Get success criteria completion statistics
     */
    async getCriteriaCompletionStats() {
        const pilots = await this.db.getAllPilots();
        const activePilots = pilots.filter(p =>
            p.status === 'Active' || p.status === 'At Risk'
        );

        const stats = {
            totalCriteria: 0,
            achieved: 0,
            inProgress: 0,
            atRisk: 0,
            notStarted: 0,
            avgCompletionRate: 0
        };

        let totalCompletionRate = 0;

        for (const pilot of activePilots) {
            const criteria = await this.db.getSuccessCriteria(pilot.id);
            stats.totalCriteria += criteria.length;

            criteria.forEach(c => {
                switch (c.status) {
                    case 'Achieved':
                        stats.achieved++;
                        break;
                    case 'In Progress':
                        stats.inProgress++;
                        break;
                    case 'At Risk':
                        stats.atRisk++;
                        break;
                    case 'Not Started':
                        stats.notStarted++;
                        break;
                }
            });

            // Calculate completion rate for this pilot
            if (criteria.length > 0) {
                const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
                const achievedWeight = criteria
                    .filter(c => c.status === 'Achieved')
                    .reduce((sum, c) => sum + c.weight, 0);
                totalCompletionRate += (achievedWeight / totalWeight) * 100;
            }
        }

        stats.avgCompletionRate = activePilots.length > 0
            ? Math.round(totalCompletionRate / activePilots.length)
            : 0;

        return stats;
    }

    /**
     * Get stakeholder engagement overview
     */
    async getStakeholderEngagementOverview() {
        const pilots = await this.db.getAllPilots();
        const activePilots = pilots.filter(p =>
            p.status === 'Active' || p.status === 'At Risk'
        );

        const engagement = {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            unresponsive: 0,
            avgStakeholdersPerPilot: 0,
            pilotsNeedingAttention: []
        };

        for (const pilot of activePilots) {
            const stakeholders = await this.db.getStakeholders(pilot.id);
            engagement.total += stakeholders.length;

            stakeholders.forEach(s => {
                engagement[s.engagement_level.toLowerCase()]++;
            });

            // Check for pilots needing attention (all stakeholders low/unresponsive)
            const needsAttention = stakeholders.every(s =>
                s.engagement_level === 'Low' || s.engagement_level === 'Unresponsive'
            );

            if (needsAttention && stakeholders.length > 0) {
                engagement.pilotsNeedingAttention.push({
                    pilotId: pilot.id,
                    company: pilot.company_name,
                    stakeholderCount: stakeholders.length
                });
            }
        }

        engagement.avgStakeholdersPerPilot = activePilots.length > 0
            ? Math.round((engagement.total / activePilots.length) * 10) / 10
            : 0;

        return engagement;
    }

    /**
     * Get pilots by status breakdown
     */
    async getPilotsByStatus() {
        const pilots = await this.db.getAllPilots();
        const statusBreakdown = {
            active: { count: 0, value: 0 },
            at_risk: { count: 0, value: 0 },
            completed: { count: 0, value: 0 },
            converted: { count: 0, value: 0 },
            lost: { count: 0, value: 0 }
        };

        pilots.forEach(pilot => {
            const key = pilot.status.toLowerCase().replace(' ', '_');
            if (statusBreakdown[key]) {
                statusBreakdown[key].count++;
                statusBreakdown[key].value += pilot.arr_projection || 0;
            }
        });

        return statusBreakdown;
    }

    /**
     * Get projected quarterly revenue
     */
    async getQuarterlyRevenueForecast() {
        const pilots = await this.db.getAllPilots();
        const now = new Date();

        const quarters = [];
        for (let i = 0; i < 4; i++) {
            const quarterStart = new Date(now.getFullYear(), now.getMonth() + (i * 3), 1);
            const quarterEnd = new Date(now.getFullYear(), now.getMonth() + ((i + 1) * 3), 0);
            const quarterName = `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear()}`;

            const pilotsEndingInQuarter = pilots.filter(p => {
                const endDate = new Date(p.end_date);
                return endDate >= quarterStart && endDate <= quarterEnd &&
                       (p.status === 'Active' || p.status === 'At Risk');
            });

            const projectedRevenue = pilotsEndingInQuarter.reduce((sum, p) => {
                const probability = (p.conversion_probability || 50) / 100;
                return sum + (p.arr_projection * probability);
            }, 0);

            quarters.push({
                quarter: quarterName,
                startDate: quarterStart.toISOString().split('T')[0],
                endDate: quarterEnd.toISOString().split('T')[0],
                pilotsClosing: pilotsEndingInQuarter.length,
                projectedRevenue: Math.round(projectedRevenue),
                bestCase: pilotsEndingInQuarter.reduce((sum, p) => sum + p.arr_projection, 0),
                pilots: pilotsEndingInQuarter.map(p => ({
                    company: p.company_name,
                    value: p.arr_projection,
                    probability: p.conversion_probability
                }))
            });
        }

        return quarters;
    }
}

module.exports = DataAggregator;
