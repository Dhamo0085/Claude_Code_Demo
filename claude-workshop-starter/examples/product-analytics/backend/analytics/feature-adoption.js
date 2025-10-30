// Feature Adoption Tracking Module
// Tracks feature usage and adoption over time

class FeatureAdoption {
  constructor(db) {
    this.db = db;
  }

  // Track feature adoption rate over time
  async getAdoptionRate(featureEvent, startDate, endDate, granularity = 'day') {
    const timeFormat = granularity === 'hour'
      ? "strftime('%Y-%m-%d %H:00:00', timestamp)"
      : granularity === 'week'
      ? "strftime('%Y-W%W', timestamp)"
      : "date(timestamp)";

    // Get total active users per period
    const activeUsers = await this.db.all(`
      SELECT
        ${timeFormat} as period,
        COUNT(DISTINCT user_id) as total_users
      FROM events
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY period
      ORDER BY period
    `, [startDate, endDate]);

    // Get users who used the feature per period
    const featureUsers = await this.db.all(`
      SELECT
        ${timeFormat} as period,
        COUNT(DISTINCT user_id) as feature_users
      FROM events
      WHERE event_name = ?
      AND timestamp BETWEEN ? AND ?
      GROUP BY period
      ORDER BY period
    `, [featureEvent, startDate, endDate]);

    // Create lookup map for feature users
    const featureMap = {};
    featureUsers.forEach(f => {
      featureMap[f.period] = f.feature_users;
    });

    // Calculate adoption rate for each period
    const adoptionData = activeUsers.map(a => {
      const featureCount = featureMap[a.period] || 0;
      const adoptionRate = a.total_users > 0
        ? (featureCount / a.total_users) * 100
        : 0;

      return {
        period: a.period,
        total_users: a.total_users,
        feature_users: featureCount,
        adoption_rate: Math.round(adoptionRate * 100) / 100
      };
    });

    return {
      feature_event: featureEvent,
      granularity,
      data: adoptionData
    };
  }

