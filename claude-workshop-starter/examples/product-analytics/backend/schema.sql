-- Product Analytics Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME,
    properties TEXT, -- JSON string for custom properties
    cohort_id TEXT
);

-- Events table - core tracking
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    properties TEXT, -- JSON string for event properties
    session_id TEXT,
    page_url TEXT,
    referrer TEXT,
    device_type TEXT,
    browser TEXT,
    country TEXT,
    city TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Funnels table - define conversion paths
CREATE TABLE IF NOT EXISTS funnels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    steps TEXT NOT NULL, -- JSON array of event names
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);

-- Cohorts table - user segments
CREATE TABLE IF NOT EXISTS cohorts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    criteria TEXT, -- JSON string defining cohort criteria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_count INTEGER DEFAULT 0
);

-- Experiments (A/B Tests) table
CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'running', -- running, paused, completed
    variants TEXT, -- JSON array of variant names
    start_date DATETIME,
    end_date DATETIME,
    goal_event TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Experiment assignments
CREATE TABLE IF NOT EXISTS experiment_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    variant TEXT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(experiment_id, user_id)
);

-- Features table - track feature rollouts
CREATE TABLE IF NOT EXISTS features (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    launch_date DATETIME,
    target_event TEXT, -- Event that indicates feature usage
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_users_cohort_id ON users(cohort_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_user ON experiment_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_exp ON experiment_assignments(experiment_id);
