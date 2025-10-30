const API_BASE_URL = 'http://localhost:3001/api'

class API {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health')
  }

  // Events
  async getEvents(startDate, endDate, eventName = null) {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
    if (eventName) params.append('event_name', eventName)
    return this.request(`/events?${params}`)
  }

  async getEventCount(eventName, startDate, endDate) {
    const params = new URLSearchParams({ event_name: eventName, start_date: startDate, end_date: endDate })
    return this.request(`/events/count?${params}`)
  }

  async trackEvent(eventData) {
    return this.request('/events/track', {
      method: 'POST',
      body: JSON.stringify(eventData)
    })
  }

  // Users
  async getUsers(limit = 100, offset = 0) {
    return this.request(`/users?limit=${limit}&offset=${offset}`)
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`)
  }

  async getUserStats(startDate, endDate) {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
    return this.request(`/users/stats?${params}`)
  }

  // Funnels
  async analyzeFunnel(steps, startDate, endDate, cohortId = null) {
    return this.request('/funnels/analyze', {
      method: 'POST',
      body: JSON.stringify({ steps, start_date: startDate, end_date: endDate, cohort_id: cohortId })
    })
  }

  async getFunnelTimings(steps, startDate, endDate) {
    return this.request('/funnels/timings', {
      method: 'POST',
      body: JSON.stringify({ steps, start_date: startDate, end_date: endDate })
    })
  }

  async getFunnelBreakdown(steps, startDate, endDate, breakdownProperty) {
    return this.request('/funnels/breakdown', {
      method: 'POST',
      body: JSON.stringify({ steps, start_date: startDate, end_date: endDate, breakdown_property: breakdownProperty })
    })
  }

  async getFunnels() {
    return this.request('/funnels')
  }

  async createFunnel(name, description, steps, createdBy) {
    return this.request('/funnels', {
      method: 'POST',
      body: JSON.stringify({ name, description, steps, created_by: createdBy })
    })
  }

  // Retention
  async getRetention(cohortSize = 'week', periods = 12) {
    return this.request(`/retention?cohort_size=${cohortSize}&periods=${periods}`)
  }

  async getDayNRetention(days = [1, 7, 30]) {
    return this.request(`/retention/day-n?days=${days.join(',')}`)
  }

  async getChurnRate(period = 'month') {
    return this.request(`/retention/churn?period=${period}`)
  }

  async getSegmentedRetention(property, cohortSize = 'week') {
    return this.request(`/retention/segmented?property=${property}&cohort_size=${cohortSize}`)
  }

  // User Journeys
  async getTopPaths(startEvent = null, maxSteps = 5, limit = 10) {
    const params = new URLSearchParams({ max_steps: maxSteps, limit })
    if (startEvent) params.append('start_event', startEvent)
    return this.request(`/journeys/top-paths?${params}`)
  }

  async getUserJourney(userId, limit = 100) {
    return this.request(`/journeys/user/${userId}?limit=${limit}`)
  }

  async getConversionPaths(goalEvent, beforeSteps = 5, limit = 10) {
    const params = new URLSearchParams({ goal_event: goalEvent, before_steps: beforeSteps, limit })
    return this.request(`/journeys/conversion-paths?${params}`)
  }

  async getNextEvents(eventName, depth = 3) {
    return this.request(`/journeys/next-events?event_name=${eventName}&depth=${depth}`)
  }

  async getDropOffs(minEvents = 2) {
    return this.request(`/journeys/drop-offs?min_events=${minEvents}`)
  }

  async getSessionStats() {
    return this.request('/journeys/session-stats')
  }

  // Feature Adoption
  async getFeatureAdoption(event, startDate, endDate, granularity = 'day') {
    const params = new URLSearchParams({ event, start_date: startDate, end_date: endDate, granularity })
    return this.request(`/features/adoption?${params}`)
  }

  async getCumulativeAdoption(event, launchDate) {
    return this.request(`/features/cumulative?event=${event}&launch_date=${launchDate}`)
  }

  async getFeatureStickiness(event, date = null) {
    const params = new URLSearchParams({ event })
    if (date) params.append('date', date)
    return this.request(`/features/stickiness?${params}`)
  }

  async getPowerUsers(event, startDate, endDate, minUsage = 10) {
    const params = new URLSearchParams({ event, start_date: startDate, end_date: endDate, min_usage: minUsage })
    return this.request(`/features/power-users?${params}`)
  }

  async getUsageDistribution(event, startDate, endDate) {
    const params = new URLSearchParams({ event, start_date: startDate, end_date: endDate })
    return this.request(`/features/distribution?${params}`)
  }

  async getFeatureCohortComparison(event) {
    return this.request(`/features/cohort-comparison?event=${event}`)
  }

  async getTimeToAdoption(event, limit = 100) {
    return this.request(`/features/time-to-adoption?event=${event}&limit=${limit}`)
  }

  // Experiments
  async getExperiments() {
    return this.request('/experiments')
  }

  async getExperiment(experimentId) {
    return this.request(`/experiments/${experimentId}`)
  }

  async createExperiment(experiment) {
    return this.request('/experiments', {
      method: 'POST',
      body: JSON.stringify(experiment)
    })
  }

  async getExperimentResults(experimentId) {
    return this.request(`/experiments/${experimentId}/results`)
  }

  async assignToExperiment(experimentId, userId, variant) {
    return this.request(`/experiments/${experimentId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, variant })
    })
  }

  // Cohorts
  async getCohorts() {
    return this.request('/cohorts')
  }

  async getCohort(cohortId) {
    return this.request(`/cohorts/${cohortId}`)
  }

  async createCohort(cohort) {
    return this.request('/cohorts', {
      method: 'POST',
      body: JSON.stringify(cohort)
    })
  }
}

export default new API()
