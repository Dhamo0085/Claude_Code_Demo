// A/B Test Analyzer Module
// Provides comprehensive statistical analysis for A/B testing experiments
// Includes chi-square tests, confidence intervals, and automated recommendations

class ABTestAnalyzer {
  constructor(db) {
    this.db = db;
    this.CONFIDENCE_LEVEL = 0.95; // 95% confidence level
    this.MIN_SAMPLE_SIZE = 100; // Minimum sample size per variant
    this.MIN_CONVERSIONS = 10; // Minimum conversions for statistical significance
  }

  /**
   * Get comprehensive experiment results including all variants and their performance
   * @param {string} experimentId - The experiment ID
   * @returns {Object} Experiment results with variant metrics
   */
  async getExperimentResults(experimentId) {
    try {
      // Get experiment details
      const experiment = await this.db.get(
        'SELECT * FROM experiments WHERE id = ?',
        [experimentId]
      );

      if (!experiment) {
        throw new Error(`Experiment ${experimentId} not found`);
      }

      const variants = JSON.parse(experiment.variants);
      const goalEvent = experiment.goal_event;

      // Get results for each variant
      const variantResults = await Promise.all(
        variants.map(variant => this.getVariantMetrics(experimentId, variant, goalEvent))
      );

      // Calculate aggregate metrics
      const totalUsers = variantResults.reduce((sum, v) => sum + v.total_users, 0);
      const totalConversions = variantResults.reduce((sum, v) => sum + v.conversions, 0);
      const overallConversionRate = totalUsers > 0 ? (totalConversions / totalUsers) * 100 : 0;

      return {
        experiment_id: experimentId,
        experiment_name: experiment.name,
        description: experiment.description,
        status: experiment.status,
        goal_event: goalEvent,
        start_date: experiment.start_date,
        end_date: experiment.end_date,
        variants: variantResults,
        aggregate: {
          total_users: totalUsers,
          total_conversions: totalConversions,
          overall_conversion_rate: this.roundTo(overallConversionRate, 2)
        },
        created_at: experiment.created_at
      };
    } catch (error) {
      throw new Error(`Failed to get experiment results: ${error.message}`);
    }
  }

  /**
   * Get detailed metrics for a specific variant
   * @param {string} experimentId - The experiment ID
   * @param {string} variant - The variant name
   * @param {string} goalEvent - The goal event to measure
   * @returns {Object} Variant metrics
   */
  async getVariantMetrics(experimentId, variant, goalEvent) {
    try {
      // Get total users assigned to this variant
      const assignmentResult = await this.db.get(
        `SELECT COUNT(*) as count FROM experiment_assignments
         WHERE experiment_id = ? AND variant = ?`,
        [experimentId, variant]
      );
      const totalUsers = assignmentResult.count;

      // Get users who converted (completed goal event)
      const conversionResult = await this.db.get(
        `SELECT COUNT(DISTINCT ea.user_id) as count
         FROM experiment_assignments ea
         JOIN events e ON ea.user_id = e.user_id
         WHERE ea.experiment_id = ?
         AND ea.variant = ?
         AND e.event_name = ?
         AND e.timestamp >= ea.assigned_at`,
        [experimentId, variant, goalEvent]
      );
      const conversions = conversionResult.count;

      // Calculate conversion rate
      const conversionRate = totalUsers > 0 ? (conversions / totalUsers) * 100 : 0;

      // Calculate confidence interval
      const confidenceInterval = this.calculateConfidenceInterval(conversions, totalUsers);

      // Calculate average time to conversion
      const avgTimeToConversion = await this.getAverageTimeToConversion(
        experimentId,
        variant,
        goalEvent
      );

      return {
        variant,
        total_users: totalUsers,
        conversions,
        conversion_rate: this.roundTo(conversionRate, 2),
        confidence_interval: {
          lower: this.roundTo(confidenceInterval.lower, 2),
          upper: this.roundTo(confidenceInterval.upper, 2)
        },
        avg_time_to_conversion_hours: avgTimeToConversion
      };
    } catch (error) {
      throw new Error(`Failed to get variant metrics: ${error.message}`);
    }
  }

