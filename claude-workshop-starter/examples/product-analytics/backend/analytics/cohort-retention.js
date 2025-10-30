// Cohort Retention Analysis Module
// Analyzes user retention by cohort over time

class CohortRetention {
  constructor(db) {
    this.db = db;
  }

  // Calculate retention cohorts by signup date
  async analyzeRetention(cohortSize = 'week', periods = 12) {
    // Determine cohort grouping SQL
    const cohortGrouping = cohortSize === 'week'
      ? "strftime('%Y-W%W', created_at)"
      : cohortSize === 'month'
      ? "strftime('%Y-%m', created_at)"
      : "date(created_at)";

    // Get all cohorts
    const cohorts = await this.db.all(`
      SELECT
        ${cohortGrouping} as cohort,
        COUNT(*) as cohort_size,
        MIN(created_at) as cohort_start
      FROM users
      WHERE created_at IS NOT NULL
      GROUP BY ${cohortGrouping}
      ORDER BY cohort_start
    `);

    const retentionData = [];

    for (const cohort of cohorts) {
      const cohortUsers = await this.db.all(
        `SELECT id FROM users WHERE ${cohortGrouping} = ?`,
        [cohort.cohort]
      );

      const userIds = cohortUsers.map(u => u.id);
      if (userIds.length === 0) continue;

      const periodData = [100]; // Period 0 is always 100%

      // Calculate retention for each period
      for (let period = 1; period <= periods; period++) {
        const periodStart = this.addPeriod(cohort.cohort_start, period, cohortSize);
        const periodEnd = this.addPeriod(cohort.cohort_start, period + 1, cohortSize);

        const activeUsers = await this.db.get(
          `SELECT COUNT(DISTINCT user_id) as count
           FROM events
           WHERE user_id IN (${userIds.map(() => '?').join(',')})
           AND timestamp >= ?
           AND timestamp < ?`,
          [...userIds, periodStart, periodEnd]
        );

        const retentionRate = (activeUsers.count / cohort.cohort_size) * 100;
        periodData.push(Math.round(retentionRate * 100) / 100);
      }

      retentionData.push({
        cohort: cohort.cohort,
        cohort_size: cohort.cohort_size,
        cohort_start: cohort.cohort_start,
        retention: periodData
      });
    }

    return {
      cohort_size: cohortSize,
      periods: periods,
      data: retentionData
    };
  }

  // Calculate day N retention (e.g., Day 1, Day 7, Day 30)
  async getDayNRetention(days = [1, 7, 14, 30]) {
    const results = {};

    for (const day of days) {
      // Get users who signed up at least N days ago
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - day);

      const users = await this.db.all(
        `SELECT id, created_at FROM users WHERE created_at <= ?`,
        [cutoffDate.toISOString()]
      );

      let retained = 0;

      for (const user of users) {
        const checkDate = new Date(user.created_at);
        checkDate.setDate(checkDate.getDate() + day);

        const nextDay = new Date(checkDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Check if user was active on day N
        const activity = await this.db.get(
          `SELECT COUNT(*) as count FROM events
           WHERE user_id = ?
           AND timestamp >= ?
           AND timestamp < ?`,
          [user.id, checkDate.toISOString(), nextDay.toISOString()]
        );

        if (activity.count > 0) {
          retained++;
        }
      }

      const retentionRate = users.length > 0
        ? (retained / users.length) * 100
        : 0;

      results[`day_${day}`] = {
        total_users: users.length,
        retained_users: retained,
        retention_rate: Math.round(retentionRate * 100) / 100
      };
    }

    return results;
  }

