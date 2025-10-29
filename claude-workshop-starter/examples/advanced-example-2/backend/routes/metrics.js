const express = require('express');
const router = express.Router();
const { calculateHealthScore } = require('../utils/calculator');

module.exports = (db) => {
  // GET /api/metrics/:pilotId - Get all metrics for a pilot
  router.get('/:pilotId', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.pilotId);

      // Verify pilot exists
      const pilot = await db.getPilotById(pilotId);
      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      const metrics = await db.getMetrics(pilotId);

      // Group metrics by type
      const groupedMetrics = metrics.reduce((acc, metric) => {
        const type = metric.metric_type || 'other';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(metric);
        return acc;
      }, {});

      res.json({
        success: true,
        pilot_id: pilotId,
        count: metrics.length,
        data: metrics,
        grouped: groupedMetrics
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch metrics',
        message: error.message
      });
    }
  });

  // GET /api/metrics/:pilotId/type/:type - Get metrics by type
  router.get('/:pilotId/type/:type', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.pilotId);
      const metricType = req.params.type;

      // Verify pilot exists
      const pilot = await db.getPilotById(pilotId);
      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      const metrics = await db.getMetricsByType(pilotId, metricType);

      res.json({
        success: true,
        pilot_id: pilotId,
        metric_type: metricType,
        count: metrics.length,
        data: metrics
      });
    } catch (error) {
      console.error('Error fetching metrics by type:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch metrics',
        message: error.message
      });
    }
  });

  // POST /api/metrics - Add new metric
  router.post('/', async (req, res) => {
    try {
      const metricData = req.body;

      // Validate required fields
      const requiredFields = ['pilot_id', 'metric_name', 'metric_value'];
      const missingFields = requiredFields.filter(field => !metricData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          missingFields: missingFields
        });
      }

      // Verify pilot exists
      const pilot = await db.getPilotById(metricData.pilot_id);
      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      // Create metric
      const metric = await db.createMetric(metricData);

      res.status(201).json({
        success: true,
        message: 'Metric added successfully',
        data: metric
      });
    } catch (error) {
      console.error('Error adding metric:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add metric',
        message: error.message
      });
    }
  });

  // POST /api/metrics/batch - Add multiple metrics at once
  router.post('/batch', async (req, res) => {
    try {
      const { pilot_id, metrics } = req.body;

      if (!pilot_id || !Array.isArray(metrics) || metrics.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request format',
          message: 'Provide pilot_id and array of metrics'
        });
      }

      // Verify pilot exists
      const pilot = await db.getPilotById(pilot_id);
      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      // Create all metrics
      const createdMetrics = await Promise.all(
        metrics.map(metric =>
          db.createMetric({
            pilot_id,
            ...metric
          })
        )
      );

      res.status(201).json({
        success: true,
        message: `${createdMetrics.length} metrics added successfully`,
        data: createdMetrics
      });
    } catch (error) {
      console.error('Error adding batch metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add metrics',
        message: error.message
      });
    }
  });

  // GET /api/metrics/:pilotId/calculate - Calculate and update health score
  router.get('/:pilotId/calculate', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.pilotId);

      // Verify pilot exists
      const pilot = await db.getPilotById(pilotId);
      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      // Get related data
      const [criteria, metrics] = await Promise.all([
        db.getSuccessCriteria(pilotId),
        db.getMetrics(pilotId)
      ]);

      // Calculate new health score
      const newHealthScore = calculateHealthScore(pilot, criteria, metrics);

      // Update pilot
      await db.updatePilot(pilotId, { health_score: newHealthScore });

      res.json({
        success: true,
        message: 'Health score calculated and updated',
        data: {
          pilot_id: pilotId,
          previous_health_score: pilot.health_score,
          new_health_score: newHealthScore,
          change: newHealthScore - pilot.health_score
        }
      });
    } catch (error) {
      console.error('Error calculating health score:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate health score',
        message: error.message
      });
    }
  });

  // GET /api/metrics/:pilotId/summary - Get metrics summary
  router.get('/:pilotId/summary', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.pilotId);

      // Verify pilot exists
      const pilot = await db.getPilotById(pilotId);
      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      const metrics = await db.getMetrics(pilotId);

      // Calculate summary statistics
      const summary = {
        total_metrics: metrics.length,
        by_type: {},
        recent_activity: [],
        trends: {}
      };

      // Group by type and count
      metrics.forEach(metric => {
        const type = metric.metric_type || 'other';
        if (!summary.by_type[type]) {
          summary.by_type[type] = { count: 0, metrics: [] };
        }
        summary.by_type[type].count++;
        summary.by_type[type].metrics.push(metric);
      });

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      summary.recent_activity = metrics.filter(m => {
        const recordedDate = new Date(m.recorded_at);
        return recordedDate >= sevenDaysAgo;
      });

      // Calculate trends for numeric metrics
      Object.keys(summary.by_type).forEach(type => {
        const typeMetrics = summary.by_type[type].metrics
          .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

        if (typeMetrics.length >= 2) {
          const latest = typeMetrics[typeMetrics.length - 1];
          const previous = typeMetrics[typeMetrics.length - 2];

          // Try to parse as numbers for trend calculation
          const latestValue = parseFloat(latest.metric_value);
          const previousValue = parseFloat(previous.metric_value);

          if (!isNaN(latestValue) && !isNaN(previousValue)) {
            const change = latestValue - previousValue;
            const percentChange = previousValue !== 0
              ? ((change / previousValue) * 100).toFixed(2)
              : 0;

            summary.trends[type] = {
              direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
              change: change,
              percent_change: percentChange,
              latest_value: latestValue,
              previous_value: previousValue
            };
          }
        }
      });

      res.json({
        success: true,
        pilot_id: pilotId,
        data: summary
      });
    } catch (error) {
      console.error('Error generating metrics summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate metrics summary',
        message: error.message
      });
    }
  });

  // DELETE /api/metrics/:id - Delete a metric
  router.delete('/:id', async (req, res) => {
    try {
      const metricId = parseInt(req.params.id);

      const result = await db.run('DELETE FROM metrics WHERE id = ?', [metricId]);

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          error: 'Metric not found'
        });
      }

      res.json({
        success: true,
        message: 'Metric deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting metric:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete metric',
        message: error.message
      });
    }
  });

  return router;
};