  /**
   * Calculate statistical significance between variants using chi-square test
   * @param {string} experimentId - The experiment ID
   * @returns {Object} Statistical significance results
   */
  async calculateSignificance(experimentId) {
    try {
      const results = await this.getExperimentResults(experimentId);

      if (results.variants.length < 2) {
        throw new Error('Need at least 2 variants to calculate significance');
      }

      // Check if we have enough sample size
      const hasEnoughSamples = results.variants.every(
        v => v.total_users >= this.MIN_SAMPLE_SIZE && v.conversions >= this.MIN_CONVERSIONS
      );

      if (!hasEnoughSamples) {
        return {
          experiment_id: experimentId,
          is_significant: false,
          p_value: null,
          chi_square: null,
          warning: `Insufficient sample size. Need at least ${this.MIN_SAMPLE_SIZE} users and ${this.MIN_CONVERSIONS} conversions per variant.`,
          sample_size_check: results.variants.map(v => ({
            variant: v.variant,
            users: v.total_users,
            conversions: v.conversions,
            meets_minimum: v.total_users >= this.MIN_SAMPLE_SIZE && v.conversions >= this.MIN_CONVERSIONS
          }))
        };
      }

      // Perform chi-square test
      const chiSquareResult = this.chiSquareTest(results.variants);

      // Determine if result is statistically significant (p < 0.05)
      const isSignificant = chiSquareResult.pValue < 0.05;

      // Find the best performing variant
      const bestVariant = results.variants.reduce((best, current) =>
        current.conversion_rate > best.conversion_rate ? current : best
      );

      return {
        experiment_id: experimentId,
        experiment_name: results.experiment_name,
        is_significant: isSignificant,
        p_value: this.roundTo(chiSquareResult.pValue, 4),
        chi_square: this.roundTo(chiSquareResult.chiSquare, 4),
        degrees_of_freedom: chiSquareResult.degreesOfFreedom,
        best_variant: {
          name: bestVariant.variant,
          conversion_rate: bestVariant.conversion_rate,
          sample_size: bestVariant.total_users
        },
        confidence_level: this.CONFIDENCE_LEVEL * 100,
        interpretation: this.getSignificanceInterpretation(isSignificant, chiSquareResult.pValue)
      };
    } catch (error) {
      throw new Error(`Failed to calculate significance: ${error.message}`);
    }
  }

  /**
   * Perform chi-square test for independence
   * @param {Array} variants - Array of variant metrics
   * @returns {Object} Chi-square test results
   */
  chiSquareTest(variants) {
    // Create contingency table
    const observed = variants.map(v => ({
      converted: v.conversions,
      notConverted: v.total_users - v.conversions
    }));

    // Calculate totals
    const totalConverted = observed.reduce((sum, v) => sum + v.converted, 0);
    const totalNotConverted = observed.reduce((sum, v) => sum + v.notConverted, 0);
    const grandTotal = totalConverted + totalNotConverted;

    // Calculate expected frequencies
    const expected = variants.map(v => {
      const rowTotal = v.total_users;
      return {
        converted: (rowTotal * totalConverted) / grandTotal,
        notConverted: (rowTotal * totalNotConverted) / grandTotal
      };
    });

    // Calculate chi-square statistic
    let chiSquare = 0;
    for (let i = 0; i < observed.length; i++) {
      chiSquare += Math.pow(observed[i].converted - expected[i].converted, 2) / expected[i].converted;
      chiSquare += Math.pow(observed[i].notConverted - expected[i].notConverted, 2) / expected[i].notConverted;
    }

    // Degrees of freedom = (rows - 1) * (columns - 1)
    const degreesOfFreedom = variants.length - 1;

    // Calculate p-value using chi-square distribution
    const pValue = this.chiSquarePValue(chiSquare, degreesOfFreedom);

    return {
      chiSquare,
      degreesOfFreedom,
      pValue
    };
  }

