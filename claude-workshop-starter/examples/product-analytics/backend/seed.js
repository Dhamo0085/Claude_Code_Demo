const Database = require('./database');

// Sample data generators
const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zoe'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Japan', 'Australia', 'Brazil', 'India'];
const cities = {
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'],
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Vasteras'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  'Brazil': ['Sao Paulo', 'Rio de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']
};

const devices = ['desktop', 'mobile', 'tablet'];
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const plans = ['free', 'starter', 'pro', 'enterprise'];
const sources = ['organic', 'paid', 'referral', 'direct', 'social'];

// Event names for a SaaS product
const events = {
  onboarding: ['signup', 'email_verified', 'profile_completed', 'first_project_created'],
  core: ['dashboard_viewed', 'project_opened', 'file_uploaded', 'report_generated', 'data_exported'],
  engagement: ['invite_sent', 'comment_added', 'task_created', 'notification_clicked'],
  conversion: ['upgrade_viewed', 'payment_info_entered', 'subscription_purchased'],
  feature: ['ai_assistant_used', 'template_applied', 'integration_connected', 'automation_created'],
  retention: ['weekly_report_viewed', 'mobile_app_opened', 'settings_updated']
};

const allEvents = Object.values(events).flat();

// Utility functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateUserId() {
  return `user_${Date.now()}_${randomInt(1000, 9999)}`;
}

function generateSessionId() {
  return `session_${Date.now()}_${randomInt(1000, 9999)}`;
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'example.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(domains)}`;
}

// Main seeding class
class DataSeeder {
  constructor(db) {
    this.db = db;
    this.users = [];
    this.cohorts = [];
    this.experiments = [];
    this.funnels = [];
  }

  async seed() {
    console.log('Starting data seeding...\n');

    try {
      await this.createCohorts();
      await this.createUsers();
      await this.createExperiments();
      await this.createFunnels();
      await this.generateEvents();

      console.log('\n' + '='.repeat(60));
      console.log('Data seeding completed successfully!');
      console.log('='.repeat(60));
      console.log(`Total users created: ${this.users.length}`);
      console.log(`Total cohorts created: ${this.cohorts.length}`);
      console.log(`Total experiments created: ${this.experiments.length}`);
      console.log(`Total funnels created: ${this.funnels.length}`);
      console.log('='.repeat(60));
    } catch (error) {
      console.error('Error during seeding:', error);
      throw error;
    }
  }

  async createCohorts() {
    console.log('Creating cohorts...');

    const cohortDefinitions = [
      {
        id: 'early_adopters',
        name: 'Early Adopters',
        description: 'Users who signed up in the first month',
        criteria: { signup_period: 'first_month' }
      },
      {
        id: 'power_users',
        name: 'Power Users',
        description: 'Users with high engagement levels',
        criteria: { engagement: 'high' }
      },
      {
        id: 'enterprise_customers',
        name: 'Enterprise Customers',
        description: 'Users on enterprise plans',
        criteria: { plan: 'enterprise' }
      },
      {
        id: 'at_risk',
        name: 'At Risk',
        description: 'Users showing signs of churn',
        criteria: { engagement: 'low', last_active: '30_days' }
      },
      {
        id: 'mobile_first',
        name: 'Mobile First',
        description: 'Users primarily using mobile devices',
        criteria: { device: 'mobile' }
      }
    ];

    for (const cohort of cohortDefinitions) {
      await this.db.run(
        'INSERT INTO cohorts (id, name, description, criteria) VALUES (?, ?, ?, ?)',
        [cohort.id, cohort.name, cohort.description, JSON.stringify(cohort.criteria)]
      );
      this.cohorts.push(cohort);
    }

    console.log(`Created ${this.cohorts.length} cohorts`);
  }

