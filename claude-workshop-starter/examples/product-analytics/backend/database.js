const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor(dbPath = './analytics.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  async createTables() {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      await this.run(statement);
    }
    console.log('Database tables created successfully');
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Error executing SQL:', sql);
          console.error('Error:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Error executing SQL:', sql);
          console.error('Error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error executing SQL:', sql);
          console.error('Error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Event tracking methods
  async trackEvent(eventData) {
    const {
      event_name,
      user_id,
      properties = {},
      session_id,
      page_url,
      referrer,
      device_type,
      browser,
      country,
      city
    } = eventData;

    const result = await this.run(
      `INSERT INTO events (
        event_name, user_id, properties, session_id,
        page_url, referrer, device_type, browser, country, city
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event_name,
        user_id,
        JSON.stringify(properties),
        session_id,
        page_url,
        referrer,
        device_type,
        browser,
        country,
        city
      ]
    );

    // Update user last_seen
    await this.run(
      'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?',
      [user_id]
    );

    return result;
  }

  // User methods
  async createUser(userData) {
    const { id, email, name, properties = {}, cohort_id } = userData;

    const result = await this.run(
      `INSERT INTO users (id, email, name, properties, cohort_id)
       VALUES (?, ?, ?, ?, ?)`,
      [id, email, name, JSON.stringify(properties), cohort_id]
    );

    return result;
  }

  async getUser(userId) {
    const user = await this.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (user && user.properties) {
      user.properties = JSON.parse(user.properties);
    }
    return user;
  }

  async getUserOrCreate(userId, userData = {}) {
    let user = await this.getUser(userId);
    if (!user) {
      await this.createUser({ id: userId, ...userData });
      user = await this.getUser(userId);
    }
    return user;
  }

  // Analytics query methods
  async getEventsByTimeRange(startDate, endDate, eventName = null) {
    let sql = 'SELECT * FROM events WHERE timestamp BETWEEN ? AND ?';
    const params = [startDate, endDate];

    if (eventName) {
      sql += ' AND event_name = ?';
      params.push(eventName);
    }

    sql += ' ORDER BY timestamp DESC';
    return await this.all(sql, params);
  }

  async getUniqueUsers(startDate, endDate) {
    const result = await this.get(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM events
       WHERE timestamp BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    return result.count;
  }

  async getEventCount(eventName, startDate, endDate) {
    const result = await this.get(
      `SELECT COUNT(*) as count
       FROM events
       WHERE event_name = ? AND timestamp BETWEEN ? AND ?`,
      [eventName, startDate, endDate]
    );
    return result.count;
  }
}

module.exports = Database;
