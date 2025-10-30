// Funnel Analysis Module
// Analyzes conversion funnels to identify drop-off points

class FunnelAnalyzer {
  constructor(db) {
    this.db = db;
  }

  // Calculate funnel conversion rates
  async analyzeFunnel(steps, startDate, endDate, cohortId = null) {
    const results = [];
    let previousStepUsers = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepNumber = i + 1;

      // Get users who completed this step
      let sql = `
        SELECT DISTINCT user_id
        FROM events
        WHERE event_name = ?
        AND timestamp BETWEEN ? AND ?
      `;
      const params = [step, startDate, endDate];

      if (cohortId) {
        sql += ` AND user_id IN (SELECT id FROM users WHERE cohort_id = ?)`;
        params.push(cohortId);
      }

      // If not first step, filter by users who completed previous steps
      if (previousStepUsers) {
        sql += ` AND user_id IN (${previousStepUsers.map(() => '?').join(',')})`;
        params.push(...previousStepUsers);
      }

      const users = await this.db.all(sql, params);
      const userIds = users.map(u => u.user_id);
      const count = userIds.length;

      // Calculate conversion rate
      const conversionRate = previousStepUsers
        ? (count / previousStepUsers.length) * 100
        : 100;

      // Calculate drop-off
      const dropOff = previousStepUsers
        ? previousStepUsers.length - count
        : 0;

      const dropOffRate = previousStepUsers
        ? ((dropOff / previousStepUsers.length) * 100)
        : 0;

      results.push({
        step: stepNumber,
        event_name: step,
        user_count: count,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        drop_off_count: dropOff,
        drop_off_rate: Math.round(dropOffRate * 100) / 100
      });

      previousStepUsers = userIds;
    }

    // Calculate overall funnel conversion
    const overallConversion = results.length > 0
      ? (results[results.length - 1].user_count / results[0].user_count) * 100
      : 0;

    return {
      steps: results,
      overall_conversion: Math.round(overallConversion * 100) / 100,
      start_date: startDate,
      end_date: endDate
    };
  }

  // Get average time between funnel steps
  async getStepTimings(steps, startDate, endDate) {
    const timings = [];

    for (let i = 0; i < steps.length - 1; i++) {
      const currentStep = steps[i];
      const nextStep = steps[i + 1];

      const sql = `
        SELECT
          e1.user_id,
          (julianday(e2.timestamp) - julianday(e1.timestamp)) * 24 * 60 as minutes_to_next_step
        FROM events e1
        JOIN events e2 ON e1.user_id = e2.user_id
        WHERE e1.event_name = ?
        AND e2.event_name = ?
        AND e1.timestamp BETWEEN ? AND ?
        AND e2.timestamp > e1.timestamp
        AND e2.timestamp = (
          SELECT MIN(timestamp)
          FROM events
          WHERE user_id = e1.user_id
          AND event_name = ?
          AND timestamp > e1.timestamp
        )
      `;

      const results = await this.db.all(sql, [
        currentStep,
        nextStep,
        startDate,
        endDate,
        nextStep
      ]);

      if (results.length > 0) {
        const avgTime = results.reduce((sum, r) => sum + r.minutes_to_next_step, 0) / results.length;
        const medianTime = this.getMedian(results.map(r => r.minutes_to_next_step));

        timings.push({
          from_step: currentStep,
          to_step: nextStep,
          avg_minutes: Math.round(avgTime * 100) / 100,
          median_minutes: Math.round(medianTime * 100) / 100,
          sample_size: results.length
        });
      }
    }

    return timings;
  }

  // Get funnel breakdown by property (e.g., device, country)
  async getFunnelBreakdown(steps, startDate, endDate, breakdownProperty) {
    const breakdowns = {};

    // Get unique values for the breakdown property
    const values = await this.db.all(
      `SELECT DISTINCT ${breakdownProperty} as value
       FROM events
       WHERE timestamp BETWEEN ? AND ?
       AND ${breakdownProperty} IS NOT NULL`,
      [startDate, endDate]
    );

    // Analyze funnel for each value
    for (const { value } of values) {
      let previousStepUsers = null;
      const results = [];

      for (const step of steps) {
        let sql = `
          SELECT DISTINCT user_id
          FROM events
          WHERE event_name = ?
          AND ${breakdownProperty} = ?
          AND timestamp BETWEEN ? AND ?
        `;
        const params = [step, value, startDate, endDate];

        if (previousStepUsers) {
          sql += ` AND user_id IN (${previousStepUsers.map(() => '?').join(',')})`;
          params.push(...previousStepUsers);
        }

        const users = await this.db.all(sql, params);
        const userIds = users.map(u => u.user_id);
        results.push(userIds.length);
        previousStepUsers = userIds;
      }

      const overallConversion = results[0] > 0
        ? (results[results.length - 1] / results[0]) * 100
        : 0;

      breakdowns[value] = {
        steps: results,
        overall_conversion: Math.round(overallConversion * 100) / 100
      };
    }

    return breakdowns;
  }

  getMedian(values) {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    if (values.length % 2) {
      return values[half];
    }
    return (values[half - 1] + values[half]) / 2.0;
  }
}

module.exports = FunnelAnalyzer;
