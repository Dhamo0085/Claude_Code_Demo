// Reports API Routes
// Endpoints for analytics, reporting, and data export

const express = require('express');
const router = express.Router();

const ConversionPredictor = require('../analytics/predictor');
const DataAggregator = require('../analytics/aggregator');
const ValueCalculator = require('../analytics/value-calculator');
const ExecutiveReportGenerator = require('../reports/executive-template');
const StakeholderUpdateGenerator = require('../reports/stakeholder-updates');
const ExportUtilities = require('../utils/export');

// Initialize services
let db;
let predictor;
let aggregator;
let valueCalculator;
let executiveGenerator;
let stakeholderGenerator;
let exportUtils;

// Initialize with database instance
function initialize(database) {
    db = database;
    predictor = new ConversionPredictor(db);
    aggregator = new DataAggregator(db);
    valueCalculator = new ValueCalculator(db);
    executiveGenerator = new ExecutiveReportGenerator(db);
    stakeholderGenerator = new StakeholderUpdateGenerator(db);
    exportUtils = new ExportUtilities(db);
}

/**
 * GET /api/reports/executive
 * Generate full executive summary report
 */
router.get('/executive', async (req, res) => {
    try {
        const report = await executiveGenerator.generateExecutiveSummary();
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating executive report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/pipeline
 * Get pipeline analysis and trends
 */
router.get('/pipeline', async (req, res) => {
    try {
        const [
            totalValue,
            conversionRate,
            avgTimeToClose,
            industries,
            riskDistribution,
            trends,
            statusBreakdown
        ] = await Promise.all([
            aggregator.getTotalPipelineValue(),
            aggregator.getConversionRate(),
            aggregator.getAverageTimeToClose(),
            aggregator.getTopPerformingIndustries(),
            aggregator.getRiskDistribution(),
            aggregator.getPipelineTrends(6),
            aggregator.getPilotsByStatus()
        ]);

        res.json({
            success: true,
            data: {
                totalPipelineValue: Math.round(totalValue),
                conversionRate: conversionRate,
                avgTimeToClose: avgTimeToClose,
                topIndustries: industries,
                riskDistribution: riskDistribution,
                trends: trends,
                statusBreakdown: statusBreakdown
            }
        });
    } catch (error) {
        console.error('Error generating pipeline report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/conversion-forecast
 * Get revenue forecast with conversion probabilities
 */
router.get('/conversion-forecast', async (req, res) => {
    try {
        const [
            quarterlyForecast,
            riskDistribution,
            totalPipeline
        ] = await Promise.all([
            aggregator.getQuarterlyRevenueForecast(),
            aggregator.getRiskDistribution(),
            aggregator.getTotalPipelineValue()
        ]);

        // Calculate weighted forecast
        const weightedForecast = Object.entries(riskDistribution).reduce((sum, [category, data]) => {
            const probability = category === 'strong' ? 0.85 :
                              category === 'moderate' ? 0.65 :
                              category === 'at_risk' ? 0.45 : 0.25;
            return sum + (data.value * probability);
        }, 0);

        res.json({
            success: true,
            data: {
                quarterlyForecast: quarterlyForecast,
                totalPipeline: Math.round(totalPipeline),
                weightedForecast: Math.round(weightedForecast),
                riskDistribution: riskDistribution,
                confidence: {
                    high: Math.round(riskDistribution.strong.value),
                    medium: Math.round(riskDistribution.moderate.value),
                    low: Math.round(riskDistribution.at_risk.value + riskDistribution.critical.value)
                }
            }
        });
    } catch (error) {
        console.error('Error generating conversion forecast:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/pilot/:id/prediction
 * Get conversion prediction for specific pilot
 */
router.get('/pilot/:id/prediction', async (req, res) => {
    try {
        const pilotId = parseInt(req.params.id);
        const pilot = await db.getPilotById(pilotId);

        if (!pilot) {
            return res.status(404).json({
                success: false,
                error: 'Pilot not found'
            });
        }

        const [criteria, stakeholders] = await Promise.all([
            db.getSuccessCriteria(pilotId),
            db.getStakeholders(pilotId)
        ]);

        const prediction = await predictor.predictConversion(pilot, criteria, stakeholders);

        res.json({
            success: true,
            data: {
                pilotId: pilotId,
                company: pilot.company_name,
                prediction: prediction
            }
        });
    } catch (error) {
        console.error('Error generating prediction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/pilot/:id/value-analysis
 * Get financial value analysis for specific pilot
 */
router.get('/pilot/:id/value-analysis', async (req, res) => {
    try {
        const pilotId = parseInt(req.params.id);
        const pilot = await db.getPilotById(pilotId);

        if (!pilot) {
            return res.status(404).json({
                success: false,
                error: 'Pilot not found'
            });
        }

        const pilotCost = parseInt(req.query.pilotCost) || 50000;

        const [
            roi,
            annualProjection,
            payback,
            expansion,
            ltv
        ] = await Promise.all([
            Promise.resolve(valueCalculator.calculateROI(pilot, pilotCost)),
            Promise.resolve(valueCalculator.projectAnnualValue(pilot, 5)),
            Promise.resolve(valueCalculator.calculatePaybackPeriod(pilot, pilotCost)),
            valueCalculator.estimateExpansionPotential(pilot),
            Promise.resolve(valueCalculator.calculateCustomerLifetimeValue(pilot))
        ]);

        res.json({
            success: true,
            data: {
                pilotId: pilotId,
                company: pilot.company_name,
                arrProjection: pilot.arr_projection,
                roi: roi,
                annualProjection: annualProjection,
                payback: payback,
                expansion: expansion,
                lifetimeValue: ltv
            }
        });
    } catch (error) {
        console.error('Error generating value analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/stakeholder-updates/:pilotId/weekly
 * Generate weekly update for stakeholders
 */
router.get('/stakeholder-updates/:pilotId/weekly', async (req, res) => {
    try {
        const pilotId = parseInt(req.params.pilotId);
        const update = await stakeholderGenerator.generateWeeklyUpdate(pilotId);

        res.json({
            success: true,
            data: update
        });
    } catch (error) {
        console.error('Error generating weekly update:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/stakeholder-updates/:pilotId/progress
 * Generate comprehensive progress report
 */
router.get('/stakeholder-updates/:pilotId/progress', async (req, res) => {
    try {
        const pilotId = parseInt(req.params.pilotId);
        const report = await stakeholderGenerator.generateProgressReport(pilotId);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating progress report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/reports/stakeholder-updates/:pilotId/email
 * Format update as email
 */
router.post('/stakeholder-updates/:pilotId/email', async (req, res) => {
    try {
        const pilotId = parseInt(req.params.pilotId);
        const updateData = req.body.updateData || await stakeholderGenerator.generateWeeklyUpdate(pilotId);

        const email = await stakeholderGenerator.formatUpdateEmail(pilotId, updateData);

        res.json({
            success: true,
            data: email
        });
    } catch (error) {
        console.error('Error formatting email:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/analytics/overview
 * Get comprehensive analytics overview
 */
router.get('/analytics/overview', async (req, res) => {
    try {
        const [
            criteriaStats,
            stakeholderEngagement,
            industries,
            statusBreakdown
        ] = await Promise.all([
            aggregator.getCriteriaCompletionStats(),
            aggregator.getStakeholderEngagementOverview(),
            aggregator.getTopPerformingIndustries(),
            aggregator.getPilotsByStatus()
        ]);

        res.json({
            success: true,
            data: {
                criteriaCompletion: criteriaStats,
                stakeholderEngagement: stakeholderEngagement,
                industryPerformance: industries,
                statusBreakdown: statusBreakdown
            }
        });
    } catch (error) {
        console.error('Error generating analytics overview:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/export/csv
 * Export all pilots to CSV
 */
router.get('/export/csv', async (req, res) => {
    try {
        const pilots = await db.getAllPilots();
        const csv = await exportUtils.exportToCSV(pilots);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=pilots-export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/export/detailed-csv
 * Export pilots with details to CSV
 */
router.get('/export/detailed-csv', async (req, res) => {
    try {
        const pilots = await db.getAllPilots();
        const pilotIds = pilots.map(p => p.id);
        const csv = await exportUtils.exportDetailedCSV(pilotIds);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=pilots-detailed-export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting detailed CSV:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/export/json
 * Export executive report to JSON
 */
router.get('/export/json', async (req, res) => {
    try {
        const report = await executiveGenerator.generateExecutiveSummary();
        const json = exportUtils.exportToJSON(report);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=executive-report.json');
        res.send(json);
    } catch (error) {
        console.error('Error exporting to JSON:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/export/pdf
 * Export executive report as formatted text (PDF-ready)
 */
router.get('/export/pdf', async (req, res) => {
    try {
        const report = await executiveGenerator.generateExecutiveSummary();
        const pdfText = await exportUtils.generatePDFReport(report);

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=executive-report.txt');
        res.send(pdfText);
    } catch (error) {
        console.error('Error generating PDF report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/export/pipeline-summary
 * Export pipeline summary CSV
 */
router.get('/export/pipeline-summary', async (req, res) => {
    try {
        const csv = await exportUtils.generatePipelineSummaryCSV();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=pipeline-summary.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting pipeline summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = {
    router,
    initialize
};