  /**
   * Calculate p-value from chi-square statistic
   * Using gamma function approximation
   * @param {number} chiSquare - Chi-square statistic
   * @param {number} df - Degrees of freedom
   * @returns {number} P-value
   */
  chiSquarePValue(chiSquare, df) {
    // Using incomplete gamma function approximation
    // This is a simplified implementation - production code should use a proper stats library
    if (chiSquare < 0 || df < 1) return 1;

    // For small chi-square values, p-value is high
    if (chiSquare === 0) return 1;

    // Approximation using Wilson-Hilferty transformation
    const z = Math.pow(chiSquare / df, 1/3) - (1 - 2/(9 * df)) / Math.sqrt(2/(9 * df));

    // Convert to p-value using standard normal distribution
    const pValue = 1 - this.normalCDF(z);

    return Math.max(0, Math.min(1, pValue));
  }

  /**
   * Cumulative distribution function for standard normal distribution
   * @param {number} z - Z-score
   * @returns {number} Cumulative probability
   */
  normalCDF(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return z > 0 ? 1 - probability : probability;
  }

  /**
   * Calculate confidence interval for conversion rate
   * Using Wilson score interval
   * @param {number} conversions - Number of conversions
   * @param {number} total - Total sample size
   * @returns {Object} Confidence interval
   */
  calculateConfidenceInterval(conversions, total) {
    if (total === 0) {
      return { lower: 0, upper: 0 };
    }

    const p = conversions / total;
    const z = 1.96; // 95% confidence level

    const denominator = 1 + (z * z) / total;
    const center = (p + (z * z) / (2 * total)) / denominator;
    const margin = (z * Math.sqrt(p * (1 - p) / total + (z * z) / (4 * total * total))) / denominator;

    return {
      lower: Math.max(0, (center - margin) * 100),
      upper: Math.min(100, (center + margin) * 100)
    };
  }

  /**
   * Compare variants head-to-head
   * @param {string} experimentId - The experiment ID
   * @returns {Object} Variant comparison results
   */
  async getVariantComparison(experimentId) {
    try {
      const results = await this.getExperimentResults(experimentId);

      if (results.variants.length < 2) {
        throw new Error('Need at least 2 variants to compare');
      }

      // Sort variants by conversion rate
      const sortedVariants = [...results.variants].sort(
        (a, b) => b.conversion_rate - a.conversion_rate
      );

      const bestVariant = sortedVariants[0];
      const comparisons = [];

      // Compare each variant to the best one
      for (let i = 1; i < sortedVariants.length; i++) {
        const variant = sortedVariants[i];

        // Calculate relative difference
        const absoluteDifference = bestVariant.conversion_rate - variant.conversion_rate;
        const relativeLift = bestVariant.conversion_rate > 0
          ? ((bestVariant.conversion_rate - variant.conversion_rate) / variant.conversion_rate) * 100
          : 0;

        // Calculate if confidence intervals overlap
        const intervalsOverlap = !(
          bestVariant.confidence_interval.lower > variant.confidence_interval.upper ||
          variant.confidence_interval.lower > bestVariant.confidence_interval.upper
        );

        comparisons.push({
          variant: variant.variant,
          conversion_rate: variant.conversion_rate,
          difference_from_best: this.roundTo(absoluteDifference, 2),
          relative_lift: this.roundTo(relativeLift, 2),
          confidence_intervals_overlap: intervalsOverlap,
          likely_worse: !intervalsOverlap && variant.conversion_rate < bestVariant.conversion_rate
        });
      }

      return {
        experiment_id: experimentId,
        experiment_name: results.experiment_name,
        best_variant: {
          name: bestVariant.variant,
          conversion_rate: bestVariant.conversion_rate,
          total_users: bestVariant.total_users,
          conversions: bestVariant.conversions,
          confidence_interval: bestVariant.confidence_interval
        },
        comparisons,
        summary: this.generateComparisonSummary(bestVariant, comparisons)
      };
    } catch (error) {
      throw new Error(`Failed to compare variants: ${error.message}`);
    }
  }