  // Get cumulative adoption (how many users have ever used a feature)
  async getCumulativeAdoption(featureEvent, launchDate) {
    // Total users since launch
    const totalUsers = await this.db.get(`
      SELECT COUNT(DISTINCT id) as count
      FROM users
      WHERE created_at >= ?
    `, [launchDate]);

    // Users who have used the feature at least once
    const adoptedUsers = await this.db.get(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM events
      WHERE event_name = ?
      AND timestamp >= ?
    `, [featureEvent, launchDate]);

    const adoptionRate = totalUsers.count > 0
      ? (adoptedUsers.count / totalUsers.count) * 100
      : 0;

    return {
      feature_event: featureEvent,
      launch_date: launchDate,
      total_users: totalUsers.count,
      adopted_users: adoptedUsers.count,
      adoption_rate: Math.round(adoptionRate * 100) / 100
    };
  }

  // Get feature stickiness (DAU/MAU ratio)
  async getFeatureStickiness(featureEvent, date = new Date().toISOString()) {
    const targetDate = new Date(date);

    // Daily active users (last 24 hours)
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dau = await this.db.get(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM events
      WHERE event_name = ?
      AND timestamp BETWEEN ? AND ?
    `, [featureEvent, dayStart.toISOString(), dayEnd.toISOString()]);

    // Monthly active users (last 30 days)
    const monthStart = new Date(targetDate);
    monthStart.setDate(monthStart.getDate() - 30);

    const mau = await this.db.get(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM events
      WHERE event_name = ?
      AND timestamp BETWEEN ? AND ?
    `, [featureEvent, monthStart.toISOString(), dayEnd.toISOString()]);

    const stickiness = mau.count > 0
      ? (dau.count / mau.count) * 100
      : 0;

    return {
      feature_event: featureEvent,
      date: targetDate.toISOString().split('T')[0],
      dau: dau.count,
      mau: mau.count,
      stickiness: Math.round(stickiness * 100) / 100
    };
  }

  // Get power users of a feature
  async getPowerUsers(featureEvent, startDate, endDate, minUsage = 10) {
    const users = await this.db.all(`
      SELECT
        user_id,
        COUNT(*) as usage_count,
        MIN(timestamp) as first_use,
        MAX(timestamp) as last_use
      FROM events
      WHERE event_name = ?
      AND timestamp BETWEEN ? AND ?
      GROUP BY user_id
      HAVING usage_count >= ?
      ORDER BY usage_count DESC
      LIMIT 100
    `, [featureEvent, startDate, endDate, minUsage]);

    return users.map(u => ({
      user_id: u.user_id,
      usage_count: u.usage_count,
      first_use: u.first_use,
      last_use: u.last_use,
      days_active: Math.ceil(
        (new Date(u.last_use) - new Date(u.first_use)) / (1000 * 60 * 60 * 24)
      )
    }));
  }

  // Get feature usage frequency distribution
  async getUsageDistribution(featureEvent, startDate, endDate) {
    const usageCounts = await this.db.all(`
      SELECT
        user_id,
        COUNT(*) as usage_count
      FROM events
      WHERE event_name = ?
      AND timestamp BETWEEN ? AND ?
      GROUP BY user_id
    `, [featureEvent, startDate, endDate]);

    // Create distribution buckets
    const buckets = {
      '1': 0,
      '2-5': 0,
      '6-10': 0,
      '11-20': 0,
      '21-50': 0,
      '51+': 0
    };

    usageCounts.forEach(u => {
      if (u.usage_count === 1) buckets['1']++;
      else if (u.usage_count <= 5) buckets['2-5']++;
      else if (u.usage_count <= 10) buckets['6-10']++;
      else if (u.usage_count <= 20) buckets['11-20']++;
      else if (u.usage_count <= 50) buckets['21-50']++;
      else buckets['51+']++;
    });

    const total = usageCounts.length;

    return {
      feature_event: featureEvent,
      total_users: total,
      distribution: Object.entries(buckets).map(([range, count]) => ({
        usage_range: range,
        user_count: count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0
      }))
    };
  }

  // Compare feature adoption across cohorts
  async compareFeatureAcrossCohorts(featureEvent) {
    const cohorts = await this.db.all(`
      SELECT DISTINCT cohort_id
      FROM users
      WHERE cohort_id IS NOT NULL
    `);

    const results = [];

    for (const { cohort_id } of cohorts) {
      // Total users in cohort
      const totalUsers = await this.db.get(`
        SELECT COUNT(*) as count
        FROM users
        WHERE cohort_id = ?
      `, [cohort_id]);

      // Users who adopted the feature
      const adoptedUsers = await this.db.get(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM events
        WHERE event_name = ?
        AND user_id IN (SELECT id FROM users WHERE cohort_id = ?)
      `, [featureEvent, cohort_id]);

      // Average usage per user
      const avgUsage = await this.db.get(`
        SELECT AVG(usage_count) as avg
        FROM (
          SELECT user_id, COUNT(*) as usage_count
          FROM events
          WHERE event_name = ?
          AND user_id IN (SELECT id FROM users WHERE cohort_id = ?)
          GROUP BY user_id
        )
      `, [featureEvent, cohort_id]);

      const adoptionRate = totalUsers.count > 0
        ? (adoptedUsers.count / totalUsers.count) * 100
        : 0;

      results.push({
        cohort_id,
        total_users: totalUsers.count,
        adopted_users: adoptedUsers.count,
        adoption_rate: Math.round(adoptionRate * 100) / 100,
        avg_usage_per_user: Math.round((avgUsage.avg || 0) * 100) / 100
      });
    }

    return results;
  }

  // Get time to feature adoption (how long after signup do users try a feature)
  async getTimeToAdoption(featureEvent, limit = 100) {
    const adoptions = await this.db.all(`
      SELECT
        u.id as user_id,
        u.created_at as signup_date,
        MIN(e.timestamp) as first_use,
        (julianday(MIN(e.timestamp)) - julianday(u.created_at)) * 24 * 60 as minutes_to_adoption
      FROM users u
      JOIN events e ON u.id = e.user_id
      WHERE e.event_name = ?
      GROUP BY u.id
      ORDER BY minutes_to_adoption
      LIMIT ?
    `, [featureEvent, limit]);

    if (adoptions.length === 0) {
      return {
        feature_event: featureEvent,
        sample_size: 0,
        avg_minutes: 0,
        median_minutes: 0
      };
    }

    const times = adoptions.map(a => a.minutes_to_adoption);
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;

    // Calculate median
    times.sort((a, b) => a - b);
    const median = times.length % 2 === 0
      ? (times[times.length / 2 - 1] + times[times.length / 2]) / 2
      : times[Math.floor(times.length / 2)];

    return {
      feature_event: featureEvent,
      sample_size: adoptions.length,
      avg_minutes: Math.round(avgTime * 100) / 100,
      median_minutes: Math.round(median * 100) / 100,
      avg_hours: Math.round((avgTime / 60) * 100) / 100,
      avg_days: Math.round((avgTime / (60 * 24)) * 100) / 100
    };
  }
}

module.exports = FeatureAdoption;