  // Get retention by user segment/property
  async getSegmentedRetention(segmentProperty, cohortSize = 'week') {
    // Get unique segment values
    const segments = await this.db.all(
      `SELECT DISTINCT JSON_EXTRACT(properties, '$.${segmentProperty}') as segment
       FROM users
       WHERE JSON_EXTRACT(properties, '$.${segmentProperty}') IS NOT NULL`
    );

    const results = {};

    for (const { segment } of segments) {
      const cohortGrouping = cohortSize === 'week'
        ? "strftime('%Y-W%W', created_at)"
        : "strftime('%Y-%m', created_at)";

      const cohorts = await this.db.all(`
        SELECT
          ${cohortGrouping} as cohort,
          COUNT(*) as cohort_size,
          MIN(created_at) as cohort_start
        FROM users
        WHERE JSON_EXTRACT(properties, '$.${segmentProperty}') = ?
        GROUP BY ${cohortGrouping}
        ORDER BY cohort_start
        LIMIT 10
      `, [segment]);

      const retentionData = [];

      for (const cohort of cohorts) {
        const cohortUsers = await this.db.all(
          `SELECT id FROM users
           WHERE ${cohortGrouping} = ?
           AND JSON_EXTRACT(properties, '$.${segmentProperty}') = ?`,
          [cohort.cohort, segment]
        );

        const userIds = cohortUsers.map(u => u.id);
        if (userIds.length === 0) continue;

        // Calculate 4 weeks of retention
        const periodData = [100];
        for (let period = 1; period <= 4; period++) {
          const periodStart = this.addPeriod(cohort.cohort_start, period, cohortSize);
          const periodEnd = this.addPeriod(cohort.cohort_start, period + 1, cohortSize);

          const activeUsers = await this.db.get(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM events
             WHERE user_id IN (${userIds.map(() => '?').join(',')})
             AND timestamp >= ?
             AND timestamp < ?`,
            [...userIds, periodStart, periodEnd]
          );

          const retentionRate = (activeUsers.count / cohort.cohort_size) * 100;
          periodData.push(Math.round(retentionRate * 100) / 100);
        }

        retentionData.push({
          cohort: cohort.cohort,
          retention: periodData
        });
      }

      results[segment] = retentionData;
    }

    return results;
  }

  // Helper function to add periods to a date
  addPeriod(dateStr, periods, size) {
    const date = new Date(dateStr);

    if (size === 'week') {
      date.setDate(date.getDate() + (periods * 7));
    } else if (size === 'month') {
      date.setMonth(date.getMonth() + periods);
    } else {
      date.setDate(date.getDate() + periods);
    }

    return date.toISOString();
  }

  // Calculate churn rate
  async getChurnRate(period = 'month') {
    const now = new Date();
    const periodStart = new Date(now);

    if (period === 'week') {
      periodStart.setDate(periodStart.getDate() - 7);
    } else if (period === 'month') {
      periodStart.setMonth(periodStart.getMonth() - 1);
    }

    // Users active in previous period
    const previousActive = await this.db.all(
      `SELECT DISTINCT user_id
       FROM events
       WHERE timestamp >= ?
       AND timestamp < ?`,
      [
        this.subtractPeriod(periodStart.toISOString(), 1, period),
        periodStart.toISOString()
      ]
    );

    // Users active in current period
    const currentActive = await this.db.all(
      `SELECT DISTINCT user_id
       FROM events
       WHERE timestamp >= ?`,
      [periodStart.toISOString()]
    );

    const currentActiveIds = new Set(currentActive.map(u => u.user_id));
    const churned = previousActive.filter(u => !currentActiveIds.has(u.user_id));

    const churnRate = previousActive.length > 0
      ? (churned.length / previousActive.length) * 100
      : 0;

    return {
      period: period,
      previous_active: previousActive.length,
      current_active: currentActive.length,
      churned_users: churned.length,
      churn_rate: Math.round(churnRate * 100) / 100
    };
  }

  subtractPeriod(dateStr, periods, size) {
    const date = new Date(dateStr);

    if (size === 'week') {
      date.setDate(date.getDate() - (periods * 7));
    } else if (size === 'month') {
      date.setMonth(date.getMonth() - periods);
    } else {
      date.setDate(date.getDate() - periods);
    }

    return date.toISOString();
  }
}

module.exports = CohortRetention;
