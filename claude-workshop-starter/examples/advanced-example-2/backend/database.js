const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor(dbPath = './pilots.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  // Initialize database connection and create tables
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
          return;
        }
        console.log('Connected to SQLite database');

        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('Error enabling foreign keys:', err.message);
            reject(err);
            return;
          }

          // Create tables from schema
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        });
      });
    });
  }

  // Create tables from schema.sql
  async createTables() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    return new Promise((resolve, reject) => {
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('Error creating tables:', err.message);
          reject(err);
          return;
        }
        console.log('Database tables created successfully');
        resolve();
      });
    });
  }

  // Generic query helper - returns all rows
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Query error:', err.message);
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  // Get single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Get error:', err.message);
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  // Run query (INSERT, UPDATE, DELETE) - returns lastID and changes
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Run error:', err.message);
          reject(err);
          return;
        }
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      });
    });
  }

  // Transaction helper
  async transaction(callback) {
    await this.run('BEGIN TRANSACTION');
    try {
      const result = await callback();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // Pilots CRUD operations
  async getAllPilots() {
    return this.query(`
      SELECT * FROM pilots
      ORDER BY
        CASE status
          WHEN 'At Risk' THEN 1
          WHEN 'Active' THEN 2
          WHEN 'Completed' THEN 3
          WHEN 'Converted' THEN 4
          WHEN 'Lost' THEN 5
        END,
        health_score ASC
    `);
  }

  async getPilotById(id) {
    return this.get('SELECT * FROM pilots WHERE id = ?', [id]);
  }

  async createPilot(pilot) {
    const {
      company_name, industry, start_date, end_date, status,
      health_score, contract_value, arr_projection,
      conversion_probability, primary_contact, notes
    } = pilot;

    const result = await this.run(`
      INSERT INTO pilots
      (company_name, industry, start_date, end_date, status, health_score,
       contract_value, arr_projection, conversion_probability, primary_contact, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      company_name, industry, start_date, end_date, status,
      health_score || 0, contract_value, arr_projection,
      conversion_probability, primary_contact, notes
    ]);

    return this.getPilotById(result.lastID);
  }

  async updatePilot(id, updates) {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    await this.run(`UPDATE pilots SET ${fields} WHERE id = ?`, values);
    return this.getPilotById(id);
  }

  async deletePilot(id) {
    const result = await this.run('DELETE FROM pilots WHERE id = ?', [id]);
    return { success: result.changes > 0, changes: result.changes };
  }

  // Success Criteria operations
  async getSuccessCriteria(pilotId) {
    return this.query(
      'SELECT * FROM success_criteria WHERE pilot_id = ? ORDER BY weight DESC, id',
      [pilotId]
    );
  }

  async createSuccessCriteria(criteria) {
    const { pilot_id, criteria: text, target_value, current_value, status, weight } = criteria;
    const result = await this.run(`
      INSERT INTO success_criteria
      (pilot_id, criteria, target_value, current_value, status, weight)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [pilot_id, text, target_value, current_value, status, weight || 1]);

    return this.get('SELECT * FROM success_criteria WHERE id = ?', [result.lastID]);
  }

  async updateSuccessCriteria(id, updates) {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    await this.run(`UPDATE success_criteria SET ${fields} WHERE id = ?`, values);
    return this.get('SELECT * FROM success_criteria WHERE id = ?', [id]);
  }

  // Stakeholders operations
  async getStakeholders(pilotId) {
    return this.query(
      'SELECT * FROM stakeholders WHERE pilot_id = ? ORDER BY engagement_level, name',
      [pilotId]
    );
  }

  async createStakeholder(stakeholder) {
    const { pilot_id, name, role, email, engagement_level, last_contact } = stakeholder;
    const result = await this.run(`
      INSERT INTO stakeholders
      (pilot_id, name, role, email, engagement_level, last_contact)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [pilot_id, name, role, email, engagement_level, last_contact]);

    return this.get('SELECT * FROM stakeholders WHERE id = ?', [result.lastID]);
  }

  // Metrics operations
  async getMetrics(pilotId) {
    return this.query(
      'SELECT * FROM metrics WHERE pilot_id = ? ORDER BY recorded_at DESC',
      [pilotId]
    );
  }

  async getMetricsByType(pilotId, metricType) {
    return this.query(
      'SELECT * FROM metrics WHERE pilot_id = ? AND metric_type = ? ORDER BY recorded_at DESC',
      [pilotId, metricType]
    );
  }

  async createMetric(metric) {
    const { pilot_id, metric_name, metric_value, metric_type } = metric;
    const result = await this.run(`
      INSERT INTO metrics
      (pilot_id, metric_name, metric_value, metric_type)
      VALUES (?, ?, ?, ?)
    `, [pilot_id, metric_name, metric_value, metric_type]);

    return this.get('SELECT * FROM metrics WHERE id = ?', [result.lastID]);
  }

  // Get pilot with all related data
  async getPilotWithDetails(id) {
    const pilot = await this.getPilotById(id);
    if (!pilot) return null;

    const [criteria, stakeholders, metrics] = await Promise.all([
      this.getSuccessCriteria(id),
      this.getStakeholders(id),
      this.getMetrics(id)
    ]);

    return {
      ...pilot,
      success_criteria: criteria,
      stakeholders: stakeholders,
      metrics: metrics
    };
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          reject(err);
          return;
        }
        console.log('Database connection closed');
        resolve();
      });
    });
  }
}

module.exports = Database;