  /**
   * Get experiment metrics over time
   * @param {string} experimentId - The experiment ID
   * @param {string} granularity - Time granularity (hour, day, week)
   * @returns {Object} Time series data
   */
  async getExperimentTimeSeries(experimentId, granularity = 'day') {
    try {
      const experiment = await this.db.get(
        'SELECT * FROM experiments WHERE id = ?',
        [experimentId]
      );

      if (!experiment) {
        throw new Error(`Experiment ${experimentId} not found`);
      }

      const variants = JSON.parse(experiment.variants);
      const goalEvent = experiment.goal_event;

      // Determine date format based on granularity
      const dateFormat = this.getDateFormat(granularity);

      // Get time series data for each variant
      const timeSeriesData = await Promise.all(
        variants.map(variant => this.getVariantTimeSeries(
          experimentId,
          variant,
          goalEvent,
          dateFormat,
          granularity
        ))
      );

      // Combine into unified timeline
      const timeline = this.combineTimeSeries(timeSeriesData, variants);

      return {
        experiment_id: experimentId,
        experiment_name: experiment.name,
        granularity,
        variants: timeSeriesData,
        timeline
      };
    } catch (error) {
      throw new Error(`Failed to get time series: ${error.message}`);
    }
  }

  /**
   * Get time series data for a specific variant
   * @param {string} experimentId - The experiment ID
   * @param {string} variant - Variant name
   * @param {string} goalEvent - Goal event name
   * @param {string} dateFormat - SQL date format
   * @param {string} granularity - Time granularity
   * @returns {Object} Variant time series
   */
  async getVariantTimeSeries(experimentId, variant, goalEvent, dateFormat, granularity) {
    try {
      // Get assignments over time
      const assignments = await this.db.all(
        `SELECT
          strftime('${dateFormat}', assigned_at) as period,
          COUNT(*) as count
         FROM experiment_assignments
         WHERE experiment_id = ? AND variant = ?
         GROUP BY period
         ORDER BY period`,
        [experimentId, variant]
      );

      // Get conversions over time
      const conversions = await this.db.all(
        `SELECT
          strftime('${dateFormat}', e.timestamp) as period,
          COUNT(DISTINCT e.user_id) as count
         FROM experiment_assignments ea
         JOIN events e ON ea.user_id = e.user_id
         WHERE ea.experiment_id = ?
         AND ea.variant = ?
         AND e.event_name = ?
         AND e.timestamp >= ea.assigned_at
         GROUP BY period
         ORDER BY period`,
        [experimentId, variant, goalEvent]
      );

      // Combine assignments and conversions by period
      const periodMap = new Map();

      assignments.forEach(a => {
        periodMap.set(a.period, {
          period: a.period,
          assignments: a.count,
          conversions: 0,
          conversion_rate: 0,
          cumulative_assignments: 0,
          cumulative_conversions: 0,
          cumulative_conversion_rate: 0
        });
      });

      conversions.forEach(c => {
        if (periodMap.has(c.period)) {
          const data = periodMap.get(c.period);
          data.conversions = c.count;
          data.conversion_rate = data.assignments > 0
            ? this.roundTo((c.count / data.assignments) * 100, 2)
            : 0;
        }
      });

      // Calculate cumulative metrics
      let cumulativeAssignments = 0;
      let cumulativeConversions = 0;
      const dataPoints = Array.from(periodMap.values()).sort((a, b) =>
        a.period.localeCompare(b.period)
      );

      dataPoints.forEach(point => {
        cumulativeAssignments += point.assignments;
        cumulativeConversions += point.conversions;
        point.cumulative_assignments = cumulativeAssignments;
        point.cumulative_conversions = cumulativeConversions;
        point.cumulative_conversion_rate = cumulativeAssignments > 0
          ? this.roundTo((cumulativeConversions / cumulativeAssignments) * 100, 2)
          : 0;
      });

      return {
        variant,
        data_points: dataPoints
      };
    } catch (error) {
      throw new Error(`Failed to get variant time series: ${error.message}`);
    }
  }

