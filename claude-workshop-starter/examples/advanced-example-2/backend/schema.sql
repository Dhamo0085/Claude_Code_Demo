-- Enterprise B2B Pilot Program Manager Database Schema

-- Pilots table: Core pilot program information
CREATE TABLE IF NOT EXISTS pilots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Active', 'At Risk', 'Completed', 'Converted', 'Lost')),
  health_score INTEGER DEFAULT 0 CHECK(health_score >= 0 AND health_score <= 100),
  contract_value INTEGER NOT NULL,
  arr_projection INTEGER NOT NULL,
  conversion_probability INTEGER CHECK(conversion_probability >= 0 AND conversion_probability <= 100),
  primary_contact TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Success Criteria: Define what success looks like for each pilot
CREATE TABLE IF NOT EXISTS success_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pilot_id INTEGER NOT NULL,
  criteria TEXT NOT NULL,
  target_value TEXT NOT NULL,
  current_value TEXT,
  status TEXT CHECK(status IN ('Not Started', 'In Progress', 'At Risk', 'Achieved', 'Failed')),
  weight INTEGER DEFAULT 1 CHECK(weight >= 1 AND weight <= 5),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(pilot_id) REFERENCES pilots(id) ON DELETE CASCADE
);

-- Stakeholders: Key people involved in each pilot
CREATE TABLE IF NOT EXISTS stakeholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pilot_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  engagement_level TEXT CHECK(engagement_level IN ('High', 'Medium', 'Low', 'Unresponsive')),
  last_contact TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(pilot_id) REFERENCES pilots(id) ON DELETE CASCADE
);

-- Metrics: Track quantitative metrics over time
CREATE TABLE IF NOT EXISTS metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pilot_id INTEGER NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value TEXT NOT NULL,
  metric_type TEXT CHECK(metric_type IN ('usage', 'adoption', 'satisfaction', 'performance', 'engagement')),
  recorded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(pilot_id) REFERENCES pilots(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pilots_status ON pilots(status);
CREATE INDEX IF NOT EXISTS idx_pilots_health_score ON pilots(health_score);
CREATE INDEX IF NOT EXISTS idx_success_criteria_pilot ON success_criteria(pilot_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_pilot ON stakeholders(pilot_id);
CREATE INDEX IF NOT EXISTS idx_metrics_pilot ON metrics(pilot_id);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON metrics(recorded_at);
