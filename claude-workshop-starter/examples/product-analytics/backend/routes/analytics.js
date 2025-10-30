/**
 * Analytics API Routes
 *
 * Advanced analytics endpoints for funnels, retention, user journeys,
 * feature adoption, and A/B test analysis.
 */

const express = require('express');
const FunnelAnalyzer = require('../analytics/funnel-analyzer');
const CohortRetention = require('../analytics/cohort-retention');
const JourneyMapper = require('../analytics/journey-mapper');
const FeatureAdoption = require('../analytics/feature-adoption');

/**
 * Creates and configures the analytics router
 * @param {Database} db - Database instance
 * @returns {express.Router} Configured Express router
 */
module.exports = function(db) {
  const router = express.Router();

  // Initialize analytics modules
  const funnelAnalyzer = new FunnelAnalyzer(db);
  const cohortRetention = new CohortRetention(db);
  const journeyMapper = new JourneyMapper(db);
  const featureAdoption = new FeatureAdoption(db);

  /**
   * GET /api/analytics/funnels/:funnelId
   *
   * Analyze a predefined funnel for conversion rates and drop-offs
   *
   * Path parameters:
   * - funnelId: ID of the funnel to analyze
   *
   * Query parameters:
   * - start_date: Start date (ISO format)
   * - end_date: End date (ISO format)
   * - cohort_id: Filter by cohort (optional)
   * - breakdown: Property to breakdown by (device_type, country, browser)
   * - include_timings: Include average time between steps (true/false)
   *
   * Response: {
   *   success: true,
   *   funnel: {
   *     id, name, description,
   *     steps: [{step, event_name, user_count, conversion_rate, drop_off_count, drop_off_rate}],
   *     overall_conversion: number,
   *     timings: [...] (if requested),
   *     breakdown: {...} (if requested)
   *   }
   * }
   */
  router.get('/funnels/:funnelId', async (req, res) => {
    try {
      const { funnelId } = req.params;
      const {
        start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date = new Date().toISOString(),
        cohort_id,
        breakdown,
        include_timings = 'false'
      } = req.query;

      // Get funnel definition
      const funnel = await db.get(
        'SELECT * FROM funnels WHERE id = ?',
        [funnelId]
      );

      if (!funnel) {
        return res.status(404).json({
          success: false,
          error: 'Funnel not found'
        });
      }

      // Parse funnel steps
      const steps = JSON.parse(funnel.steps);

      // Analyze funnel
      const analysis = await funnelAnalyzer.analyzeFunnel(
        steps,
        start_date,
        end_date,
        cohort_id
      );

      // Include timings if requested
      let timings;
      if (include_timings === 'true') {
        timings = await funnelAnalyzer.getStepTimings(
          steps,
          start_date,
          end_date
        );
      }

      // Include breakdown if requested
      let breakdownData;
      if (breakdown && ['device_type', 'country', 'browser'].includes(breakdown)) {
        breakdownData = await funnelAnalyzer.getFunnelBreakdown(
          steps,
          start_date,
          end_date,
          breakdown
        );
      }

      res.json({
        success: true,
        funnel: {
          id: funnel.id,
          name: funnel.name,
          description: funnel.description,
          ...analysis,
          timings: timings || undefined,
          breakdown: breakdownData || undefined
        }
      });

    } catch (error) {
      console.error('Error analyzing funnel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze funnel',
        message: error.message
      });
    }
  });

  /**
   * GET /api/analytics/retention
   *
   * Calculate cohort retention data
   *
   * Query parameters:
   * - start_date: Cohort start date (ISO format)
   * - end_date: Cohort end date (ISO format)
   * - period: Retention period (day, week, month) - default: week
   * - cohort_by: Group cohorts by (signup_date, feature, campaign) - default: signup_date
   * - retention_event: Event that counts as retention (default: any event)
   * - num_periods: Number of periods to track (default: 12)
   *
   * Response: {
   *   success: true,
   *   retention: {
   *     cohorts: [{
   *       cohort_name,
   *       cohort_size,
   *       periods: [{period, user_count, retention_rate}]
   *     }],
   *     overall_retention: [...]
   *   }
   * }
   */
  router.get('/retention', async (req, res) => {
    try {
      const {
        start_date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end_date = new Date().toISOString(),
        period = 'week',
        cohort_by = 'signup_date',
        retention_event,
        num_periods = 12
      } = req.query;

      // Validate period
      if (!['day', 'week', 'month'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Must be day, week, or month'
        });
      }

      const parsedNumPeriods = parseInt(num_periods) || 12;

      // Calculate retention
      const retentionData = await cohortRetention.calculateRetention(
        start_date,
        end_date,
        period,
        parsedNumPeriods,
        retention_event
      );

      res.json({
        success: true,
        retention: retentionData,
        parameters: {
          start_date,
          end_date,
          period,
          num_periods: parsedNumPeriods,
          retention_event: retention_event || 'any'
        }
      });

    } catch (error) {
      console.error('Error calculating retention:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate retention',
        message: error.message
      });
    }
  });

  /**
   * GET /api/analytics/journeys
   *
   * Analyze user journey patterns
   *
   * Query parameters:
   * - start_date: Start date (ISO format)
   * - end_date: End date (ISO format)
   * - start_event: Journey starting event (optional)
   * - end_event: Journey ending event (optional)
   * - max_steps: Maximum number of steps to analyze (default: 10)
   * - min_frequency: Minimum frequency threshold (default: 5)
   *
   * Response: {
   *   success: true,
   *   journeys: {
   *     common_paths: [{path, frequency, avg_duration, conversion_rate}],
   *     event_sequences: [{sequence, count}],
   *     drop_off_points: [...]
   *   }
   * }
   */
  router.get('/journeys', async (req, res) => {
    try {
      const {
        start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date = new Date().toISOString(),
        start_event,
        end_event,
        max_steps = 10,
        min_frequency = 5
      } = req.query;

      const parsedMaxSteps = parseInt(max_steps) || 10;
      const parsedMinFrequency = parseInt(min_frequency) || 5;

      // Get common paths
      const commonPaths = await journeyMapper.findCommonPaths(
        start_date,
        end_date,
        parsedMaxSteps,
        parsedMinFrequency
      );

      // Get event sequences
      const eventSequences = await journeyMapper.getEventSequences(
        start_date,
        end_date,
        start_event,
        end_event
      );

      // Get drop-off points
      const dropOffPoints = await journeyMapper.findDropOffPoints(
        start_date,
        end_date
      );

      res.json({
        success: true,
        journeys: {
          common_paths: commonPaths,
          event_sequences: eventSequences,
          drop_off_points: dropOffPoints
        },
        parameters: {
          start_date,
          end_date,
          max_steps: parsedMaxSteps,
          min_frequency: parsedMinFrequency
        }
      });

    } catch (error) {
      console.error('Error analyzing journeys:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze journeys',
        message: error.message
      });
    }
  });

  /**
   * GET /api/analytics/features/:featureId
   *
   * Analyze feature adoption and usage
   *
   * Path parameters:
   * - featureId: ID of the feature to analyze
   *
   * Query parameters:
   * - start_date: Start date (ISO format)
   * - end_date: End date (ISO format)
   * - cohort_id: Filter by cohort (optional)
   *
   * Response: {
   *   success: true,
   *   feature: {
   *     id, name, description, launch_date,
   *     adoption: {
   *       total_users: number,
   *       adopted_users: number,
   *       adoption_rate: number,
   *       daily_active_users: number,
   *       weekly_active_users: number,
   *       monthly_active_users: number
   *     },
   *     adoption_over_time: [...],
   *     adoption_by_cohort: {...}
   *   }
   * }
   */
  router.get('/features/:featureId', async (req, res) => {
    try {
      const { featureId } = req.params;
      const {
        start_date,
        end_date = new Date().toISOString(),
        cohort_id
      } = req.query;

      // Get feature definition
      const feature = await db.get(
        'SELECT * FROM features WHERE id = ?',
        [featureId]
      );

      if (!feature) {
        return res.status(404).json({
          success: false,
          error: 'Feature not found'
        });
      }

      // Use feature launch date as start date if not provided
      const analysisStartDate = start_date || feature.launch_date;

      // Calculate adoption metrics
      const adoption = await featureAdoption.calculateAdoption(
        featureId,
        feature.target_event,
        analysisStartDate,
        end_date
      );

      // Get adoption over time
      const adoptionOverTime = await featureAdoption.getAdoptionOverTime(
        featureId,
        feature.target_event,
        analysisStartDate,
        end_date,
        'day'
      );

      // Get adoption by cohort if available
      let adoptionByCohort;
      if (cohort_id) {
        adoptionByCohort = await featureAdoption.getAdoptionByCohort(
          feature.target_event,
          analysisStartDate,
          end_date,
          cohort_id
        );
      }

      res.json({
        success: true,
        feature: {
          id: feature.id,
          name: feature.name,
          description: feature.description,
          launch_date: feature.launch_date,
          target_event: feature.target_event,
          adoption: adoption,
          adoption_over_time: adoptionOverTime,
          adoption_by_cohort: adoptionByCohort || undefined
        }
      });

    } catch (error) {
      console.error('Error analyzing feature adoption:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze feature adoption',
        message: error.message
      });
    }
  });

  /**
   * GET /api/analytics/experiments/:experimentId
   *
   * Analyze A/B test experiment results
   *
   * Path parameters:
   * - experimentId: ID of the experiment to analyze
   *
   * Query parameters:
   * - start_date: Start date (ISO format, defaults to experiment start)
   * - end_date: End date (ISO format, defaults to experiment end or now)
   * - confidence_level: Statistical confidence level (default: 95)
   *
   * Response: {
   *   success: true,
   *   experiment: {
   *     id, name, description, status,
   *     variants: [{
   *       name,
   *       users: number,
   *       conversions: number,
   *       conversion_rate: number,
   *       avg_value: number
   *     }],
   *     winner: string,
   *     statistical_significance: boolean,
   *     confidence_level: number
   *   }
   * }
   */
  router.get('/experiments/:experimentId', async (req, res) => {
    try {
      const { experimentId } = req.params;
      const {
        start_date,
        end_date,
        confidence_level = 95
      } = req.query;

      // Get experiment definition
      const experiment = await db.get(
        'SELECT * FROM experiments WHERE id = ?',
        [experimentId]
      );

      if (!experiment) {
        return res.status(404).json({
          success: false,
          error: 'Experiment not found'
        });
      }

      // Use experiment dates if not provided
      const analysisStartDate = start_date || experiment.start_date;
      const analysisEndDate = end_date || experiment.end_date || new Date().toISOString();

      // Parse variants
      const variants = JSON.parse(experiment.variants);

      // Analyze each variant
      const variantResults = [];
      for (const variantName of variants) {
        // Get users in this variant
        const variantUsers = await db.all(
          `SELECT user_id FROM experiment_assignments
           WHERE experiment_id = ? AND variant = ?`,
          [experimentId, variantName]
        );

        const userIds = variantUsers.map(u => u.user_id);

        if (userIds.length === 0) {
          variantResults.push({
            name: variantName,
            users: 0,
            conversions: 0,
            conversion_rate: 0,
            avg_value: 0
          });
          continue;
        }

        // Get conversions (goal event)
        const conversions = await db.get(
          `SELECT COUNT(DISTINCT user_id) as count
           FROM events
           WHERE event_name = ?
           AND user_id IN (${userIds.map(() => '?').join(',')})
           AND timestamp BETWEEN ? AND ?`,
          [experiment.goal_event, ...userIds, analysisStartDate, analysisEndDate]
        );

        const conversionCount = conversions.count;
        const conversionRate = (conversionCount / userIds.length) * 100;

        variantResults.push({
          name: variantName,
          users: userIds.length,
          conversions: conversionCount,
          conversion_rate: Math.round(conversionRate * 100) / 100
        });
      }

      // Determine winner (highest conversion rate)
      const winner = variantResults.reduce((prev, current) =>
        current.conversion_rate > prev.conversion_rate ? current : prev
      );

      // Calculate statistical significance (simplified chi-square test)
      let isSignificant = false;
      if (variantResults.length === 2) {
        const [variantA, variantB] = variantResults;
        const chiSquare = calculateChiSquare(
          variantA.conversions,
          variantA.users - variantA.conversions,
          variantB.conversions,
          variantB.users - variantB.conversions
        );

        // Chi-square critical value for 95% confidence with 1 degree of freedom
        const criticalValue = 3.841;
        isSignificant = chiSquare > criticalValue;
      }

      res.json({
        success: true,
        experiment: {
          id: experiment.id,
          name: experiment.name,
          description: experiment.description,
          status: experiment.status,
          goal_event: experiment.goal_event,
          start_date: experiment.start_date,
          end_date: experiment.end_date,
          variants: variantResults,
          winner: winner.name,
          statistical_significance: isSignificant,
          confidence_level: parseFloat(confidence_level)
        }
      });

    } catch (error) {
      console.error('Error analyzing experiment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze experiment',
        message: error.message
      });
    }
  });

  /**
   * Helper function to calculate chi-square statistic
   * Used for A/B test statistical significance
   */
  function calculateChiSquare(a, b, c, d) {
    const n = a + b + c + d;
    const chiSquare = (n * Math.pow((a * d - b * c), 2)) /
      ((a + b) * (c + d) * (a + c) * (b + d));
    return chiSquare;
  }

  return router;
};