  /**
   * Generate automated recommendations based on experiment results
   * @param {string} experimentId - The experiment ID
   * @returns {Object} Recommendations
   */
  async getRecommendation(experimentId) {
    try {
      const results = await this.getExperimentResults(experimentId);
      const significance = await this.calculateSignificance(experimentId);
      const comparison = await this.getVariantComparison(experimentId);

      const recommendations = [];
      let action = 'continue';
      let confidence = 'low';

      // Check if experiment has enough data
      const hasEnoughData = results.variants.every(
        v => v.total_users >= this.MIN_SAMPLE_SIZE && v.conversions >= this.MIN_CONVERSIONS
      );

      if (!hasEnoughData) {
        recommendations.push({
          type: 'warning',
          message: 'Insufficient sample size. Continue running the experiment.',
          details: `Need at least ${this.MIN_SAMPLE_SIZE} users and ${this.MIN_CONVERSIONS} conversions per variant.`
        });
        action = 'continue';
        confidence = 'low';
      } else if (significance.is_significant) {
        // Statistically significant result
        const winner = significance.best_variant;
        const improvement = comparison.comparisons.length > 0
          ? comparison.comparisons[0].relative_lift
          : 0;

        recommendations.push({
          type: 'success',
          message: `Implement variant "${winner.name}" - statistically significant winner detected.`,
          details: `${winner.name} shows ${Math.abs(improvement).toFixed(1)}% improvement with p-value of ${significance.p_value}.`
        });

        recommendations.push({
          type: 'action',
          message: 'Roll out winning variant to all users.',
          details: `Expected improvement: ${Math.abs(improvement).toFixed(1)}% increase in conversion rate.`
        });

        action = 'implement_winner';
        confidence = 'high';
      } else {
        // Not statistically significant
        const bestVariant = comparison.best_variant;
        const maxDifference = comparison.comparisons.length > 0
          ? Math.max(...comparison.comparisons.map(c => Math.abs(c.difference_from_best)))
          : 0;

        if (maxDifference < 1) {
          recommendations.push({
            type: 'info',
            message: 'No meaningful difference between variants detected.',
            details: 'Consider implementing the simpler or less costly variant, or continue testing with different approaches.'
          });
          action = 'no_clear_winner';
          confidence = 'medium';
        } else {
          recommendations.push({
            type: 'info',
            message: 'Trends detected but not statistically significant yet.',
            details: `${bestVariant.name} is leading but needs more data. Continue experiment.`
          });
          action = 'continue';
          confidence = 'medium';
        }
      }

      // Check for concerning patterns
      const lowestRate = Math.min(...results.variants.map(v => v.conversion_rate));
      const highestRate = Math.max(...results.variants.map(v => v.conversion_rate));

      if (highestRate > 0 && (lowestRate / highestRate) < 0.5 && hasEnoughData) {
        const worstVariant = results.variants.find(v => v.conversion_rate === lowestRate);
        recommendations.push({
          type: 'warning',
          message: `Consider stopping variant "${worstVariant.variant}" - performing significantly worse.`,
          details: `This variant shows ${this.roundTo((1 - lowestRate / highestRate) * 100, 1)}% lower conversion rate.`
        });
      }

      // Calculate experiment duration
      const daysRunning = this.calculateDaysRunning(results.start_date);

      if (daysRunning > 14 && !significance.is_significant) {
        recommendations.push({
          type: 'info',
          message: 'Experiment running for 2+ weeks without clear winner.',
          details: 'Consider re-evaluating your hypothesis or testing more dramatic changes.'
        });
      }

      return {
        experiment_id: experimentId,
        experiment_name: results.experiment_name,
        action,
        confidence,
        days_running: daysRunning,
        is_statistically_significant: significance.is_significant,
        recommended_variant: comparison.best_variant.name,
        recommendations,
        metrics_summary: {
          total_users: results.aggregate.total_users,
          total_conversions: results.aggregate.total_conversions,
          best_conversion_rate: comparison.best_variant.conversion_rate,
          p_value: significance.p_value
        },
        next_steps: this.generateNextSteps(action, significance, comparison)
      };
    } catch (error) {
      throw new Error(`Failed to generate recommendation: ${error.message}`);
    }
  }

