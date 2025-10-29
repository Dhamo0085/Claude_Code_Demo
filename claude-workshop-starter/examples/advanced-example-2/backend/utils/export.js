// Export Utilities
// Export data to CSV, JSON, and generate PDF reports

class ExportUtilities {
    constructor(db) {
        this.db = db;
    }

    /**
     * Export pilots to CSV format
     */
    async exportToCSV(pilots) {
        if (!pilots || pilots.length === 0) {
            return '';
        }

        // Define headers
        const headers = [
            'ID',
            'Company Name',
            'Industry',
            'Start Date',
            'End Date',
            'Status',
            'Health Score',
            'Contract Value',
            'ARR Projection',
            'Conversion Probability',
            'Primary Contact'
        ];

        // Build CSV rows
        const rows = [headers.join(',')];

        pilots.forEach(pilot => {
            const row = [
                pilot.id,
                this.escapeCSV(pilot.company_name),
                this.escapeCSV(pilot.industry),
                pilot.start_date,
                pilot.end_date,
                this.escapeCSV(pilot.status),
                pilot.health_score || 0,
                pilot.contract_value || 0,
                pilot.arr_projection || 0,
                pilot.conversion_probability || 0,
                this.escapeCSV(pilot.primary_contact)
            ];
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    /**
     * Export pilots with details to CSV (includes criteria and stakeholders)
     */
    async exportDetailedCSV(pilotIds) {
        const rows = [];
        const headers = [
            'Pilot ID',
            'Company',
            'Industry',
            'Status',
            'Health Score',
            'ARR Projection',
            'Conversion Probability',
            'Success Criteria',
            'Criteria Status',
            'Stakeholder',
            'Stakeholder Role',
            'Engagement Level'
        ];
        rows.push(headers.join(','));

        for (const pilotId of pilotIds) {
            const pilot = await this.db.getPilotById(pilotId);
            if (!pilot) continue;

            const criteria = await this.db.getSuccessCriteria(pilotId);
            const stakeholders = await this.db.getStakeholders(pilotId);

            // If no criteria or stakeholders, still add pilot row
            if (criteria.length === 0 && stakeholders.length === 0) {
                const row = [
                    pilot.id,
                    this.escapeCSV(pilot.company_name),
                    this.escapeCSV(pilot.industry),
                    pilot.status,
                    pilot.health_score,
                    pilot.arr_projection,
                    pilot.conversion_probability,
                    '',
                    '',
                    '',
                    '',
                    ''
                ];
                rows.push(row.join(','));
            } else {
                // Create a row for each combination of criteria and stakeholder
                const maxRows = Math.max(criteria.length, stakeholders.length);
                for (let i = 0; i < maxRows; i++) {
                    const criterion = criteria[i] || {};
                    const stakeholder = stakeholders[i] || {};

                    const row = [
                        pilot.id,
                        this.escapeCSV(pilot.company_name),
                        this.escapeCSV(pilot.industry),
                        pilot.status,
                        pilot.health_score,
                        pilot.arr_projection,
                        pilot.conversion_probability,
                        this.escapeCSV(criterion.criteria || ''),
                        this.escapeCSV(criterion.status || ''),
                        this.escapeCSV(stakeholder.name || ''),
                        this.escapeCSV(stakeholder.role || ''),
                        this.escapeCSV(stakeholder.engagement_level || '')
                    ];
                    rows.push(row.join(','));
                }
            }
        }

        return rows.join('\n');
    }

    /**
     * Export data to JSON format
     */
    exportToJSON(data) {
        return JSON.stringify(data, null, 2);
    }

    /**
     * Generate text-based PDF report (simple formatted text)
     */
    async generatePDFReport(executiveSummary) {
        // Generate a text-based report that can be converted to PDF
        const lines = [];

        lines.push('═'.repeat(80));
        lines.push('PILOT PROGRAM EXECUTIVE REPORT');
        lines.push('═'.repeat(80));
        lines.push('');
        lines.push(`Generated: ${new Date(executiveSummary.generatedAt).toLocaleString()}`);
        lines.push('');

        // Overview Section
        lines.push('─'.repeat(80));
        lines.push('EXECUTIVE OVERVIEW');
        lines.push('─'.repeat(80));
        lines.push('');
        lines.push(`Active Pilots:              ${executiveSummary.overview.activePilots}`);
        lines.push(`Total Pipeline Value:       $${this.formatCurrency(executiveSummary.overview.totalPipelineValue)}`);
        lines.push(`Projected Conversions:      $${this.formatCurrency(executiveSummary.overview.projectedConversions)}`);
        lines.push(`At-Risk Pilots:             ${executiveSummary.overview.atRiskCount}`);

        if (executiveSummary.overview.conversionRate) {
            lines.push(`Historical Conversion Rate: ${executiveSummary.overview.conversionRate}%`);
        }
        if (executiveSummary.overview.avgTimeToClose) {
            lines.push(`Avg Time to Close:          ${executiveSummary.overview.avgTimeToClose} days`);
        }
        lines.push('');

        // Highlights
        if (executiveSummary.highlights && executiveSummary.highlights.length > 0) {
            lines.push('─'.repeat(80));
            lines.push('KEY HIGHLIGHTS');
            lines.push('─'.repeat(80));
            lines.push('');
            executiveSummary.highlights.forEach((highlight, index) => {
                lines.push(`${index + 1}. ${highlight}`);
            });
            lines.push('');
        }

        // Risk Distribution
        lines.push('─'.repeat(80));
        lines.push('RISK DISTRIBUTION');
        lines.push('─'.repeat(80));
        lines.push('');
        lines.push(`Strong    (80%+):  ${executiveSummary.riskDistribution.strong} pilots`);
        lines.push(`Moderate  (60-79%): ${executiveSummary.riskDistribution.moderate} pilots`);
        lines.push(`At Risk   (40-59%): ${executiveSummary.riskDistribution.at_risk} pilots`);
        lines.push(`Critical  (<40%):   ${executiveSummary.riskDistribution.critical} pilots`);
        lines.push('');

        // Top Opportunities
        if (executiveSummary.topOpportunities && executiveSummary.topOpportunities.length > 0) {
            lines.push('─'.repeat(80));
            lines.push('TOP OPPORTUNITIES');
            lines.push('─'.repeat(80));
            lines.push('');

            executiveSummary.topOpportunities.slice(0, 5).forEach((opp, index) => {
                lines.push(`${index + 1}. ${opp.company}`);
                lines.push(`   ARR Value:              $${this.formatCurrency(opp.arrValue)}`);
                lines.push(`   Conversion Probability: ${opp.conversionProbability}%`);
                lines.push(`   Expected Value:         $${this.formatCurrency(opp.expectedValue)}`);
                lines.push(`   Health Score:           ${opp.healthScore}%`);
                lines.push(`   Days Remaining:         ${opp.daysRemaining}`);
                lines.push('');
            });
        }

        // Quarterly Forecast
        if (executiveSummary.quarterlyForecast && executiveSummary.quarterlyForecast.length > 0) {
            lines.push('─'.repeat(80));
            lines.push('QUARTERLY REVENUE FORECAST');
            lines.push('─'.repeat(80));
            lines.push('');

            executiveSummary.quarterlyForecast.forEach(quarter => {
                lines.push(`${quarter.quarter}:`);
                lines.push(`   Pilots Closing:       ${quarter.pilotsClosing}`);
                lines.push(`   Projected Revenue:    $${this.formatCurrency(quarter.projectedRevenue)}`);
                lines.push(`   Best Case Scenario:   $${this.formatCurrency(quarter.bestCase)}`);
                lines.push('');
            });
        }

        // Action Items
        if (executiveSummary.actionItems && executiveSummary.actionItems.length > 0) {
            lines.push('─'.repeat(80));
            lines.push('ACTION ITEMS');
            lines.push('─'.repeat(80));
            lines.push('');

            const urgent = executiveSummary.actionItems.filter(a => a.priority === 'urgent');
            const high = executiveSummary.actionItems.filter(a => a.priority === 'high');
            const medium = executiveSummary.actionItems.filter(a => a.priority === 'medium');

            if (urgent.length > 0) {
                lines.push('URGENT:');
                urgent.forEach(action => {
                    lines.push(`  ⚠️  ${action.action}`);
                    if (action.details) lines.push(`      ${action.details}`);
                });
                lines.push('');
            }

            if (high.length > 0) {
                lines.push('HIGH PRIORITY:');
                high.forEach(action => {
                    lines.push(`  •  ${action.action}`);
                    if (action.details) lines.push(`     ${action.details}`);
                });
                lines.push('');
            }

            if (medium.length > 0) {
                lines.push('MEDIUM PRIORITY:');
                medium.forEach(action => {
                    lines.push(`  •  ${action.action}`);
                });
                lines.push('');
            }
        }

        lines.push('═'.repeat(80));
        lines.push('END OF REPORT');
        lines.push('═'.repeat(80));

        return lines.join('\n');
    }

    /**
     * Generate pipeline summary CSV
     */
    async generatePipelineSummaryCSV() {
        const pilots = await this.db.getAllPilots();

        const summary = {
            totalPilots: pilots.length,
            byStatus: {},
            byIndustry: {},
            totalPipelineValue: 0,
            totalConvertedValue: 0
        };

        // Aggregate data
        pilots.forEach(pilot => {
            // By status
            if (!summary.byStatus[pilot.status]) {
                summary.byStatus[pilot.status] = { count: 0, value: 0 };
            }
            summary.byStatus[pilot.status].count++;
            summary.byStatus[pilot.status].value += pilot.arr_projection || 0;

            // By industry
            if (!summary.byIndustry[pilot.industry]) {
                summary.byIndustry[pilot.industry] = { count: 0, value: 0 };
            }
            summary.byIndustry[pilot.industry].count++;
            summary.byIndustry[pilot.industry].value += pilot.arr_projection || 0;

            // Totals
            if (pilot.status === 'Active' || pilot.status === 'At Risk') {
                summary.totalPipelineValue += pilot.arr_projection || 0;
            }
            if (pilot.status === 'Converted') {
                summary.totalConvertedValue += pilot.arr_projection || 0;
            }
        });

        // Build CSV
        const rows = [];
        rows.push('Metric,Value');
        rows.push(`Total Pilots,${summary.totalPilots}`);
        rows.push(`Total Pipeline Value,$${summary.totalPipelineValue}`);
        rows.push(`Total Converted Value,$${summary.totalConvertedValue}`);
        rows.push('');
        rows.push('Status,Count,Value');
        Object.entries(summary.byStatus).forEach(([status, data]) => {
            rows.push(`${status},${data.count},$${data.value}`);
        });
        rows.push('');
        rows.push('Industry,Count,Value');
        Object.entries(summary.byIndustry).forEach(([industry, data]) => {
            rows.push(`${industry},${data.count},$${data.value}`);
        });

        return rows.join('\n');
    }

    // Helper methods
    escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    formatCurrency(amount) {
        if (!amount) return '0';
        return amount.toLocaleString('en-US');
    }
}

module.exports = ExportUtilities;