  async createUsers() {
    console.log('Creating users...');

    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Create 100 users with varying signup dates
    for (let i = 0; i < 100; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = generateEmail(firstName, lastName);
      const userId = generateUserId();
      const createdAt = randomDate(sixMonthsAgo, now);
      const plan = randomElement(plans);
      const source = randomElement(sources);

      // Assign cohort based on characteristics
      let cohortId = null;
      if (createdAt < new Date(sixMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        cohortId = 'early_adopters';
      } else if (plan === 'enterprise') {
        cohortId = 'enterprise_customers';
      } else if (Math.random() > 0.7) {
        cohortId = 'power_users';
      }

      const properties = {
        plan,
        source,
        onboarding_completed: Math.random() > 0.2,
        industry: randomElement(['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing']),
        company_size: randomElement(['1-10', '11-50', '51-200', '201-500', '500+'])
      };

      await this.db.run(
        `INSERT INTO users (id, email, name, created_at, properties, cohort_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          email,
          `${firstName} ${lastName}`,
          createdAt.toISOString(),
          JSON.stringify(properties),
          cohortId
        ]
      );

      this.users.push({
        id: userId,
        email,
        name: `${firstName} ${lastName}`,
        created_at: createdAt,
        properties,
        cohort_id: cohortId
      });

      if ((i + 1) % 20 === 0) {
        console.log(`  Created ${i + 1} users...`);
      }
    }

    console.log(`Created ${this.users.length} users`);
  }

  async createExperiments() {
    console.log('Creating experiments...');

    const experimentDefinitions = [
      {
        id: 'pricing_page_test',
        name: 'Pricing Page Layout Test',
        description: 'Testing different pricing page layouts',
        variants: ['control', 'variant_a', 'variant_b'],
        goal_event: 'subscription_purchased',
        start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: null,
        status: 'running'
      },
      {
        id: 'onboarding_flow_test',
        name: 'Onboarding Flow Test',
        description: 'Testing simplified vs detailed onboarding',
        variants: ['control', 'simplified'],
        goal_event: 'first_project_created',
        start_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: null,
        status: 'running'
      },
      {
        id: 'feature_discovery_test',
        name: 'Feature Discovery Test',
        description: 'Testing in-app tooltips vs tutorial videos',
        variants: ['tooltips', 'videos', 'hybrid'],
        goal_event: 'ai_assistant_used',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: null,
        status: 'running'
      }
    ];

    for (const experiment of experimentDefinitions) {
      await this.db.run(
        `INSERT INTO experiments (id, name, description, variants, goal_event, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          experiment.id,
          experiment.name,
          experiment.description,
          JSON.stringify(experiment.variants),
          experiment.goal_event,
          experiment.start_date,
          experiment.end_date,
          experiment.status
        ]
      );

      this.experiments.push(experiment);

      // Assign users to experiment variants
      const variants = experiment.variants;
      for (const user of this.users) {
        if (new Date(user.created_at) >= new Date(experiment.start_date)) {
          const variant = randomElement(variants);
          await this.db.run(
            'INSERT INTO experiment_assignments (experiment_id, user_id, variant) VALUES (?, ?, ?)',
            [experiment.id, user.id, variant]
          );
        }
      }
    }

    console.log(`Created ${this.experiments.length} experiments`);
  }

  async createFunnels() {
    console.log('Creating funnels...');

    const funnelDefinitions = [
      {
        name: 'Onboarding Funnel',
        description: 'Track users through the onboarding process',
        steps: ['signup', 'email_verified', 'profile_completed', 'first_project_created'],
        created_by: 'admin'
      },
      {
        name: 'Conversion Funnel',
        description: 'Track users from signup to purchase',
        steps: ['signup', 'dashboard_viewed', 'upgrade_viewed', 'payment_info_entered', 'subscription_purchased'],
        created_by: 'admin'
      },
      {
        name: 'Feature Adoption Funnel',
        description: 'Track AI assistant feature adoption',
        steps: ['dashboard_viewed', 'project_opened', 'ai_assistant_used'],
        created_by: 'admin'
      },
      {
        name: 'Engagement Funnel',
        description: 'Track user engagement actions',
        steps: ['dashboard_viewed', 'project_opened', 'file_uploaded', 'invite_sent'],
        created_by: 'admin'
      }
    ];

    for (const funnel of funnelDefinitions) {
      const result = await this.db.run(
        'INSERT INTO funnels (name, description, steps, created_by) VALUES (?, ?, ?, ?)',
        [funnel.name, funnel.description, JSON.stringify(funnel.steps), funnel.created_by]
      );

      this.funnels.push({ ...funnel, id: result.id });
    }

    console.log(`Created ${this.funnels.length} funnels`);
  }

  async generateEvents() {
    console.log('Generating events...');
    console.log('This may take a few minutes...\n');

    let totalEvents = 0;
    const now = new Date();

    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      const userStartDate = new Date(user.created_at);

      // Determine user engagement level
      const engagementLevel = Math.random();
      const isActive = engagementLevel > 0.3; // 70% active users
      const isPowerUser = engagementLevel > 0.8; // 20% power users

      // Generate events for this user
      const userEvents = [];

      // 1. Onboarding events (if they completed onboarding)
      if (user.properties.onboarding_completed) {
        const onboardingEvents = events.onboarding;
        let eventTime = new Date(userStartDate);

        for (const eventName of onboardingEvents) {
          // Space out onboarding events over first few hours/days
          eventTime = new Date(eventTime.getTime() + randomInt(10, 120) * 60 * 1000);
          userEvents.push({ event_name: eventName, timestamp: eventTime });
        }
      } else {
        // Partial onboarding
        userEvents.push({ event_name: 'signup', timestamp: userStartDate });
        if (Math.random() > 0.5) {
          const verifyTime = new Date(userStartDate.getTime() + randomInt(5, 60) * 60 * 1000);
          userEvents.push({ event_name: 'email_verified', timestamp: verifyTime });
        }
      }

      // 2. Generate ongoing activity events
      if (isActive) {
        let currentDate = new Date(userStartDate.getTime() + 24 * 60 * 60 * 1000); // Start day after signup

        while (currentDate < now) {
          // Determine if user is active this day
          const dayActivityChance = isPowerUser ? 0.7 : 0.3;

          if (Math.random() < dayActivityChance) {
            // Generate a session
            const sessionId = generateSessionId();
            const sessionStart = new Date(
              currentDate.getTime() + randomInt(8, 20) * 60 * 60 * 1000 // 8am-8pm
            );

            // Number of events in session
            const sessionEventCount = isPowerUser ? randomInt(5, 20) : randomInt(2, 8);

            let sessionTime = sessionStart;
            const country = randomElement(countries);
            const device = randomElement(devices);
            const browser = randomElement(browsers);

            for (let j = 0; j < sessionEventCount; j++) {
              // Select events based on user behavior
              let eventCategory;
              const rand = Math.random();

              if (rand < 0.5) {
                eventCategory = 'core';
              } else if (rand < 0.7) {
                eventCategory = 'engagement';
              } else if (rand < 0.85) {
                eventCategory = 'feature';
              } else if (rand < 0.95) {
                eventCategory = 'retention';
              } else {
                eventCategory = 'conversion';
              }

              const eventName = randomElement(events[eventCategory]);

              // Time between events in session (1-10 minutes)
              sessionTime = new Date(sessionTime.getTime() + randomInt(1, 10) * 60 * 1000);

              userEvents.push({
                event_name: eventName,
                timestamp: sessionTime,
                session_id: sessionId,
                country,
                device_type: device,
                browser
              });
            }
          }

          // Move to next day
          currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        }
      }

      // 3. Insert all events for this user
      for (const event of userEvents) {
        if (event.timestamp <= now) {
          const country = event.country || randomElement(countries);
          const city = randomElement(cities[country] || ['Unknown']);

          await this.db.run(
            `INSERT INTO events (
              event_name, user_id, timestamp, session_id,
              page_url, referrer, device_type, browser, country, city, properties
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              event.event_name,
              user.id,
              event.timestamp.toISOString(),
              event.session_id || generateSessionId(),
              `/${event.event_name.replace(/_/g, '-')}`,
              Math.random() > 0.7 ? 'https://google.com' : null,
              event.device_type || randomElement(devices),
              event.browser || randomElement(browsers),
              country,
              city,
              JSON.stringify({
                plan: user.properties.plan,
                source: user.properties.source
              })
            ]
          );

          totalEvents++;
        }
      }

      // Update user last_seen
      if (userEvents.length > 0) {
        const lastEvent = userEvents[userEvents.length - 1];
        await this.db.run(
          'UPDATE users SET last_seen = ? WHERE id = ?',
          [lastEvent.timestamp.toISOString(), user.id]
        );
      }

      if ((i + 1) % 10 === 0) {
        console.log(`  Generated events for ${i + 1}/${this.users.length} users... (${totalEvents} events total)`);
      }
    }

    console.log(`\nGenerated ${totalEvents} total events`);
  }
}

// Main execution
async function main() {
  const db = new Database('./analytics.db');

  try {
    console.log('Initializing database...');
    await db.initialize();

    console.log('Database initialized\n');

    // Ask user if they want to clear existing data
    console.log('WARNING: This will populate the database with sample data.');
    console.log('If data already exists, it will be added to existing data.\n');

    const seeder = new DataSeeder(db);
    await seeder.seed();

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run seeder
if (require.main === module) {
  main().then(() => {
    console.log('\nSeeding complete. You can now start the server with: npm start');
    process.exit(0);
  }).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = DataSeeder;