  /**
   * Helper: Get average time to conversion for a variant
   */
  async getAverageTimeToConversion(experimentId, variant, goalEvent) {
    const result = await this.db.get(
      `SELECT AVG((julianday(e.timestamp) - julianday(ea.assigned_at)) * 24) as avg_hours
       FROM experiment_assignments ea
       JOIN events e ON ea.user_id = e.user_id
       WHERE ea.experiment_id = ?
       AND ea.variant = ?
       AND e.event_name = ?
       AND e.timestamp >= ea.assigned_at`,
      [experimentId, variant, goalEvent]
    );

    return result && result.avg_hours ? this.roundTo(result.avg_hours, 2) : null;
  }

  /**
   * Helper: Get SQL date format based on granularity
   */
  getDateFormat(granularity) {
    const formats = {
      hour: '%Y-%m-%d %H:00:00',
      day: '%Y-%m-%d',
      week: '%Y-W%W',
      month: '%Y-%m'
    };
    return formats[granularity] || formats.day;
  }

  /**
   * Helper: Combine time series from multiple variants
   */
  combineTimeSeries(timeSeriesData, variants) {
    const periodMap = new Map();

    timeSeriesData.forEach(variantData => {
      variantData.data_points.forEach(point => {
        if (!periodMap.has(point.period)) {
          periodMap.set(point.period, {
            period: point.period,
            variants: {}
          });
        }
        periodMap.get(point.period).variants[variantData.variant] = {
          assignments: point.assignments,
          conversions: point.conversions,
          conversion_rate: point.conversion_rate
        };
      });
    });

    return Array.from(periodMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period)
    );
  }

  /**
   * Helper: Generate comparison summary
   */
  generateComparisonSummary(bestVariant, comparisons) {
    const significantlyWorse = comparisons.filter(c => c.likely_worse).length;
    const avgDifference = comparisons.length > 0
      ? comparisons.reduce((sum, c) => sum + Math.abs(c.difference_from_best), 0) / comparisons.length
      : 0;

    return {
      total_variants_compared: comparisons.length + 1,
      best_variant: bestVariant.variant,
      significantly_worse_variants: significantlyWorse,
      average_difference: this.roundTo(avgDifference, 2)
    };
  }

  /**
   * Helper: Get significance interpretation
   */
  getSignificanceInterpretation(isSignificant, pValue) {
    if (isSignificant) {
      if (pValue < 0.01) {
        return 'Very strong evidence of difference between variants (p < 0.01)';
      }
      return 'Strong evidence of difference between variants (p < 0.05)';
    } else {
      if (pValue > 0.5) {
        return 'No evidence of difference between variants';
      }
      return 'Weak evidence - continue testing for conclusive results';
    }
  }

  /**
   * Helper: Calculate days running
   */
  calculateDaysRunning(startDate) {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Generate next steps
   */
  generateNextSteps(action, significance, comparison) {
    const steps = [];

    switch (action) {
      case 'implement_winner':
        steps.push('1. Prepare deployment of winning variant to all users');
        steps.push('2. Monitor metrics closely during rollout');
        steps.push('3. Document learnings for future experiments');
        steps.push(`4. Expected outcome: ${comparison.best_variant.conversion_rate}% conversion rate`);
        break;

      case 'continue':
        steps.push('1. Continue running experiment to gather more data');
        steps.push('2. Monitor daily for significant changes');
        steps.push('3. Re-evaluate after reaching minimum sample size');
        steps.push('4. Consider increasing traffic allocation if possible');
        break;

      case 'no_clear_winner':
        steps.push('1. Consider ending experiment - no clear winner');
        steps.push('2. Implement the simpler or less costly variant');
        steps.push('3. Plan new experiments with more dramatic changes');
        steps.push('4. Review assumptions and test different hypotheses');
        break;

      default:
        steps.push('1. Review experiment setup and goals');
        steps.push('2. Ensure proper tracking implementation');
        steps.push('3. Monitor for any data quality issues');
    }

    return steps;
  }

  /**
   * Helper: Round to specified decimal places
   */
  roundTo(value, decimals) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

module.exports = ABTestAnalyzer;
